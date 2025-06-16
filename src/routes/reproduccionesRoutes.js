const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  registrarReproduccion,
  obtenerReproduccionesUsuario
} = require('../controllers/reproduccionesController');

/**
 * @swagger
 * tags:
 *   name: Reproducciones
 *   description: Operaciones relacionadas con el historial de reproducción de canciones
 */

/**
 * @swagger
 * /reproducciones:
 *   post:
 *     summary: Registrar reproducción de una canción
 *     description: Registra una nueva reproducción de una canción por parte de un usuario.
 *     tags: [Reproducciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *               - cancionId
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario que reproduce la canción.
 *               cancionId:
 *                 type: string
 *                 description: ID de la canción reproducida.
 *             example:
 *               usuarioId: "usuario123"
 *               cancionId: "cancion456"
 *     responses:
 *       201:
 *         description: Reproducción registrada correctamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', requireAuth, registrarReproduccion);

/**
 * @swagger
 * /reproducciones/usuarios/{usuarioId}:
 *   get:
 *     summary: Obtener historial de reproducciones de un usuario
 *     description: Recupera todas las reproducciones realizadas por un usuario.
 *     tags: [Reproducciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario cuyo historial se desea obtener.
 *     responses:
 *       200:
 *         description: Historial de reproducciones obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   usuarioId:
 *                     type: string
 *                   cancionId:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha y hora de la reproducción.
 *       400:
 *         description: ID de usuario inválido.
 *       404:
 *         description: No se encontró historial para el usuario.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuarios/:usuarioId', requireAuth, obtenerReproduccionesUsuario);

module.exports = router;
