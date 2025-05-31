const axios = require('axios');
const Usuario = require('../models/usuario');

const getSpotifyAppToken = async () => {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');
  const res = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return res.data.access_token;
};

exports.obtenerPlaylistsDeSpotify = async (req, res) => {
  try {
    const { userId } = req.params;

    const usuario = await Usuario.findById(userId);
    if (!usuario || !usuario.spotifyId) {
      return res
        .status(400)
        .json({ mensaje: 'El usuario no tiene Spotify vinculado' });
    }

    const token = await getSpotifyAppToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/users/${usuario.spotifyId}/playlists`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const playlists = response.data.items.map((p) => ({
      id: p.id,
      nombre: p.name,
      imagen: p.images[0]?.url || '',
      canciones: p.tracks.total,
      duracion: '---',
    }));

    res.json(playlists);
  } catch (error) {
    console.error(
      'Error al obtener playlists de Spotify:',
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ mensaje: 'Error al obtener playlists de Spotify' });
  }
};

exports.obtenerDetallePlaylistDeSpotify = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const token = await getSpotifyAppToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const p = response.data;
    const detalle = {
      id: p.id,
      nombre: p.name,
      descripcion: p.description || '',
      imagen: p.images[0]?.url || '',
      canciones: p.tracks.total,
    };

    res.json(detalle);
  } catch (error) {
    console.error(
      'Error al obtener detalles de playlist de Spotify:',
      error.response?.data || error.message
    );
    if (error.response?.status === 400 || error.response?.status === 404) {
      return res.status(400).json({ mensaje: 'ID de playlist inválido' });
    }
    res
      .status(500)
      .json({ mensaje: 'Error al obtener detalles de playlist de Spotify' });
  }
};

exports.obtenerTracksPlaylistDeSpotify = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const token = await getSpotifyAppToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 100,
        },
      }
    );

    const tracks = response.data.items.map((item) => {
      const track = item.track || {};
      return {
        trackId: track.id,
        title: track.name,
        artist: track.artists?.map((a) => a.name).join(', ') || '',
        album: track.album?.name || '',
        duracion: track.duration_ms || 0,
      };
    });

    res.json(tracks);
  } catch (error) {
    console.error(
      'Error al obtener canciones de playlist de Spotify:',
      error.response?.data || error.message
    );
    if (error.response?.status === 400 || error.response?.status === 404) {
      return res.status(400).json({ mensaje: 'ID de playlist inválido' });
    }
    res
      .status(500)
      .json({ mensaje: 'Error al obtener canciones de playlist de Spotify' });
  }
};

exports.obtenerRecomendacionesDeSpotify = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token de Spotify proporcionado' });

  try {
    const response = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        seed_genres: 'pop',
        limit: 10,
      },
    });

    const recomendaciones = response.data.tracks.map((track) => ({
      spotifyUri: track.uri,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      img: track.album.images?.[0]?.url || '',
    }));

    return res.json(recomendaciones);
  } catch (error) {
    console.error(
      'Error al obtener recomendaciones de Spotify:',
      error.response?.data || error.message
    );

    if (error.response?.status === 404) {
      return res.status(200).json([]);
    }

    return res.status(500).json({
      mensaje: 'Error al obtener recomendaciones de Spotify',
      spotify: error.response?.data || error.message,
    });
  }
};
s