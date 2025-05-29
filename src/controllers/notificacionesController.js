const Notificacion = require('../models/notificacion');

exports.obtenerNotificaciones = async (req, res) => {
  const notificaciones = await Notificacion.find({ usuario_id: req.params.usuarioId });
  res.json(notificaciones);
};

exports.crearNotificacion = async (req, res) => {
  try {
    const { usuario_id, contenido } = req.body;
    const notificacion = await Notificacion.create({ usuario_id, contenido });
    res.status(201).json(notificacion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la notificación' });
  }
};


exports.marcarNotificacionLeida = async (req, res) => {
  const notificacion = await Notificacion.findByIdAndUpdate(req.params.id, { leido: true }, { new: true });
  res.json(notificacion);
};

exports.eliminarNotificacion = async (req, res) => {
  await Notificacion.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Notificación eliminada' });
};
