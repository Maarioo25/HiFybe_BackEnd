const express = require('express');
const router = express.Router();
const {
  obtenerNotificaciones,
  marcarNotificacionLeida,
  eliminarNotificacion,
  crearNotificacion
} = require('../controllers/notificacionesController');

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Operaciones relacionadas con la gestión de notificaciones para los usuarios
 */

/**
 * @swagger
 * /notificaciones/usuarios/{usuarioId}:
 *   get:
 *     summary: Obtener notificaciones de un usuario
 *     description: Recupera todas las notificaciones asociadas a un usuario.
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la notificación.
 *                   usuarioId:
 *                     type: string
 *                     description: ID del usuario receptor.
 *                   contenido:
 *                     type: string
 *                     description: Mensaje de la notificación.
 *                   leido:
 *                     type: boolean
 *                     description: Indica si la notificación ha sido leída.
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha y hora de creación.
 *       400:
 *         description: ID de usuario inválido.
 *       404:
 *         description: No se encontraron notificaciones para el usuario.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuarios/:usuarioId', requireAuth, obtenerNotificaciones);

/**
 * @swagger
 * /notificaciones:
 *   post:
 *     summary: Crear una nueva notificación
 *     description: Crea una notificación dirigida a un usuario específico.
 *     tags: [Notificaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario_id
 *               - contenido
 *             properties:
 *               usuario_id:
 *                 type: string
 *                 description: ID del usuario que recibirá la notificación.
 *               contenido:
 *                 type: string
 *                 description: Contenido del mensaje de la notificación.
 *             example:
 *               usuario_id: "usuario123"
 *               contenido: "Tu amigo ha compartido una playlist contigo."
 *     responses:
 *       201:
 *         description: Notificación creada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la notificación creada.
 *       400:
 *         description: Datos de entrada inválidos.
 *       500:
 *         description: Error al crear la notificación.
 */
router.post('/', requireAuth, crearNotificacion);

/**
 * @swagger
 * /notificaciones/{id}/leido:
 *   put:
 *     summary: Marcar notificación como leída
 *     description: Marca una notificación como leída por el usuario.
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación.
 *     responses:
 *       200:
 *         description: Notificación marcada como leída correctamente.
 *       400:
 *         description: ID de notificación inválido.
 *       404:
 *         description: Notificación no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:id/leido', requireAuth, marcarNotificacionLeida);

/**
 * @swagger
 * /notificaciones/{id}:
 *   delete:
 *     summary: Eliminar notificación
 *     description: Elimina una notificación del sistema.
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación.
 *     responses:
 *       200:
 *         description: Notificación eliminada correctamente.
 *       400:
 *         description: ID de notificación inválido.
 *       404:
 *         description: Notificación no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', requireAuth, eliminarNotificacion);

module.exports = router;
