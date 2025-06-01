const express = require('express');
const router = express.Router();
const {
  crearConversacion,
  obtenerConversacionesUsuario,
  obtenerMensajesConversacion,
  enviarMensaje,
  marcarMensajeLeido
} = require('../controllers/conversacionesController');

// Ruta para crear una conversación entre usuarios (solo si son amigos)
router.post('/', crearConversacion);

// Obtener todas las conversaciones de un usuario
router.get('/usuarios/:usuarioId', obtenerConversacionesUsuario);

// Obtener mensajes de una conversación específica
router.get('/:id/mensajes', obtenerMensajesConversacion);

// Enviar mensaje a una conversación existente
router.post('/:id/mensajes', enviarMensaje);

// Marcar un mensaje como leído
router.put('/mensajes/:id/leido', marcarMensajeLeido);

module.exports = router;
