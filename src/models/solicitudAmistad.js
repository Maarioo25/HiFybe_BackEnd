const mongoose = require('mongoose');

const solicitudAmistadSchema = new mongoose.Schema({
    de_usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    para_usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha_envio: { type: Date, default: Date.now },
    estado: { type: String, enum: ['pendiente', 'aceptada', 'rechazada'], default: 'pendiente' },
  }, { collection: 'solicitudesDeAmistad' });
  
  module.exports = mongoose.model('SolicitudAmistad', solicitudAmistadSchema);