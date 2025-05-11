const Cancion = require('../models/cancion');

exports.obtenerCanciones = async (req, res) => {
  const canciones = await Cancion.find();
  res.json(canciones);
};

exports.obtenerCancionPorId = async (req, res) => {
  const cancion = await Cancion.findById(req.params.id);
  res.json(cancion);
};

exports.crearCancion = async (req, res) => {
  const nuevaCancion = await Cancion.create(req.body);
  res.json(nuevaCancion);
};

exports.actualizarCancion = async (req, res) => {
  const cancion = await Cancion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(cancion);
};

exports.eliminarCancion = async (req, res) => {
  await Cancion.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Canción eliminada' });
};
