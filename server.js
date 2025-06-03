const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const SpotifyStrategy = require('passport-spotify').Strategy;
const bcrypt = require('bcryptjs');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const app = express();

  // ✅ CORS configurado correctamente
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://mariobueno.info',
    'https://api.mariobueno.info'
  ];

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
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

passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: process.env.SPOTIFY_CALLBACK_URL,
  passReqToCallback: true,
  skipUserProfile: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const User = require('./src/models/usuario');

    // 👇 Llamada manual al perfil
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

    let usuario = await User.findOne({ email });

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

    // Siempre guardar/actualizar tokens y spotifyId
    usuario.spotifyId = userData.id;
    usuario.spotifyAccessToken = accessToken;
    usuario.spotifyRefreshToken = refreshToken;
    await usuario.save();

    console.log('✅ Usuario Spotify autenticado:', usuario.email);

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

    // Extraer el token JWT de la cookie de forma segura
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

    // Buscar usuario actual
    const user = await User.findById(userId);
    if (!user) return done(new Error('Usuario no encontrado'), null);

    // Verificar que el spotifyId no está ya en uso por otro usuario
    const existente = await User.findOne({ spotifyId: profile.id });
    if (existente && existente._id.toString() !== user._id.toString()) {
      return done(new Error('Esta cuenta de Spotify ya está vinculada a otro usuario'), null);
    }

    // Asignar si es seguro
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




  const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'API de HiFybe',
        version: '1.0.0',
        description: 'Documentación de la API con Swagger'
      },
      servers: [{ url: 'https://api.mariobueno.info', description: 'API Pública' }]
    },
    apis: ['./src/routes/*.js']
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Rutas principales
  app.get('/', (req, res) => {
    res.send('API HiFybe activa 🚀');
  });

  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

  app.use('/usuarios', require('./src/routes/usuariosRoutes'));
  app.use('/canciones', require('./src/routes/cancionesRoutes'));
  app.use('/playlists', require('./src/routes/playlistsRoutes'));
  app.use('/reproducciones', require('./src/routes/reproduccionesRoutes'));
  app.use('/amistades', require('./src/routes/amistadesRoutes'));
  app.use('/conversaciones', require('./src/routes/conversacionesRoutes'));
  app.use('/notificaciones', require('./src/routes/notificacionesRoutes'));
  app.use('/spotify', require('./src/routes/spotifyRoutes'))
  app.use('/public', require('./src/routes/publicPlaylistsRoutes'));


  // Conexión a Mongo
  mongoose.connect(process.env.MONGO_URL)
    .then(() => {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en https://api.mariobueno.info`);
        console.log(`Swagger disponible en https://api.mariobueno.info/docs`);
      });
    })
    .catch(err => {
      console.error('Error conectando a MongoDB:', err);
    });
