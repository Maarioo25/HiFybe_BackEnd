const Conversacion = require('../models/conversacion');
const Mensaje = require('../models/mensaje');

exports.crearConversacion = async (req, res) => {
  const conversacion = await Conversacion.create(req.body);
  res.json(conversacion);
};

exports.obtenerConversacionesUsuario = async (req, res) => {
  const conversaciones = await Conversacion.find({
    $or: [{ usuario1_id: req.params.usuarioId }, { usuario2_id: req.params.usuarioId }],
  });
  res.json(conversaciones);
};

exports.obtenerMensajesConversacion = async (req, res) => {
  const mensajes = await Mensaje.find({ conversacion_id: req.params.id });
  res.json(mensajes);
};

exports.enviarMensaje = async (req, res) => {
  const mensaje = await Mensaje.create({ conversacion_id: req.params.id, ...req.body });
  res.json(mensaje);
};

exports.marcarMensajeLeido = async (req, res) => {
  const mensaje = await Mensaje.findByIdAndUpdate(req.params.id, { leido: true }, { new: true });
  res.json(mensaje);
};
    