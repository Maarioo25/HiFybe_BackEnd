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
 */
router.get('/usuarios/:usuarioId', obtenerNotificaciones);

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
 *             properties:
 *               usuario_id:
 *                 type: string
 *                 description: ID del usuario que recibirá la notificación.
 *               contenido:
 *                 type: string
 *                 description: Contenido del mensaje de la notificación.
 *     responses:
 *       201:
 *         description: Notificación creada correctamente.
 *       500:
 *         description: Error al crear la notificación.
 */

router.post('/', crearNotificacion);


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
 */
router.put('/:id/leido', marcarNotificacionLeida);

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
 */
router.delete('/:id', eliminarNotificacion);

module.exports = router;
