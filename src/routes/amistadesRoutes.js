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
 * /amistades/usuarios/{usuarioId}:
 *   get:
 *     summary: Obtener amistades de un usuario
 *     description: Recupera la lista de amigos de un usuario específico.
 *     tags: [Amistades]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario del que se quieren obtener las amistades.
 *     responses:
 *       200:
 *         description: Lista de amistades obtenida correctamente.
 */
router.get('/usuarios/:usuarioId', obtenerAmistades);

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
 *             properties:
 *               emisorId:
 *                 type: string
 *                 description: ID del usuario que envía la solicitud.
 *               receptorId:
 *                 type: string
 *                 description: ID del usuario que recibe la solicitud.
 *     responses:
 *       201:
 *         description: Solicitud de amistad enviada exitosamente.
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
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [aceptada, rechazada]
 *                 description: Estado de la solicitud de amistad.
 *     responses:
 *       200:
 *         description: Solicitud de amistad respondida correctamente.
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
 */
router.delete('/:amistadId', eliminarAmistad);

/**
 * @swagger
 * /amistades/usuarios/{usuarioId}/solicitudes:
 *   get:
 *     summary: Obtener solicitudes de amistad
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
 */
router.get('/usuarios/:usuarioId/solicitudes', obtenerSolicitudesAmistad);

module.exports = router;
