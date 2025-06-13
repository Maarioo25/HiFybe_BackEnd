const Amistad = require('../models/amistad');
const SolicitudAmistad = require('../models/solicitudAmistad');
const Usuario = require('../models/usuario');

exports.obtenerAmistades = async (req, res) => {
  const userId = req.params.userId;
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

  const friends = amistades
  .filter(a => a.usuario_id_1 && a.usuario_id_2)
  .map(a => {
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
      ultimaActividad: amigo.ultimaActividad,
      amistadId: amigo._id
    };
  });


  res.json(friends);
};

exports.enviarSolicitudAmistad = async (req, res) => {
  const { de_usuario_id, para_usuario_id } = req.body;

  if (!de_usuario_id || !para_usuario_id) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  const yaExiste = await SolicitudAmistad.findOne({
    $or: [
      { de_usuario_id, para_usuario_id },
      { de_usuario_id: para_usuario_id, para_usuario_id: de_usuario_id }
    ],
    estado: 'pendiente'
  });

  if (yaExiste) {
    return res.json({ mensaje: 'Solicitud ya existente (pendiente)' });
  }

  const solicitud = await SolicitudAmistad.create({ de_usuario_id, para_usuario_id });
  res.json({ mensaje: 'Solicitud creada', solicitud });
};


exports.responderSolicitudAmistad = async (req, res) => {
  const { estado } = req.body;
  const solicitudId = req.params.solicitudId;

  if (!estado || !['aceptada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  try {
    // Actualizamos el estado de la solicitud
    const solicitud = await SolicitudAmistad.findByIdAndUpdate(
      solicitudId,
      { estado },
      { new: true }
    );

    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    // Si fue aceptada, creamos la amistad
    if (estado === 'aceptada') {
      await Amistad.create({
        usuario_id_1: solicitud.de_usuario_id,
        usuario_id_2: solicitud.para_usuario_id,
        estado: 'aceptada'
      });
    }

    res.json({ mensaje: `Solicitud ${estado}`, solicitud });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al responder la solicitud' });
  }
};


exports.eliminarAmistad = async (req, res) => {
  try {
    const result = await Amistad.findByIdAndDelete(req.params.amistadId);
    if (!result) {
      return res.status(404).json({ error: 'Amistad no encontrada' });
    }
    res.json({ mensaje: 'Amistad eliminada correctamente', deleted: result });
  } catch (err) {
    console.error('Error al eliminar amistad:', err);
    res.status(500).json({ error: 'Error al eliminar amistad' });
  }
};


// ===================== SOLICITUDES ===================== //

exports.obtenerSolicitudesAmistad = async (req, res) => {
  const solicitudes = await SolicitudAmistad.find({
    para_usuario_id: req.params.usuarioId,
    estado: 'pendiente',
  }).populate('de_usuario_id');
  res.json(solicitudes);
};
