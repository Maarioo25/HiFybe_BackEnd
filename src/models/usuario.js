// src/models/usuario.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre:              { type: String,  required: true, trim: true },
  apellidos:           { type: String,  trim: true },
  email:               { type: String,  required: true, unique: true, trim: true },
  auth_proveedor:      { type: String,  enum: ['local', 'google', 'spotify'], default: 'local' },
  password:            { type: String,  required: function () { return this.auth_proveedor === 'local' } },
  googleId:            { type: String,  unique: true, sparse: true, trim: true },
  ultima_cancion_id:   { type: String, default: null },


  // 🎵 Campos para Spotify
  spotifyId:           { type: String,  unique: true, sparse: true, trim: true },
  spotifyAccessToken:  { type: String,  default: '' },
  spotifyRefreshToken: { type: String,  default: '' },

  biografia:           { type: String,  default: '' },
  ubicacion_lat:       { type: Number,  default: null },
  ubicacion_lon:       { type: Number,  default: null },
  ubicacion: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      default: [0, 0]
    }
  },
  compartir_ubicacion: { type: Boolean, default: false },
  foto_perfil:         { type: String,  default: '' },
  fecha_registro:      { type: Date,    default: Date.now },
  ultima_conexion:     { type: Date,    default: Date.now }
}, {
  collection: 'usuarios',
  collation: { locale: 'es', strength: 2 }
});

// 🗺️ Índice de geolocalización
usuarioSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Usuario', usuarioSchema);
