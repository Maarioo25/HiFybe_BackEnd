const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellidos: { type: String, trim: true },
  email: { 
    type: String, 
    required: function() { return !this.es_invitado },
    unique: true, 
    sparse: true,
    trim: true 
  },
  auth_proveedor: { 
    type: String, 
    enum: ['local', 'google', 'spotify', 'guest'],
    default: 'local' 
  },
  password: { 
    type: String, 
    required: function() { 
      return this.auth_proveedor === 'local' && !this.es_invitado
    } 
  },
  
  es_invitado: { type: Boolean, default: false },
  fecha_expiracion_invitado: { type: Date },

  googleId: { type: String, unique: true, sparse: true, trim: true },
  ultima_cancion_id: { type: String, default: null },
  bio: { type: String, default: '' },
  ciudad: { type: String, default: '' },
  generos_favoritos: [{ type: String }],
  redes: { 
    instagram: { type: String, default: '' }, 
    twitter: { type: String, default: '' }, 
    tiktok: { type: String, default: '' }
  },
  tema_oscuro: { type: Boolean, default: false },
  spotifyId: { type: String, unique: true, sparse: true, trim: true },
  spotifyAccessToken: { type: String, default: '' },
  spotifyRefreshToken: { type: String, default: '' },
  biografia: { type: String, default: '' },
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
  foto_perfil: { type: String, default: '' },
  fecha_registro: { type: Date, default: Date.now },
  ultima_conexion: { type: Date, default: Date.now }
}, {
  collection: 'usuarios',
  collation: { locale: 'es', strength: 2 }
});

usuarioSchema.index({ ubicacion: '2dsphere' });
usuarioSchema.index({ es_invitado: 1, fecha_expiracion_invitado: 1 });

module.exports = mongoose.model('Usuario', usuarioSchema);