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
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/usuarios/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const User = require('./src/models/usuario');
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No se encontró un email en el perfil de Google'), null);

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
      }

      if (!user.nombre || user.nombre === 'Usuario') {
        user.nombre = profile.name?.givenName || user.nombre;
      }

      if (!user.apellidos || user.apellidos === 'Desconocido') {
        user.apellidos = profile.name?.familyName || user.apellidos;
      }

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


passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: process.env.SPOTIFY_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const User = require('./src/models/usuario');
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No se encontró un email en el perfil de Spotify'), null);

    let user = await User.findOne({ email });

    const nameParts = profile.displayName?.split(' ') || ['Usuario'];
    const nombreSpotify = nameParts[0] || 'Usuario';
    const apellidosSpotify = nameParts.slice(1).join(' ') || 'Desconocido';

    if (user) {
      if (!user.spotifyId) {
        user.spotifyId = profile.id;
      }

      if (!user.nombre || user.nombre === 'Usuario') {
        user.nombre = nombreSpotify;
      }

      if (!user.apellidos || user.apellidos === 'Desconocido') {
        user.apellidos = apellidosSpotify;
      }

      await user.save();
    } else {
      user = new User({
        spotifyId: profile.id,
        nombre: nombreSpotify,
        apellidos: apellidosSpotify,
        email,
        foto_perfil: profile.photos?.[0] || '',
        password: await bcrypt.hash(Math.random().toString(36), 10),
        auth_proveedor: 'spotify'
      });
      await user.save();
    }

    done(null, user);
  } catch (err) {
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
    servers: [{ url: 'http://127.0.0.1:5000', description: 'API Local' }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/usuarios', require('./src/routes/usuariosRoutes'));
app.use('/canciones', require('./src/routes/cancionesRoutes'));
app.use('/playlists', require('./src/routes/playlistsRoutes'));
app.use('/reproducciones', require('./src/routes/reproduccionesRoutes'));
app.use('/amistades', require('./src/routes/amistadesRoutes'));
app.use('/conversaciones', require('./src/routes/conversacionesRoutes'));
app.use('/notificaciones', require('./src/routes/notificacionesRoutes'));

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT,'0.0.0.0', () => {
      console.log(`Servidor corriendo en http://127.0.0.1:${PORT}`);
      console.log(`Swagger disponible en http://127.0.0.1:${PORT}/docs`);
    });
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
  });
