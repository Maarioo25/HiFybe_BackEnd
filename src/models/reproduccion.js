const mongoose = require('mongoose');

const reproduccionSchema = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    cancion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cancion', required: true },
    fecha_hora: { type: Date, default: Date.now },
    ubicacion_lat: Number,
    ubicacion_lon: Number,
  }, { collection: 'reproducciones' });
  
  module.exports = mongoose.model('Reproduccion', reproduccionSchema);