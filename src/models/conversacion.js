const mongoose = require('mongoose');

const conversacionSchema = new mongoose.Schema({
    usuario1_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    usuario2_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha_inicio: { type: Date, default: Date.now },
  }, { collection: 'conversaciones' });
  
  module.exports = mongoose.model('Conversacion', conversacionSchema);