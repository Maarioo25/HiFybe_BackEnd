const express = require('express');
const passport = require('passport');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

const {
  registrarUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  loginUsuario,
  logoutUser,
  getCurrentUser,
  googleAuth,
  googleCallback,
  googleAuthFailureHandler,
  spotifyAuth,
  spotifyCallback,
  spotifyAuthFailureHandler,
  spotifyLinkCallback,
  actualizarUbicacion,
  obtenerUsuariosCercanos,
  actualizarRedesSociales,
  actualizarPreferenciasUsuario,
  actualizarCancion,
  obtenerCancionActual,
  ocultarUbicacion,
  subirFotoPerfil
} = require('../controllers/usuariosController');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operaciones relacionadas con la gestión de usuarios en la aplicación
 */

// Rutas públicas

/**
 * @swagger
 * /usuarios/register:
 *   post:
 *     summary: Registro de un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellidos
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       403:
 *         description: Error al registrar Usuario.
 */
router.post('/register', registrarUsuario);

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Autenticación de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 */
router.post('/login', loginUsuario);

/**
 * @swagger
 * /usuarios/logout:
 *   post:
 *     summary: Cerrar sesión de usuario
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente.
 */
router.post('/logout', logoutUser);

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado o sesión inválida.
 *       500:
 *         description: Error del servidor.
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * @swagger
 * /usuarios/google:
 *   get:
 *     summary: Iniciar autenticación con Google
 *     tags: [Usuarios]
 *     responses:
 *       302:
 *         description: Redirección a Google para login.
 */
router.get('/google', googleAuth);

/**
 * @swagger
 * /usuarios/google/callback:
 *   get:
 *     summary: Callback de autenticación de Google
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de autorización proporcionado por Google.
 *     responses:
 *       302:
 *         description: Redirección al frontend con token.
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/usuarios/google/failure', session: false }),
  googleCallback
);

/**
 * @swagger
 * /usuarios/google/failure:
 *   get:
 *     summary: Manejador de fallo de autenticación con Google
 *     tags: [Usuarios]
 *     responses:
 *       302:
 *         description: Redirección al frontend con error.
 */
router.get('/google/failure', googleAuthFailureHandler);

/**
 * @swagger
 * /usuarios/spotify:
 *   get:
 *     summary: Iniciar autenticación con Spotify
 *     tags: [Usuarios]
 *     responses:
 *       302:
 *         description: Redirección a la página de inicio de sesión de Spotify.
 */
router.get('/spotify', spotifyAuth);

/**
 * @swagger
 * /usuarios/spotify/callback:
 *   get:
 *     summary: Callback de autenticación de Spotify
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente.
 *       302:
 *         description: Redirección en caso de fallo de autenticación.
 */
router.get(
  '/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/usuarios/spotify/failure', session: false }),
  spotifyCallback
);

/**
 * @swagger
 * /usuarios/spotify/connect:
 *   get:
 *     summary: Conectar cuenta de Spotify al perfil de usuario
 *     tags: [Usuarios]
 *     responses:
 *       302:
 *         description: Redirección para autorización de enlace con Spotify.
 */
router.get(
  '/spotify/connect',
  passport.authenticate('spotify-link', {
    scope: [
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'streaming',
      'playlist-modify-public',
      'playlist-modify-private',
      'ugc-image-upload',
      'user-top-read'
    ],
    session: false
  })
);

/**
 * @swagger
 * /usuarios/spotify/callback-link:
 *   get:
 *     summary: Callback tras enlazar cuenta de Spotify
 *     tags: [Usuarios]
 *     responses:
 *       302:
 *         description: Redirección final tras enlace de Spotify.
 */
router.get(
  '/spotify/callback-link',
  passport.authenticate('spotify-link', { failureRedirect: `${process.env.FRONTEND_URL}?error=spotify_link_failed`, session: false }),
  spotifyLinkCallback
);

/**
 * @swagger
 * /usuarios/spotify/failure:
 *   get:
 *     summary: Maneja el fallo de autenticación con Spotify
 *     tags: [Usuarios]
 *     responses:
 *       401:
 *         description: Fallo en la autenticación con Spotify.
 */
router.get('/spotify/failure', spotifyAuthFailureHandler);

/**
 * @swagger
 * /usuarios/ubicacion:
 *   post:
 *     summary: Actualiza la ubicación del usuario
 *     tags: [Ubicación]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ubicación actualizada correctamente.
 */
router.post('/ubicacion', requireAuth, actualizarUbicacion);

/**
 * @swagger
 * /usuarios/ocultar-ubicacion:
 *   post:
 *     summary: Oculta la ubicación del usuario
 *     tags: [Ubicación]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Ubicación ocultada correctamente.
 */
router.post('/ocultar-ubicacion', requireAuth, ocultarUbicacion);

/**
 * @swagger
 * /usuarios/cerca:
 *   get:
 *     summary: Obtener usuarios cercanos
 *     tags: [Ubicación]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitud desde la que buscar usuarios cercanos.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitud desde la que buscar usuarios cercanos.
 *       - in: query
 *         name: radio
 *         schema:
 *           type: number
 *           default: 10
 *         required: false
 *         description: Radio de búsqueda en kilómetros.
 *     responses:
 *       200:
 *         description: Lista de usuarios cercanos encontrados.
 *       400:
 *         description: Parámetros de consulta inválidos.
 *       401:
 *         description: No autenticado o token inválido.
 *       500:
 *         description: Error interno al buscar usuarios cercanos.
 */
router.get('/cerca', requireAuth, obtenerUsuariosCercanos);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listado de usuarios
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Se devuelve la lista de todos los usuarios.
 *       401:
 *         description: No autenticado.
 */
router.get('/', requireAuth, obtenerUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener información de un usuario por su ID
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID único del usuario.
 *     responses:
 *       200:
 *         description: Se retornan los datos del usuario.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: No se encontró un usuario con ese ID.
 */
router.get('/:id', requireAuth, obtenerUsuarioPorId);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualización de datos de usuario
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Identificador único del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               biografia:
 *                 type: string
 *               foto_perfil:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: No se encontró un usuario con ese ID.
 */
router.put('/:id', requireAuth, actualizarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminación de usuario
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado satisfactoriamente.
 *       401:
 *         description: No autenticado.
 *       404:
 *         description: Usuario no encontrado.
 */
router.delete('/:id', requireAuth, eliminarUsuario);

/**
 * @swagger
 * /usuarios/{id}/redes:
 *   put:
 *     summary: Actualizar redes sociales del usuario
 *     tags: [Social y Preferencias]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facebook:
 *                 type: string
 *               instagram:
 *                 type: string
 *               twitter:
 *                 type: string
 *     responses:
 *       200:
 *         description: Redes sociales actualizadas correctamente.
 *       401:
 *         description: No autenticado.
 */
router.put('/:id/redes', requireAuth, actualizarRedesSociales);

/**
 * @swagger
 * /usuarios/{id}/preferencias:
 *   put:
 *     summary: Actualizar preferencias del usuario
 *     tags: [Social y Preferencias]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               genero_musical:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Preferencias actualizadas correctamente.
 *       401:
 *         description: No autenticado.
 */
router.put('/:id/preferencias', requireAuth, actualizarPreferenciasUsuario);

/**
 * @swagger
 * /usuarios/{id}/cancion:
 *   put:
 *     summary: Actualizar última canción escuchada
 *     tags: [Música]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               artista:
 *                 type: string
 *               titulo:
 *                 type: string
 *               album:
 *                 type: string
 *     responses:
 *       200:
 *         description: Canción actualizada correctamente.
 */
router.put('/:id/cancion', requireAuth, actualizarCancion);

/**
 * @swagger
 * /usuarios/{id}/cancion:
 *   get:
 *     summary: Obtener última canción escuchada
 *     tags: [Música]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Detalles de la última canción.
 */
router.get('/:id/cancion', requireAuth, obtenerCancionActual);

/**
 * @swagger
 * /usuarios/{id}/foto:
 *   post:
 *     summary: Subir foto de perfil
 *     tags: [Multimedia]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto de perfil actualizada correctamente.
 *       401:
 *         description: No autenticado.
 */
router.post('/:id/foto', requireAuth, upload.single('foto'), subirFotoPerfil);

module.exports = router;
