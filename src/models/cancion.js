const mongoose = require('mongoose');

const cancionSchema = new mongoose.Schema({
  cancion_id: { type: Number, required: true, unique: true },
  titulo: { type: String, required: true },
  artista: { type: String, required: true },
  album: { type: String },
  duracion: { type: Number, required: true },
  url_audio: { type: String },
  fecha_lanzamiento: { type: Date }
}, { collection: 'canciones' });

module.exports = mongoose.model('Cancion', cancionSchema);
