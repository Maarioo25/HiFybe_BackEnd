const Playlist = require('../models/playlist');
const PlaylistCancion = require('../models/playlistCancion');

exports.obtenerPlaylists = async (req, res) => {
  const playlists = await Playlist.find({ es_publica: true });
  res.json(playlists);
};

exports.obtenerPlaylistPorId = async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  res.json(playlist);
};

exports.crearPlaylist = async (req, res) => {
  const playlist = await Playlist.create(req.body);
  res.json(playlist);
};

exports.actualizarPlaylist = async (req, res) => {
  const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(playlist);
};

exports.eliminarPlaylist = async (req, res) => {
  await Playlist.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Playlist eliminada' });
};

exports.agregarCancionAPlaylist = async (req, res) => {
  const nuevaEntrada = await PlaylistCancion.create({
    playlist_id: req.params.id,
    ...req.body,
  });
  res.json(nuevaEntrada);
};

exports.eliminarCancionDePlaylist = async (req, res) => {
  await PlaylistCancion.deleteOne({
    playlist_id: req.params.id,
    cancion_id: req.params.cancionId,
  });
  res.json({ mensaje: 'Canción eliminada de la playlist' });
};
