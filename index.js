const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const SpotifyStrategy = require('passport-spotify').Strategy;
const bcrypt = require('bcryptjs');
const { swaggerDocs, getSwaggerHTML } = require('./src/config/swaggerConfig');
const jwt = require('jsonwebtoken');
const path = require('path');

dotenv.config();

// Configuración de la conexión a MongoDB
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://hifybe.vercel.app',
  'https://hifybe-backend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('Petición desde origin:', origin);
    // Permitir peticiones sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization', 'Set-Cookie']
}));


// Middleware de Express
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configuración de Passport para Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const User = require('./src/models/usuario');
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No se encontró un email en el perfil de Google'), null);

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) user.googleId = profile.id;
      if (!user.nombre || user.nombre === 'Usuario') user.nombre = profile.name?.givenName || user.nombre;
      if (!user.apellidos || user.apellidos === 'Desconocido') user.apellidos = profile.name?.familyName || user.apellidos;
      await user.save();
    } else {
      user = new User({
        googleId: profile.id,
        nombre: profile.name?.givenName || 'Usuario',
        apellidos: profile.name?.familyName || 'Desconocido',
        email,
        foto_perfil: profile.photos?.[0]?.value || '',
        password: await bcrypt.hash(Math.random().toString(36), 10),
        auth_proveedor: 'google'
      });
      await user.save();
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const fetch = require('node-fetch');

// Configuración de Passport para Spotify
passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: process.env.SPOTIFY_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  console.log('🎯 Entrando en strategy normal de Spotify');
  if (!accessToken) {
    console.error('[Spotify] No se recibió accessToken');
    return done(new Error('No se recibió accessToken'), null);
  }
  try {
    const User = require('./src/models/usuario');

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Spotify] Error al obtener perfil:', response.status, errorText);
      return done(new Error('No se pudo obtener el perfil de Spotify'), null);
    }

    const userData = await response.json();
    console.log('[Spotify] Perfil recibido:', userData);

    const email = userData.email ?? `${userData.id}@spotify.local`;

    let usuario;

    if (req.user) {
      usuario = await User.findById(req.user._id);
    } else {
      usuario = await User.findOne({ email });

      if (!usuario) {
        usuario = new User({
          spotifyId: userData.id,
          email: email,
          nombre: userData.display_name || 'Usuario',
          apellidos: 'Desconocido',
          password: await bcrypt.hash(Math.random().toString(36), 10),
          foto_perfil: userData.images?.[0]?.url || '',
          auth_proveedor: 'spotify'
        });
      }
    }

    usuario.spotifyId = userData.id;
    usuario.spotifyAccessToken = accessToken;
    usuario.spotifyRefreshToken = refreshToken;
    await usuario.save();

    console.log('Tokens guardados:', {
      access: usuario.spotifyAccessToken,
      refresh: usuario.spotifyRefreshToken
    });

    console.log('Usuario autenticado o vinculado:', usuario.email);

    done(null, usuario);

  } catch (err) {
    console.error('[Spotify] Error manual al obtener perfil:', err);
    done(err, null);
  }
}));

passport.use('spotify-link', new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: process.env.SPOTIFY_LINK_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const User = require('./src/models/usuario');

    let userId;
    try {
      const token = req.cookies?.token;
      if (!token) return done(new Error('Token no presente en cookies'), null);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (jwtError) {
      console.error('[Spotify-Link] Error al verificar JWT:', jwtError.message);
      return done(new Error('Token JWT inválido'), null);
    }

    const user = await User.findById(userId);
    if (!user) return done(new Error('Usuario no encontrado'), null);

    const existente = await User.findOne({ spotifyId: profile.id });
    if (existente && existente._id.toString() !== user._id.toString()) {
      return done(new Error('Esta cuenta de Spotify ya está vinculada a otro usuario'), null);
    }

    user.spotifyId = profile.id;
    user.spotifyAccessToken = accessToken;
    user.spotifyRefreshToken = refreshToken;
    await user.save();

    console.log(`[Spotify-Link] Usuario ${user.email} vinculado correctamente con Spotify`);
    done(null, user);
  } catch (err) {
    console.error('[Spotify-Link] Error en estrategia:', err);
    done(err, null);
  }
}));

// Endpoint para servir el JSON de Swagger
app.get('/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// Endpoint para servir la UI de Swagger
app.get('/docs', (req, res) => {
  res.send(getSwaggerHTML());
});


app.get('/', (req, res) => {
  res.send('API HiFybe activa y funcionando, visita /docs para la documentación');
});

// Middleware de autenticación
app.use('/usuarios', require('./src/routes/usuariosRoutes'));
app.use('/canciones', require('./src/routes/cancionesRoutes'));
app.use('/playlists', require('./src/routes/playlistsRoutes'));
app.use('/reproducciones', require('./src/routes/reproduccionesRoutes'));
app.use('/amistades', require('./src/routes/amistadesRoutes'));
app.use('/conversaciones', require('./src/routes/conversacionesRoutes'));
app.use('/notificaciones', require('./src/routes/notificacionesRoutes'));
app.use('/spotify', require('./src/routes/spotifyRoutes'));
app.use('/public', require('./src/routes/publicPlaylistsRoutes'));

// Conexión a MongoDB con configuración para serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = db;
    console.log('Conectado a MongoDB Atlas');
    return db;
  } catch (err) {
    console.error('Error conectando a MongoDB:', err);
    throw err;
  }
}

// Conectar antes de cada petición
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Error de conexión a base de datos' });
  }
});


// Para producción en Vercel, exporta app
module.exports = app;

// Para desarrollo local, mantén el listen solo cuando se ejecuta directamente
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Swagger disponible en http://localhost:${PORT}/docs`);
  });
}
