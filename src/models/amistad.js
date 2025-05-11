const mongoose = require('mongoose');

const amistadSchema = new mongoose.Schema({
  usuario_id_1: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  usuario_id_2: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fecha_inicio: { type: Date, default: Date.now },
  estado: { type: String, enum: ['pendiente', 'aceptada', 'bloqueada'], default: 'pendiente' }
}, { collection: 'amistades' });

module.exports = mongoose.model('Amistad', amistadSchema);
