const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
  _id: { type: String }, // 👈 Esto es clave
  nombre: String,
  descripcion: String,
  portada: String,
  privada: Boolean,
  owner: { type: String, ref: 'Usuario' },
  canciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cancion' }]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
