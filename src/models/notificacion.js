const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    contenido: String,
    fecha: { type: Date, default: Date.now },
    leido: { type: Boolean, default: false },
  }, { collection: 'notificaciones' });
  
  module.exports = mongoose.model('Notificacion', notificacionSchema);