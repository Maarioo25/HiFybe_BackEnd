const express = require('express');
const router = express.Router();
const {
  crearConversacion,
  obtenerConversacionesUsuario,
  obtenerMensajesConversacion,
  enviarMensaje,
  marcarMensajeLeido
} = require('../controllers/conversacionesController');

/**
 * @swagger
 * tags:
 *   name: Conversaciones
 *   description: Operaciones relacionadas con conversaciones y mensajes entre usuarios
 */

/**
 * @swagger
 * /conversaciones:
 *   post:
 *     summary: Crear nueva conversación
 *     description: Inicia una nueva conversación entre usuarios.
 *     tags: [Conversaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de usuarios que participan en la conversación.
 *             example:
 *               participantes: ["usuario1", "usuario2"]
 *     responses:
 *       201:
 *         description: Conversación creada correctamente.
 */
router.post('/', crearConversacion);

/**
 * @swagger
 * /conversaciones/usuarios/{usuarioId}:
 *   get:
 *     summary: Obtener conversaciones de un usuario
 *     description: Recupera todas las conversaciones en las que participa un usuario.
 *     tags: [Conversaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Conversaciones obtenidas correctamente.
 */
router.get('/usuarios/:usuarioId', obtenerConversacionesUsuario);

/**
 * @swagger
 * /conversaciones/{id}/mensajes:
 *   get:
 *     summary: Obtener mensajes de una conversación
 *     description: Recupera todos los mensajes de una conversación específica.
 *     tags: [Conversaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación.
 *     responses:
 *       200:
 *         description: Mensajes obtenidos correctamente.
 */
router.get('/:id/mensajes', obtenerMensajesConversacion);

/**
 * @swagger
 * /conversaciones/{id}/mensajes:
 *   post:
 *     summary: Enviar mensaje en una conversación
 *     description: Envía un nuevo mensaje dentro de una conversación existente.
 *     tags: [Conversaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la conversación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emisorId:
 *                 type: string
 *               contenido:
 *                 type: string
 *             example:
 *               emisorId: "usuario1"
 *               contenido: "Hola, ¿cómo estás?"
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente.
 */
router.post('/:id/mensajes', enviarMensaje);

/**
 * @swagger
 * /conversaciones/mensajes/{id}/leido:
 *   put:
 *     summary: Marcar mensaje como leído
 *     description: Marca un mensaje específico como leído por el receptor.
 *     tags: [Conversaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del mensaje.
 *     responses:
 *       200:
 *         description: Mensaje marcado como leído correctamente.
 */
router.put('/mensajes/:id/leido', marcarMensajeLeido);

module.exports = router;
