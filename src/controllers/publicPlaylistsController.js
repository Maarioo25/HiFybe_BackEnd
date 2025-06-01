const Playlist = require('../models/playlist'); // o como sea tu modelo

exports.getPublicPlaylistByUserAndId = async (req, res) => {
  const { userId, playlistId } = req.params;
  try {
    const playlist = await Playlist.findOne({
      _id: playlistId,
      owner: userId,
      privada: false // ← si usas este campo para distinguirlas
    }).populate('canciones');

    if (!playlist) {
      return res.status(404).json({ mensaje: 'Playlist no encontrada' });
    }

    res.json({
      nombre: playlist.nombre,
      descripcion: playlist.descripcion,
      imagen: playlist.portada,
      owner: { nombre: playlist.ownerName || 'Desconocido' },
      canciones: playlist.canciones.map(c => ({
        _id: c._id,
        title: c.titulo,
        artist: c.artista,
        duration: c.duracion,
        cover: c.portada,
        uri: c.uri
      }))
    });
  } catch (err) {
    console.error('Error en getPublicPlaylistByUserAndId:', err);
    res.status(500).json({
      mensaje: 'Error en el servidor. Por favor, verifica que todos los campos estén correctamente completados.'
    });
  }
};
