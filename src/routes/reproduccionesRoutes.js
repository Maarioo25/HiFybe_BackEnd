const express = require('express');
const router = express.Router();
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
 *             properties:
 *               usuarioId:
 *                 type: string
 *               cancionId:
 *                 type: string
 *             example:
 *               usuarioId: "usuario123"
 *               cancionId: "cancion456"
 *     responses:
 *       201:
 *         description: Reproducción registrada correctamente.
 */
router.post('/', registrarReproduccion);

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
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Historial de reproducciones obtenido correctamente.
 */
router.get('/usuarios/:usuarioId', obtenerReproduccionesUsuario);

module.exports = router;
