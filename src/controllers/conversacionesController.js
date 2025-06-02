const Conversacion = require('../models/conversacion');
const Mensaje = require('../models/mensaje');
const Amistad = require('../models/amistad'); // ← añadido
const Usuario = require('../models/usuario'); // ← añadido

exports.crearConversacion = async (req, res) => {
  try {
    const [id1, id2] = req.body.participantes;

    if (!id1 || !id2 || id1 === id2) {
      return res.status(400).json({ error: 'Participantes inválidos' });
    }

    // Verificar si son amigos
    const amistad = await Amistad.findOne({
      $or: [
        { usuario_id_1: id1, usuario_id_2: id2 },
        { usuario_id_1: id2, usuario_id_2: id1 }
      ],
      estado: 'aceptada'
    });

    if (!amistad) {
      return res.status(403).json({ error: 'Los usuarios no son amigos' });
    }

    // Evitar duplicados: verificar si ya existe conversación entre ambos
    let conversacion = await Conversacion.findOne({
      $or: [
        { usuario1_id: id1, usuario2_id: id2 },
        { usuario1_id: id2, usuario2_id: id1 }
      ]
    });

    if (!conversacion) {
      conversacion = await Conversacion.create({
        usuario1_id: id1,
        usuario2_id: id2
      });
    }

    res.status(201).json(conversacion);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear conversación' });
  }
};

exports.obtenerConversacionesUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;

    const conversaciones = await Conversacion.find({
      $or: [
        { usuario1_id: usuarioId },
        { usuario2_id: usuarioId }
      ]
    }).populate('usuario1_id', 'nombre foto_perfil')
      .populate('usuario2_id', 'nombre foto_perfil');

    res.json(conversaciones);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener conversaciones' });
  } 
};

exports.obtenerMensajesConversacion = async (req, res) => {
  try {
    const mensajes = await Mensaje.find({ conversacion_id: req.params.id })
      .sort({ fecha_envio: 1 }) // ← añadido
      .populate('emisor_id', 'nombre foto_perfil') // ← añadido
      .populate('cancion_id'); // ← añadido

    res.json(mensajes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

exports.enviarMensaje = async (req, res) => {
  try {
    const { emisorId, contenido, cancion_id } = req.body;

    const nuevoMensaje = await Mensaje.create({
      conversacion_id: req.params.id,
      emisor_id: emisorId,
      contenido,
      cancion_id: cancion_id || null
    });

    const mensajeConDatos = await nuevoMensaje.populate('emisor_id', 'nombre foto_perfil'); // ← añadido

    res.status(201).json(mensajeConDatos);
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

exports.marcarMensajeLeido = async (req, res) => {
  try {
    const mensaje = await Mensaje.findByIdAndUpdate(
      req.params.id,
      { leido: true },
      { new: true }
    );
    res.json(mensaje);
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar como leído' });
  }
};
