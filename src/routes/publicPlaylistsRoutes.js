const express = require('express');
const router = express.Router();
const { getPublicPlaylistByUserAndId } = require('../controllers/publicPlaylistsController');

/**
 * @swagger
 * tags:
 *   name: PublicPlaylists
 *   description: Endpoints para acceder a playlists públicas de usuarios
 */

/**
 * @swagger
 * /public-playlists/{userId}/{playlistId}:
 *   get:
 *     summary: Obtener playlist pública por usuario e ID
 *     description: |
 *       Devuelve la playlist pública específica de un usuario, incluyendo detalles básicos y lista de canciones.
 *     tags: [PublicPlaylists]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario propietario de la playlist.
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la playlist pública.
 *     responses:
 *       200:
 *         description: Playlist pública obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la playlist.
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID de la canción.
 *                       titulo:
 *                         type: string
 *                         description: Título de la canción.
 *                       artista:
 *                         type: string
 *                         description: Artista principal.
 *       404:
 *         description: Usuario o playlist no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:userId/:playlistId', getPublicPlaylistByUserAndId);

module.exports = router;
