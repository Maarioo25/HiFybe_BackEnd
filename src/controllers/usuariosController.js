const mongoose = require('mongoose');
const passport = require('passport');
const qs = require('qs');
const axios = require('axios')
const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const router = express.Router();

// ===================== HELPERS ===================== //

function limpiarUsuario(usuario) {
  const {
    password,
    contrasena_reset_token,
    contrasena_reset_expiracion,
    __v,
    ...resto
  } = usuario._doc;
  return resto;
}


async function refrescarToken(refreshToken) {
  const authHeader = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await axios.post('https://accounts.spotify.com/api/token',
    qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }),
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}


function emitirTokenYCookie(usuario, req, res) {
  const isMobile = req.query?.mobile === "true" || req.query?.state === "mobile" || req.body?.mobile === true;

  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  if (isMobile) {
    return res.redirect(`hifybe-movil://spotify-auth-callback?token=${token}`);
  } else {
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      domain: '.mariobueno.info',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log("✅ Token de Inicio de Sesión enviado (manual).");

    // ✅ Aquí devolvemos JSON en vez de redirección
    return res.json({
      mensaje: 'Inicio de sesión correcto',
      usuario,
      spotifyAccessToken: usuario.spotifyAccessToken ?? null
    });
  }
}






// ===================== REGISTRO ===================== //

exports.registrarUsuario = async (req, res) => {
  try {
    // Ahora aceptamos foto_perfil opcionalmente en el body
    const { nombre, apellidos, email, password, foto_perfil } = req.body;

    // Verificar si ya existe el usuario por correo
    const usuarioExistePorCorreo = await Usuario.findOne({ email });
    const usuarioEstaRegistradoConGoogle = await Usuario.findOne({ email, auth_proveedor: 'google' });
    const usuarioEstaRegistradoConSpotify = await Usuario.findOne({ email, auth_proveedor: 'spotify' });

    if (usuarioEstaRegistradoConGoogle)
      return res.status(403).json({ mensaje: 'Inicia sesión a través de Google.' });

    if (usuarioEstaRegistradoConSpotify)
      return res.status(403).json({ mensaje: 'Inicia sesión a través de Spotify.' });

    if (usuarioExistePorCorreo)
      return res.status(403).json({ mensaje: 'Esta dirección de correo ya está registrada, inicia sesión.' });

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Si no se proporcionó foto_perfil (o viene vacío), asignamos DEFAULT_AVATAR
    let finalAvatarUrl = foto_perfil;
    if (!foto_perfil || foto_perfil.trim() === "") {
      finalAvatarUrl = "/avatars/default.jpg"; // "/avatars/default.jpg"
    }

    // Crear el nuevo usuario, incluyendo foto_perfil (sea la proporcionada o la por defecto)
    const usuario = await Usuario.create({
      nombre,
      apellidos,
      email,
      password: hashedPassword,
      foto_perfil: finalAvatarUrl
    });

    // Devolvemos el usuario sin campos sensibles
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuario: limpiarUsuario(usuario)
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ mensaje: 'Error al registrar usuario.' });
  }
};

// ===================== LOGIN ===================== //

exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) return res.status(400).json({ mensaje: 'Credenciales inválidas.' });

    usuario.ultima_conexion = Date.now();
    await usuario.save();

    return emitirTokenYCookie(usuario, req, res);
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ mensaje: 'Error al iniciar sesión.' });
  }
};


// ===================== AUTENTICACIÓN ACTUAL ===================== //

exports.getCurrentUser = async (req, res) => {
  try {
    console.log('[Usuario] req.user:', req.user); // <-- LOG

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      console.warn('[Usuario] Usuario no encontrado');
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    console.log('[Usuario] Usuario encontrado:', usuario); // <-- LOG
    res.json(limpiarUsuario(usuario));
  } catch (err) {
    console.error('[Usuario] Error al obtener usuario actual:', err);
    res.status(500).json({ mensaje: 'Error al obtener usuario actual' });
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
    const camposPermitidos = [ 'nombre', 'apellidos', 'biografia', 'foto_perfil', 'password', 'bio', 'ciudad', 'generos_favoritos', 'redes', 'tema_oscuro'];
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

// ===================== GEOLOCALIZACIÓN ===================== //

exports.actualizarUbicacion = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitud y longitud requeridas' });
    }

    await Usuario.findByIdAndUpdate(userId, {
      ubicacion_lat: latitude,
      ubicacion_lon: longitude,
      compartir_ubicacion: true,
      ubicacion: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      ultima_conexion: new Date()
    });

    res.status(200).json({ mensaje: 'Ubicación actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error actualizando ubicación' });
  }
};

exports.obtenerUsuariosCercanos = async (req, res) => {
  try {
    const { latitude, longitude, radio = 5000 } = req.query; // radio en km

    const usuarios = await Usuario.find({
      ubicacion: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: radio * 1000 // metros
        }
      }
    }).select('nombre apellidos foto_perfil ubicacion');

    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error buscando usuarios cercanos' });
  }
};

exports.ocultarUbicacion = async (req, res) => {
  try {
    const userId = req.user._id;

    await Usuario.findByIdAndUpdate(userId, {
      compartir_ubicacion: false,
      $unset: {
        ubicacion: "",
        ubicacion_lat: "",
        ubicacion_lon: ""
      }
    });

    res.status(200).json({ mensaje: "Ubicación eliminada correctamente" });
  } catch (error) {
    console.error("Error al ocultar ubicación:", error);
    res.status(500).json({ mensaje: "Error interno al ocultar ubicación" });
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

exports.spotifyAuth = (req, res, next) => {
  passport.authenticate('spotify', {
    scope: [
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-email',
      'user-read-private',
      'playlist-modify-public',
      'playlist-modify-private',
      'ugc-image-upload',
      'user-top-read'
    ],
    showDialog: true,
    session: false,
    callbackURL: process.env.SPOTIFY_CALLBACK_URL,
    state: req.query.mobile === "true" ? "mobile" : "web"
  })(req, res, next);
};



exports.spotifyCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=spotify_auth_failed`);
    }

    req.user.ultima_conexion = Date.now();
    await req.user.save();

    return emitirTokenYCookie(req.user, req, res);

  } catch (err) {
    console.error('Error en spotifyCallback:', err);
    return res.redirect(`${process.env.FRONTEND_URL}/auth?error=server_error`);
  }
};



exports.spotifyLinkCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=sin_usuario`);
    }

    req.user.ultima_conexion = Date.now();
    await req.user.save();

    const sp_token = req.user.spotifyAccessToken;

    if (!sp_token) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=sin_token`);
    }

    // Redirige al frontend base con el token de Spotify
    return res.redirect(`${process.env.FRONTEND_URL}?spotify_token=${sp_token}`);

  } catch (err) {
    console.error('Error en spotifyLinkCallback:', err);
    return res.redirect(`${process.env.FRONTEND_URL}?error=server_error`);
  }
};







exports.spotifyAuthFailureHandler = (req, res) => {
  console.error('Autenticación con Spotify fallida.', req.query.error);
  res.redirect(`${process.env.FRONTEND_URL}/login?error=spotify_auth_failed`);
};

// ===================== LOGOUT ===================== //

exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: '.mariobueno.info',
    path: '/'
  });
  console.log("✅ Cookie enviada.");
  res.status(200).json({ mensaje: 'Sesión cerrada exitosamente' });
};



//------------Ultima canción---------------//

exports.actualizarCancion = async (req, res) => {
  const { id } = req.params;
  const { trackId } = req.body;

  if (!trackId) return res.status(400).json({ error: 'trackId requerido' });

  try {
    await Usuario.findByIdAndUpdate(
      id,
      { ultima_cancion_id: trackId },
      { new: true }
    );
    res.json({ success: true, trackId });
  } catch (err) {
    console.error('Error al guardar canción:', err);
    res.status(500).json({ error: 'Error al guardar canción' });
  }
};

exports.obtenerCancionActual = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario || !usuario.ultima_cancion_id || !usuario.spotifyAccessToken) {
      return res.json({ nombre: null });
    }

    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/tracks/${usuario.ultima_cancion_id}`,
        {
          headers: { Authorization: `Bearer ${usuario.spotifyAccessToken}` }
        }
      );

      const track = response.data;

      if (!track || !track.name) {
        return res.json({ nombre: null });
      }

      res.json({
        nombre: track.name,
        artista: track.artists.map(a => a.name).join(', '),
        imagen: track.album.images[0]?.url || '',
        uri: track.uri
      });

    } catch (spotifyErr) {
      console.warn(`[obtenerCancionActual] Token expirado, intentando refrescar para usuario ${id}`);

      try {
        const nuevoToken = await refrescarToken(usuario.spotifyRefreshToken);
        usuario.spotifyAccessToken = nuevoToken;
        await usuario.save();

        const retry = await axios.get(
          `https://api.spotify.com/v1/tracks/${usuario.ultima_cancion_id}`,
          {
            headers: { Authorization: `Bearer ${nuevoToken}` }
          }
        );

        const track = retry.data;

        res.json({
          nombre: track.name,
          artista: track.artists.map(a => a.name).join(', '),
          imagen: track.album.images[0]?.url || '',
          uri: track.uri
        });

      } catch (refreshErr) {
        console.error(`[obtenerCancionActual] Fallo al refrescar token para usuario ${id}:`, refreshErr.response?.data || refreshErr.message);
        return res.json({ nombre: null });
      }
    }


  } catch (err) {
    console.error('Error general al obtener canción:', err);
    res.status(500).json({ error: 'Error al obtener canción' });
  }
};

exports.actualizarRedesSociales = async (req, res) => {
  try {
    const { instagram, twitter, tiktok } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'redes.instagram': instagram,
          'redes.twitter': twitter,
          'redes.tiktok': tiktok
        }
      },
      { new: true }
    );

    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Redes sociales actualizadas.', usuario: limpiarUsuario(usuario) });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar redes sociales.' });
  }
};

exports.subirFotoPerfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ningún archivo' });
    }

    const rutaFoto = `/uploads/${req.file.filename}`;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { foto_perfil: rutaFoto },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.json({
      mensaje: 'Foto actualizada',
      url: rutaFoto,
      usuario: limpiarUsuario(usuario)
    });
  } catch (err) {
    console.error('Error al subir foto:', err);
    res.status(500).json({ mensaje: 'Error al subir imagen' });
  }
};



exports.actualizarPreferenciasUsuario = async (req, res) => {
  try {
    const { ciudad, generos_favoritos, tema_oscuro } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      {
        ...(ciudad && { ciudad }),
        ...(generos_favoritos && { generos_favoritos }),
        ...(tema_oscuro !== undefined && { tema_oscuro }),
      },
      { new: true }
    );

    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Preferencias actualizadas.', usuario: limpiarUsuario(usuario) });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar preferencias.' });
  }
};



