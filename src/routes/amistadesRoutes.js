const express = require('express');
const router = express.Router();
const {
  obtenerAmistades,
  enviarSolicitudAmistad,
  responderSolicitudAmistad,
  eliminarAmistad,
  obtenerSolicitudesAmistad
} = require('../controllers/amistadesController');

/**
 * @swagger
 * tags:
 *   name: Amistades
 *   description: Operaciones relacionadas con la gestión de amistades entre usuarios
 */

/**
 * @swagger
 * /amistades/usuarios/{userId}:
 *   get:
 *     summary: Obtener amistades de un usuario
 *     description: Recupera la lista de amigos de un usuario específico.
 *     tags: [Amistades]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario del que se quieren obtener las amistades.
 *     responses:
 *       200:
 *         description: Lista de amistades obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la relación de amistad.
 *                   amigoId:
 *                     type: string
 *                     description: ID del usuario amigo.
 *       400:
 *         description: ID de usuario inválido.
 *       404:
 *         description: No se encontraron amistades.
 */
router.get('/usuarios/:userId', obtenerAmistades);

/**
 * @swagger
 * /amistades/solicitudes:
 *   post:
 *     summary: Enviar solicitud de amistad
 *     description: Envía una nueva solicitud de amistad a otro usuario.
 *     tags: [Amistades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emisorId
 *               - receptorId
 *             properties:
 *               emisorId:
 *                 type: string
 *                 description: ID del usuario que envía la solicitud.
 *               receptorId:
 *                 type: string
 *                 description: ID del usuario que recibe la solicitud.
 *             example:
 *               emisorId: "usuario123"
 *               receptorId: "usuario456"
 *     responses:
 *       201:
 *         description: Solicitud de amistad enviada exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/solicitudes', enviarSolicitudAmistad);

/**
 * @swagger
 * /amistades/solicitudes/{solicitudId}:
 *   put:
 *     summary: Responder solicitud de amistad
 *     description: Acepta o rechaza una solicitud de amistad existente.
 *     tags: [Amistades]
 *     parameters:
 *       - in: path
 *         name: solicitudId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de amistad.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [aceptada, rechazada]
 *                 description: Estado de la solicitud de amistad.
 *             example:
 *               estado: "aceptada"
 *     responses:
 *       200:
 *         description: Solicitud de amistad respondida correctamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Solicitud no encontrada.
 */
router.put('/solicitudes/:solicitudId', responderSolicitudAmistad);

/**
 * @swagger
 * /amistades/{amistadId}:
 *   delete:
 *     summary: Eliminar una amistad
 *     description: Elimina una relación de amistad existente.
 *     tags: [Amistades]
 *     parameters:
 *       - in: path
 *         name: amistadId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la amistad a eliminar.
 *     responses:
 *       200:
 *         description: Amistad eliminada correctamente.
 *       404:
 *         description: Amistad no encontrada.
 */
router.delete('/:amistadId', eliminarAmistad);

/**
 * @swagger
 * /amistades/usuarios/{usuarioId}/solicitudes:
 *   get:
 *     summary: Obtener solicitudes de amistad pendientes
 *     description: Recupera todas las solicitudes de amistad pendientes de un usuario.
 *     tags: [Amistades]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario para el que se solicitan las solicitudes pendientes.
 *     responses:
 *       200:
 *         description: Solicitudes de amistad obtenidas correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la solicitud.
 *                   emisorId:
 *                     type: string
 *                   estado:
 *                     type: string
 *                     description: Estado actual de la solicitud.
 *       400:
 *         description: ID de usuario inválido.
 *       404:
 *         description: No se encontraron solicitudes.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuarios/:usuarioId/solicitudes', obtenerSolicitudesAmistad);

module.exports = router;
