const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fecha_creacion: { type: Date, default: Date.now },
    es_publica: { type: Boolean, default: false },
    portada: String,
  }, { collection: 'playlists' });
  
  module.exports = mongoose.model('Playlist', playlistSchema);