// controllers/playlistsController.js

const Playlist = require('../models/playlist');
const PlaylistCancion = require('../models/playlistCancion');
const Cancion = require('../models/cancion');

// Obtener todas las playlists públicas
exports.obtenerPlaylists = async (req, res) => {
  try {
    // Buscamos solo las playlists donde es_publica = true
    const playlistsPublicas = await Playlist.find(
      { es_publica: true },
      // Proyectamos solo los campos que usará el front:
      // _id, nombre, descripcion, portada, usuario_id, fecha_creacion
      'nombre descripcion portada usuario_id fecha_creacion'
    ).populate('usuario_id', 'nombre'); 
    // Si tu modelo Usuario tiene campo "nombre", así obtienes el nombre del propietario.

    res.json(playlistsPublicas);
  } catch (error) {
    console.error('Error al obtener playlists públicas:', error);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

exports.getPlaylistById = async (req, res) => {
  const { userId, playlistId } = req.params;
  try {
    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId })
      .populate('owner', 'nombre')
      .populate('canciones');
    if (!playlist) {
      return res.status(404).json({ mensaje: 'Playlist no encontrada' });
    }
    res.json(playlist);
  } catch (error) {
    console.error('Error al buscar playlist:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.crearPlaylist = async (req, res) => {
  try {
    // Se espera recibir en el body:
    // { nombre, descripcion, usuario_id, es_publica, portada }
    const playlist = await Playlist.create(req.body);
    // Devolvemos el objeto creado (201 = creado)
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error al crear playlist:', error);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

exports.actualizarPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    // Permitimos actualizar los campos: nombre, descripcion, es_publica, portada
    const playlist = await Playlist.findByIdAndUpdate(
      id,
      datosActualizados,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!playlist) {
      return res.status(404).json({ mensaje: 'Playlist no encontrada' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error al actualizar playlist:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ mensaje: 'Playlist no encontrada o ID inválido' });
    }
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

exports.eliminarPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findByIdAndDelete(id);

    if (!playlist) {
      return res.status(404).json({ mensaje: 'Playlist no encontrada' });
    }

    // Además, eliminamos todas las relaciones en PlaylistCancion para esta playlist
    await PlaylistCancion.deleteMany({ playlist_id: id });

    res.json({ mensaje: 'Playlist eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar playlist:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ mensaje: 'Playlist no encontrada o ID inválido' });
    }
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

exports.agregarCancionAPlaylist = async (req, res) => {
  try {
    const { id } = req.params;         // id de la playlist
    const { cancionId } = req.body;

    // Comprobamos que la playlist exista
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ mensaje: 'Playlist no encontrada' });
    }

    // Comprobamos que la canción exista
    const cancion = await Cancion.findById(cancionId);
    if (!cancion) {
      return res.status(404).json({ mensaje: 'Canción no encontrada' });
    }

    // Creamos la asociación en PlaylistCancion
    const nuevaEntrada = await PlaylistCancion.create({
      playlist_id: id,
      cancion_id: cancionId,
    });

    res.json(nuevaEntrada);
  } catch (error) {
    console.error('Error al agregar canción a playlist:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ mensaje: 'Playlist o Canción no encontrada (ID inválido)' });
    }
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

exports.eliminarCancionDePlaylist = async (req, res) => {
  try {
    const { id, cancionId } = req.params; // id de playlist y _id de Cancion

    // Verificamos que la playlist exista
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ mensaje: 'Playlist no encontrada' });
    }

    // Verificamos que la canción exista
    const cancion = await Cancion.findById(cancionId);
    if (!cancion) {
      return res.status(404).json({ mensaje: 'Canción no encontrada' });
    }

    // Borramos la entrada en PlaylistCancion
    const resultado = await PlaylistCancion.deleteOne({
      playlist_id: id,
      cancion_id: cancionId,
    });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ mensaje: 'La canción no estaba en la playlist' });
    }

    res.json({ mensaje: 'Canción eliminada de la playlist' });
  } catch (error) {
    console.error('Error al eliminar canción de playlist:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ mensaje: 'Playlist o Canción no encontrada (ID inválido)' });
    }
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};
