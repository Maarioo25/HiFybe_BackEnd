const express = require('express');
const router = express.Router();
const {
  obtenerPlaylists,
  obtenerPlaylistPorId,
  crearPlaylist,
  actualizarPlaylist,
  eliminarPlaylist,
  agregarCancionAPlaylist,
  eliminarCancionDePlaylist
} = require('../controllers/playlistsController');

/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: Operaciones para la gestión de listas de reproducción de canciones
 */

/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Obtener todas las playlists
 *     description: Recupera una lista con todas las playlists disponibles.
 *     tags: [Playlists]
 *     responses:
 *       200:
 *         description: Listado de playlists obtenido correctamente.
 */
router.get('/', obtenerPlaylists);

/**
 * @swagger
 * /playlists/{id}:
 *   get:
 *     summary: Obtener una playlist por ID
 *     description: Recupera los detalles de una playlist específica mediante su ID.
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la playlist.
 *     responses:
 *       200:
 *         description: Playlist obtenida correctamente.
 *       404:
 *         description: Playlist no encontrada.
 */
router.get('/:id', obtenerPlaylistPorId);

/**
 * @swagger
 * /playlists:
 *   post:
 *     summary: Crear una nueva playlist
 *     description: Crea una nueva lista de reproducción.
 *     tags: [Playlists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               usuarioId:
 *                 type: string
 *             example:
 *               nombre: "Mi Playlist"
 *               descripcion: "Playlist para entrenar"
 *               usuarioId: "usuario123"
 *     responses:
 *       201:
 *         description: Playlist creada correctamente.
 */
router.post('/', crearPlaylist);

/**
 * @swagger
 * /playlists/{id}:
 *   put:
 *     summary: Actualizar una playlist
 *     description: Modifica los detalles de una playlist existente.
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la playlist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *             example:
 *               nombre: "Playlist actualizada"
 *               descripcion: "Descripción nueva"
 *     responses:
 *       200:
 *         description: Playlist actualizada correctamente.
 *       404:
 *         description: Playlist no encontrada.
 */
router.put('/:id', actualizarPlaylist);

/**
 * @swagger
 * /playlists/{id}:
 *   delete:
 *     summary: Eliminar una playlist
 *     description: Elimina una lista de reproducción mediante su ID.
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la playlist.
 *     responses:
 *       200:
 *         description: Playlist eliminada correctamente.
 *       404:
 *         description: Playlist no encontrada.
 */
router.delete('/:id', eliminarPlaylist);

/**
 * @swagger
 * /playlists/{id}/canciones:
 *   post:
 *     summary: Agregar canción a una playlist
 *     description: Añade una canción existente a una playlist específica.
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la playlist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancionId:
 *                 type: string
 *             example:
 *               cancionId: "cancion456"
 *     responses:
 *       200:
 *         description: Canción agregada correctamente.
 *       404:
 *         description: Playlist o canción no encontrada.
 */
router.post('/:id/canciones', agregarCancionAPlaylist);

/**
 * @swagger
 * /playlists/{id}/canciones/{cancionId}:
 *   delete:
 *     summary: Eliminar canción de una playlist
 *     description: Elimina una canción específica de una playlist.
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la playlist.
 *       - in: path
 *         name: cancionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la canción a eliminar.
 *     responses:
 *       200:
 *         description: Canción eliminada correctamente de la playlist.
 *       404:
 *         description: Playlist o canción no encontrada.
 */
router.delete('/:id/canciones/:cancionId', eliminarCancionDePlaylist);

module.exports = router;
