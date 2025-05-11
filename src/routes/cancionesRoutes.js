const express = require('express');
const router = express.Router();
const {
  obtenerCanciones,
  obtenerCancionPorId,
  crearCancion,
  actualizarCancion,
  eliminarCancion
} = require('../controllers/cancionesController');

/**
 * @swagger
 * tags:
 *   name: Canciones
 *   description: Operaciones relacionadas con la gestión de canciones
 */

/**
 * @swagger
 * /canciones:
 *   get:
 *     summary: Obtener todas las canciones
 *     description: Recupera una lista con todas las canciones disponibles.
 *     tags: [Canciones]
 *     responses:
 *       200:
 *         description: Lista de canciones obtenida correctamente.
 */
router.get('/', obtenerCanciones);

/**
 * @swagger
 * /canciones/{id}:
 *   get:
 *     summary: Obtener una canción por ID
 *     description: Recupera los detalles de una canción específica mediante su ID.
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la canción.
 *     responses:
 *       200:
 *         description: Canción obtenida correctamente.
 *       404:
 *         description: Canción no encontrada.
 */
router.get('/:id', obtenerCancionPorId);

/**
 * @swagger
 * /canciones:
 *   post:
 *     summary: Crear una nueva canción
 *     description: Agrega una nueva canción al sistema.
 *     tags: [Canciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               artista:
 *                 type: string
 *               album:
 *                 type: string
 *               genero:
 *                 type: string
 *               duracion:
 *                 type: number
 *               url:
 *                 type: string
 *             example:
 *               titulo: "Nombre de la canción"
 *               artista: "Nombre del artista"
 *               album: "Nombre del álbum"
 *               genero: "Pop"
 *               duracion: 210
 *               url: "https://ejemplo.com/audio.mp3"
 *     responses:
 *       201:
 *         description: Canción creada correctamente.
 */
router.post('/', crearCancion);

/**
 * @swagger
 * /canciones/{id}:
 *   put:
 *     summary: Actualizar una canción
 *     description: Modifica los detalles de una canción existente mediante su ID.
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la canción a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               artista:
 *                 type: string
 *               album:
 *                 type: string
 *               genero:
 *                 type: string
 *               duracion:
 *                 type: number
 *               url:
 *                 type: string
 *             example:
 *               titulo: "Nuevo título"
 *               artista: "Nuevo artista"
 *               album: "Nuevo álbum"
 *               genero: "Rock"
 *               duracion: 180
 *               url: "https://ejemplo.com/nuevo-audio.mp3"
 *     responses:
 *       200:
 *         description: Canción actualizada correctamente.
 *       404:
 *         description: Canción no encontrada.
 */
router.put('/:id', actualizarCancion);

/**
 * @swagger
 * /canciones/{id}:
 *   delete:
 *     summary: Eliminar una canción
 *     description: Elimina una canción del sistema mediante su ID.
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la canción a eliminar.
 *     responses:
 *       200:
 *         description: Canción eliminada correctamente.
 *       404:
 *         description: Canción no encontrada.
 */
router.delete('/:id', eliminarCancion);

module.exports = router;
