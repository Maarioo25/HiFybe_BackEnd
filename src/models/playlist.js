// src/models/Playlist.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, default: '' },
  imagen: { type: String, default: '' },
  es_publica: { type: Boolean, default: false },
  owner: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  canciones: [{ type: Schema.Types.ObjectId, ref: 'Cancion' }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
