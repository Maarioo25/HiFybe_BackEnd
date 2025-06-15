const fetch = require('node-fetch');
const User = require('../models/usuario');

exports.getPublicPlaylistByUserAndId = async (req, res) => {
  const { userId, playlistId } = req.params;

  try {
    const usuario = await User.findById(userId);
    if (!usuario || !usuario.spotifyAccessToken) {
      return res.status(404).json({ mensaje: 'Usuario no vinculado a Spotify o no encontrado' });
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${usuario.spotifyAccessToken}` }
    });

    if (!response.ok) {
      const texto = await response.text();
      console.error('Spotify error:', response.status, texto);
      return res.status(response.status).json({ mensaje: 'Error al cargar playlist de Spotify' });
    }

    const playlist = await response.json();

    res.json({
      nombre: playlist.name,
      descripcion: playlist.description,
      imagen: playlist.images?.[0]?.url,
      owner: { nombre: playlist.owner?.display_name || 'Desconocido' },
      canciones: (playlist.tracks.items || []).map(item => {
        const track = item.track;
        return {
          _id: track.id,
          title: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          duration: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
          cover: track.album.images?.[0]?.url,
          uri: track.uri
        };
      })
    });
  } catch (err) {
    console.error('Error en getPublicPlaylistByUserAndId:', err);
    res.status(500).json({ mensaje: 'Error en el servidor al obtener la playlist de Spotify' });
  }
};
