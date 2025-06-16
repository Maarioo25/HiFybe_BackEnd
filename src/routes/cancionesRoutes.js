const express = require('express');
const router = express.Router();
const {
  obtenerCanciones,
  obtenerCancionPorId,
  crearCancion,
  actualizarCancion,
  eliminarCancion,
  obtenerCancionSpotify
} = require('../controllers/cancionesController');
const requireAuth = require('../middleware/auth');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la canción.
 *                   titulo:
 *                     type: string
 *                   artista:
 *                     type: string
 *                   album:
 *                     type: string
 *                   genero:
 *                     type: string
 *                   duracion:
 *                     type: number
 *                   url:
 *                     type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 titulo:
 *                   type: string
 *                 artista:
 *                   type: string
 *                 album:
 *                   type: string
 *                 genero:
 *                   type: string
 *                 duracion:
 *                   type: number
 *                 url:
 *                   type: string
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
 *     security:  
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - artista
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
 *       400:
 *         description: Datos de entrada inválidos.
 */
router.post('/', requireAuth, crearCancion);

/**
 * @swagger
 * /canciones/{id}:
 *   put:
 *     summary: Actualizar una canción
 *     description: Modifica los detalles de una canción existente mediante su ID.
 *     tags: [Canciones]
 *     security:  
 *       - bearerAuth: []
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
router.put('/:id', requireAuth, actualizarCancion);

/**
 * @swagger
 * /canciones/{id}:
 *   delete:
 *     summary: Eliminar una canción
 *     description: Elimina una canción del sistema mediante su ID.
 *     tags: [Canciones]
 *     security:  
 *       - bearerAuth: []
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
router.delete('/:id', requireAuth, eliminarCancion);

/**
 * @swagger
 * /canciones/spotify/{id}:
 *   get:
 *     summary: Obtener detalles de una canción desde Spotify
 *     description: Recupera información de una canción usando la API de Spotify mediante su ID de Spotify.
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la canción en Spotify.
 *     responses:
 *       200:
 *         description: Datos de la canción obtenidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 titulo:
 *                   type: string
 *                 artista:
 *                   type: string
 *                 album:
 *                   type: string
 *                 duracion_ms:
 *                   type: number
 *                 preview_url:
 *                   type: string
 *       404:
 *         description: Canción no encontrada en Spotify.
 *       500:
 *         description: Error al comunicarse con la API de Spotify.
 */
router.get('/spotify/:id', obtenerCancionSpotify);

module.exports = router;
