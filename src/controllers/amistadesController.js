const Amistad = require('../models/amistad');
const SolicitudAmistad = require('../models/solicitudAmistad');

exports.obtenerAmistades = async (req, res) => {
  const amistades = await Amistad.find({
    $or: [{ usuario_id_1: req.params.usuarioId }, { usuario_id_2: req.params.usuarioId }],
    estado: 'aceptada',
  });
  res.json(amistades);
};

exports.enviarSolicitudAmistad = async (req, res) => {
  const solicitud = await SolicitudAmistad.create(req.body);
  res.json(solicitud);
};

exports.responderSolicitudAmistad = async (req, res) => {
  const solicitud = await SolicitudAmistad.findByIdAndUpdate(req.params.solicitudId, req.body, { new: true });
  res.json(solicitud);
};

exports.eliminarAmistad = async (req, res) => {
  await Amistad.findByIdAndDelete(req.params.amistadId);
  res.json({ mensaje: 'Amistad eliminada' });
};

exports.obtenerSolicitudesAmistad = async (req, res) => {
  const solicitudes = await SolicitudAmistad.find({
    para_usuario_id: req.params.usuarioId,
    estado: 'pendiente',
  });
  res.json(solicitudes);
};
