const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
    conversacion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversacion', required: true },
    emisor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    contenido: String,
    fecha_envio: { type: Date, default: Date.now },
    cancion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cancion', default: null },
    leido: { type: Boolean, default: false },
  }, { collection: 'mensajes' });
  
  module.exports = mongoose.model('Mensaje', mensajeSchema);