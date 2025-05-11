const Reproduccion = require('../models/reproduccion');

exports.registrarReproduccion = async (req, res) => {
  const reproduccion = await Reproduccion.create(req.body);
  res.json(reproduccion);
};

exports.obtenerReproduccionesUsuario = async (req, res) => {
  const reproducciones = await Reproduccion.find({ usuario_id: req.params.usuarioId });
  res.json(reproducciones);
};
