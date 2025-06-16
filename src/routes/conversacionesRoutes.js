const express = require('express');
const router = express.Router();
const {
  crearConversacion,
  obtenerConversacionesUsuario,
  obtenerMensajesConversacion,
  enviarMensaje,
  marcarMensajeLeido
} = require('../controllers/conversacionesController');
const requireAuth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Conversaciones
 *   description: Gestión de conversaciones y mensajes entre usuarios
 */

/**
 * @swagger
 * /conversaciones:
 *   post:
 *     summary: Crear una nueva conversación
 *     description: Inicia una conversación entre dos usuarios (deben ser amigos).
 *     tags: [Conversaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantes
 *             properties:
 *               participantes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de IDs de usuarios participantes.
 *             example:
 *               participantes: ["usuarioA", "usuarioB"]
 *     responses:
 *       201:
 *         description: Conversación creada correctamente.
 *       400:
 *         description: Datos de entrada inválidos.
 */
router.post('/', requireAuth, crearConversacion);

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
 *         description: Lista de conversaciones obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   participantes:
 *                     type: array
 *                     items:
 *                       type: string
 *                   ultima_actividad:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: ID de usuario inválido.
 *       404:
 *         description: No se encontraron conversaciones.
 */
router.get('/usuarios/:usuarioId', requireAuth, obtenerConversacionesUsuario);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   remitente:
 *                     type: string
 *                   contenido:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                   leido:
 *                     type: boolean
 *       400:
 *         description: ID de conversación inválido.
 *       404:
 *         description: Conversación no encontrada.
 */
router.get('/:id/mensajes', requireAuth, obtenerMensajesConversacion);

/**
 * @swagger
 * /conversaciones/{id}/mensajes:
 *   post:
 *     summary: Enviar un mensaje en una conversación
 *     description: Añade un nuevo mensaje a una conversación existente.
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
 *             required:
 *               - remitente
 *               - contenido
 *             properties:
 *               remitente:
 *                 type: string
 *               contenido:
 *                 type: string
 *             example:
 *               remitente: "usuarioA"
 *               contenido: "¡Hola! ¿Cómo estás?"
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Conversación no encontrada.
 */
router.post('/:id/mensajes', requireAuth, enviarMensaje);

/**
 * @swagger
 * /conversaciones/mensajes/{id}/leido:
 *   put:
 *     summary: Marcar mensaje como leído
 *     description: Cambia el estado de un mensaje a leído.
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
 *       400:
 *         description: ID de mensaje inválido.
 *       404:
 *         description: Mensaje no encontrado.
 */
router.put('/mensajes/:id/leido', requireAuth, marcarMensajeLeido);

module.exports = router;
