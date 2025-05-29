const Amistad = require('../models/amistad');
const SolicitudAmistad = require('../models/solicitudAmistad');
const Usuario = require('../models/usuario');

exports.obtenerAmistades = async (req, res) => {
  const userId = req.params.usuarioId;
  // buscamos las amistades aceptadas e incluimos info de ambos usuarios
  const amistades = await Amistad
    .find({
      $or: [
        { usuario_id_1: userId },
        { usuario_id_2: userId }
      ],
      estado: 'aceptada'
    })
    .populate('usuario_id_1', 'nombre foto_perfil ubicarion playlistsPublicas estado cancionDestacada ultimaActividad online')
    .populate('usuario_id_2', 'nombre foto_perfil ubicarion playlistsPublicas estado cancionDestacada ultimaActividad online');

  // transformamos para devolver siempre el otro usuario como “amigo”
  const friends = amistades.map(a => {
    const amigo = a.usuario_id_1._id.toString() === userId
      ? a.usuario_id_2
      : a.usuario_id_1;
    return {
      id: amigo._id,
      nombre: amigo.nombre,
      foto_perfil: amigo.foto_perfil,
      online: amigo.online,
      playlistsPublicas: amigo.playlistsPublicas,
      estado: amigo.estado,
      cancionDestacada: amigo.cancionDestacada,
      ultimaActividad: amigo.ultimaActividad
    };
  });

  res.json(friends);
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
