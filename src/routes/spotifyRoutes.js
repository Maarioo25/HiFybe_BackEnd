const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  obtenerPlaylistsDeSpotify,
  obtenerRecomendacionesDeSpotify
} = require('../controllers/spotifyController');

/**
 * @swagger
 * tags:
 *   name: Spotify
 *   description: Endpoints relacionados con la integración y consumo de datos de Spotify
 */

/**
 * @swagger
 * /spotify/playlists/{userId}:
 *   get:
 *     summary: Obtener playlists públicas de un usuario de Spotify
 *     description: |
 *       Devuelve una lista de playlists públicas de Spotify asociadas al usuario indicado.
 *       Este usuario debe tener su cuenta de Spotify vinculada previamente.
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
router.get('/playlists/:userId', requireAuth, obtenerPlaylistsDeSpotify);

/**
 * @swagger
 * /spotify/recomendaciones:
 *   get:
 *     summary: Obtener recomendaciones personalizadas desde Spotify
 *     description: |
 *       Devuelve una lista de canciones recomendadas usando la API de Spotify
 *       con semillas predeterminadas configuradas en el backend.
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
 *                     description: Título de la canción.
 *                   artist:
 *                     type: string
 *                     description: Artista principal.
 *                   img:
 *                     type: string
 *                     description: URL de la imagen del cover.
 *                   spotifyUri:
 *                     type: string
 *                     description: URI de Spotify para reproducir la canción.
 *       500:
 *         description: Error al obtener recomendaciones desde la API de Spotify.
 */
router.get('/recomendaciones', requireAuth, obtenerRecomendacionesDeSpotify);

module.exports = router;
