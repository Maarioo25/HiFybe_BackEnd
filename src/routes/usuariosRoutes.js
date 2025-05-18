// routes/usuarios.js
const express = require('express');
const passport = require('passport');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  
  
  googleAuth,
  googleCallback,
  googleAuthFailureHandler,


  spotifyAuth, 
  spotifyCallback, 
  spotifyAuthFailureHandler,


  getCurrentUser,
  logoutUser
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
 *     description: Endpoint para crear un nuevo usuario en la plataforma.
 *     tags: [Usuarios]
 *     requestBody:
 *       description: Datos necesarios para registrar el usuario.
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
 *               email:
 *                 type: string
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
 *     description: Endpoint para iniciar sesión con las credenciales del usuario.
 *     tags: [Usuarios]
 *     requestBody:
 *       description: Credenciales de acceso del usuario.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 */
router.post('/login', loginUsuario);

/**
 * @swagger
 * /usuarios/google:
 *   get:
 *     summary: Iniciar autenticación con Google
 *     description: Redirige al usuario al flujo de OAuth de Google.
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
 *     description: Punto de retorno de Google con el código de autorización.
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
 *     description: Endpoint al que Google redirige en caso de fallo de autenticación. Redirige al frontend con un mensaje de error.
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
 *     tags: [Autenticación]
 *     responses:
 *       302:
 *         description: Redirección a la página de inicio de sesión de Spotify
 */
router.get('/spotify', spotifyAuth);

/**
 * @swagger
 * /usuarios/spotify/callback:
 *   get:
 *     summary: Callback de autenticación de Spotify
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente
 *       302:
 *         description: Redirección en caso de fallo de autenticación
 */
router.get(
  '/spotify/callback',
  passport.authenticate('spotify', {
    failureRedirect: '/usuarios/spotify/failure',
    session: false
  }),
  spotifyCallback
);

/**
 * @swagger
 * /usuarios/spotify/failure:
 *   get:
 *     summary: Maneja el fallo de autenticación de Spotify
 *     tags: [Autenticación]
 *     responses:
 *       401:
 *         description: Fallo en la autenticación con Spotify
 */
router.get('/spotify/failure', spotifyAuthFailureHandler);

// Rutas que requieren autenticación

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     description: Recupera la información del usuario actualmente autenticado a través de la cookie de sesión.
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
 *                   type: object
 *                   description: Objeto con los datos del usuario (sin información sensible como contraseña).
 *       401:
 *         description: No autenticado o sesión inválida.
 *       500:
 *         description: Error del servidor.
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * @swagger
 * /usuarios/logout:
 *   post:
 *     summary: Cerrar sesión de usuario
 *     description: Cierra la sesión del usuario autenticado eliminando la cookie de sesión.
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente.
 *       500:
 *         description: Error al cerrar sesión.
 */
router.post('/logout', requireAuth, logoutUser);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listado de usuarios
 *     description: Endpoint para obtener la lista de todos los usuarios registrados. Requiere autenticación.
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
 *     description: Recupera los datos completos de un usuario a partir del identificador proporcionado. Requiere autenticación.
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     description: Actualiza la información de un usuario existente identificándolo por su ID. Requiere autenticación.
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único del usuario.
 *     requestBody:
 *       description: Objeto JSON con la información actualizada del usuario.
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
 *             example:
 *               nombre: "Nuevo Nombre"
 *               apellidos: "Nuevos Apellidos"
 *               biografia: "Nueva biografía"
 *               foto_perfil: "https://imagen.jpg"
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
 *     description: Elimina el usuario identificado por su ID. Requiere autenticación.
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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

module.exports = router;
