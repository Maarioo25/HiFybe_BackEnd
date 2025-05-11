const Notificacion = require('../models/notificacion');

exports.obtenerNotificaciones = async (req, res) => {
  const notificaciones = await Notificacion.find({ usuario_id: req.params.usuarioId });
  res.json(notificaciones);
};

exports.marcarNotificacionLeida = async (req, res) => {
  const notificacion = await Notificacion.findByIdAndUpdate(req.params.id, { leido: true }, { new: true });
  res.json(notificacion);
};

exports.eliminarNotificacion = async (req, res) => {
  await Notificacion.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Notificación eliminada' });
};
