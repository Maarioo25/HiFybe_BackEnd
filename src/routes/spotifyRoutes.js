const express = require('express');
const router = express.Router();
const {
  obtenerPlaylistsDeSpotify,
  obtenerRecomendacionesDeSpotify,
  obtenerDetallePlaylistDeSpotify,
  obtenerTracksPlaylistDeSpotify
} = require('../controllers/spotifyController');

/**
 * @swagger
 * /spotify/playlists/{userId}:
 *   get:
 *     summary: Obtener playlists públicas de un usuario de Spotify
 *     description: Devuelve una lista de playlists públicas de Spotify asociadas al usuario indicado. Este usuario debe tener su cuenta de Spotify vinculada previamente.
 *     tags: [Spotify]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario en la base de datos.
 *     responses:
 *       200:
 *         description: Lista de playlists públicas obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la playlist en Spotify.
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la playlist.
 *                   imagen:
 *                     type: string
 *                     description: URL de la imagen de la playlist.
 *                   canciones:
 *                     type: number
 *                     description: Número de canciones en la playlist.
 *                   duracion:
 *                     type: string
 *                     description: Duración aproximada (no disponible directamente).
 *       400:
 *         description: El usuario no tiene Spotify vinculado.
 *       500:
 *         description: Error interno del servidor o en la comunicación con la API de Spotify.
 */
router.get('/playlists/:userId', obtenerPlaylistsDeSpotify);

/**
 * @swagger
 * /spotify/playlists/detail/{playlistId}:
 *   get:
 *     summary: Obtener detalles de una playlist de Spotify
 *     description: Devuelve información detallada de la playlist indicada en Spotify.
 *     tags: [Spotify]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la playlist en Spotify.
 *     responses:
 *       200:
 *         description: Detalles de la playlist obtenidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la playlist en Spotify.
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la playlist.
 *                 descripcion:
 *                   type: string
 *                   description: Descripción de la playlist.
 *                 imagen:
 *                   type: string
 *                   description: URL de la imagen de la playlist.
 *                 canciones:
 *                   type: number
 *                   description: Número de canciones en la playlist.
 *       400:
 *         description: ID de playlist inválido o no existe.
 *       500:
 *         description: Error interno del servidor o en la comunicación con la API de Spotify.
 */
router.get('/playlists/detail/:playlistId', obtenerDetallePlaylistDeSpotify);

/**
 * @swagger
 * /spotify/playlists/tracks/{playlistId}:
 *   get:
 *     summary: Obtener canciones de una playlist de Spotify
 *     description: Devuelve la lista de canciones que contiene la playlist indicada en Spotify.
 *     tags: [Spotify]
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la playlist en Spotify.
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
 *                   trackId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   album:
 *                     type: string
 *                   duracion:
 *                     type: number
 *       400:
 *         description: ID de playlist inválido o no existe.
 *       500:
 *         description: Error interno del servidor o en la comunicación con la API de Spotify.
 */
router.get('/playlists/tracks/:playlistId', obtenerTracksPlaylistDeSpotify);

/**
 * @swagger
 * /spotify/recomendaciones:
 *   get:
 *     summary: Obtener recomendaciones personalizadas desde Spotify
 *     description: Devuelve una lista de canciones recomendadas usando la API de Spotify con semillas predeterminadas.
 *     tags: [Spotify]
 *     responses:
 *       200:
 *         description: Lista de canciones recomendadas obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   img:
 *                     type: string
 *                   spotifyUri:
 *                     type: string
 *       500:
 *         description: Error al obtener recomendaciones desde la API de Spotify.
 */
router.get('/recomendaciones', obtenerRecomendacionesDeSpotify);

module.exports = router;
