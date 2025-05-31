const axios = require('axios');
const Usuario = require('../models/usuario');

const getSpotifyAppToken = async () => {
  const credentials = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return res.data.access_token;
};

exports.obtenerPlaylistsDeSpotify = async (req, res) => {
  try {
    const { userId } = req.params;

    const usuario = await Usuario.findById(userId);
    if (!usuario || !usuario.spotifyId) {
      return res.status(400).json({ mensaje: 'El usuario no tiene Spotify vinculado' });
    }

    const token = await getSpotifyAppToken();
    const response = await axios.get(`https://api.spotify.com/v1/users/${usuario.spotifyId}/playlists`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const playlists = response.data.items.map(p => ({
      id: p.id,
      nombre: p.name,
      imagen: p.images[0]?.url || '',
      canciones: p.tracks.total,
      duracion: '---'
    }));

    res.json(playlists);
  } catch (error) {
    console.error('Error al obtener playlists de Spotify:', error.response?.data || error.message);
    res.status(500).json({ mensaje: 'Error al obtener playlists de Spotify' });
  }
};

exports.obtenerRecomendacionesDeSpotify = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token de Spotify proporcionado' });

  try {
    const response = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        seed_genres: 'pop',
        limit: 10
      }
    });

    const recomendaciones = response.data.tracks.map(track => ({
      spotifyUri: track.uri,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      img: track.album.images?.[0]?.url || ''
    }));

    return res.json(recomendaciones); // 👈 importante el return
  } catch (error) {
    console.error('Error al obtener recomendaciones de Spotify:', error.response?.data || error.message);

    // Si es un 404 desde Spotify, responde lista vacía
    if (error.response?.status === 404) {
      return res.status(200).json([]); // 👈 return evita doble respuesta
    }

    return res.status(500).json({
      mensaje: 'Error al obtener recomendaciones de Spotify',
      spotify: error.response?.data || error.message
    });
  }
};

