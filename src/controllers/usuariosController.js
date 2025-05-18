const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const passport = require('passport');

const User = require('../models/usuario');

// ===================== HELPERS ===================== //

const limpiarUsuario = (usuario) => {
  if (!usuario || !usuario._doc) return usuario;
  const {
    password,
    contrasena_reset_token,
    contrasena_reset_expiracion,
    __v,
    ...resto
  } = usuario._doc;
  return resto;
};

const emitirTokenYCookie = (usuario, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en variables de entorno');
  }

  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    domain: '.mariobueno.info',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  });

  return token;
};

// ===================== REGISTRO ===================== //

exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, email, password } = req.body;
    const usuarioExistePorCorreo = await Usuario.findOne({ email });
    const usuarioEstaRegistradoConGoogle = await Usuario.findOne({ email , auth_proveedor: 'google' })
    const usuarioEstaRegistradoConSpotify = await Usuario.findOne({ email , auth_proveedor: 'spotify' })

    if (usuarioEstaRegistradoConGoogle)
      return res.status(403).json({ mensaje: 'Inicia sesión a través de Google.' });

    if (usuarioEstaRegistradoConSpotify)
      return res.status(403).json({ mensaje: 'Inicia sesión a través de Spotify.' });

    if (usuarioExistePorCorreo) 
      return res.status(403).json({ mensaje: 'Esta dirección de correo ya esta registrada, Inicia sesión.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, apellidos, email, password: hashedPassword });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuario: limpiarUsuario(usuario)
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar usuario.' });
  }
};

// ===================== LOGIN ===================== //

exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });

    if (!usuario)
      return res.status(400).json({ mensaje: 'El usuario o la contraseña no coinciden.'});

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido)
      return res.status(400).json({ mensaje: 'El usuario o la contraseña no coinciden.'});

    usuario.ultima_conexion = Date.now();
    await usuario.save();

    emitirTokenYCookie(usuario, res);

    res.json({
      mensaje: 'Login exitoso.',
      usuario: limpiarUsuario(usuario)
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión.' });
  }
};

// ===================== AUTENTICACIÓN ACTUAL ===================== //

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    const spotify = req.session?.spotify || null;

    res.json({
      user,
      spotifyAccessToken: spotify?.accessToken || null,
      spotifyRefreshToken: spotify?.refreshToken || null
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener el usuario actual' });
  }
};

// ===================== CRUD USUARIOS ===================== //

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios.map(u => limpiarUsuario(u)));
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios.' });
  }
};

exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID inválido.' });
    }
    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json(limpiarUsuario(usuario));
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuario.' });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const camposPermitidos = ['nombre', 'apellidos', 'biografia', 'foto_perfil', 'password'];
    const actualizaciones = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        actualizaciones[campo] = req.body[campo];
      }
    }
    if (actualizaciones.password) {
      actualizaciones.password = await bcrypt.hash(actualizaciones.password, 10);
    }
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, actualizaciones, { new: true });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Usuario actualizado.', usuario: limpiarUsuario(usuario) });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario.' });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Usuario eliminado.' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario.' });
  }
};

// ===================== GOOGLE OAUTH ===================== //

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
  showDialog: true
});

exports.googleCallback = async (req, res) => {
  if (req.user) {
    try {
      req.user.ultima_conexion = Date.now();
      await req.user.save();
      emitirTokenYCookie(req.user, res);
      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (err) {
      console.error('ERROR CALLBACK:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

exports.googleAuthFailureHandler = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
};

// ===================== SPOTIFY OAUTH ===================== //

exports.spotifyAuth = passport.authenticate('spotify', { 
  scope: [
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-email',
  'user-read-private'],
  showDialog: true
});


exports.spotifyCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=spotify_auth_failed`);
    }

    req.user.ultima_conexion = Date.now();
    await req.user.save();
    emitirTokenYCookie(req.user, res);
    return res.redirect(process.env.FRONTEND_URL);
  } catch (err) {
    console.error('Error en spotifyCallback:', err);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};





exports.spotifyAuthFailureHandler = (req, res) => {
  console.error('Autenticación con Spotify fallida.', req.query.error);
  res.redirect(`${process.env.FRONTEND_URL}/login?error=spotify_auth_failed`);
};

// ===================== LOGOUT ===================== //

// controllers/authController.js
exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: '.mariobueno.info',  
    path: '/'                   
  });
  return res
    .status(200)
    .json({ mensaje: 'Sesión cerrada exitosamente' });
};



