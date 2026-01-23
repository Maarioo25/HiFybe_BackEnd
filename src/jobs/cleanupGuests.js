// src/jobs/cleanupGuests.js

const cron = require('node-cron');
const Usuario = require('../models/usuario');
const Amistad = require('../models/amistad');
const Conversacion = require('../models/conversacion');
const Mensaje = require('../models/mensaje');
const Notificacion = require('../models/notificacion');
const Playlist = require('../models/playlist');
const Reproduccion = require('../models/reproduccion');

// Ejecutar cada día a las 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('[Cleanup] Iniciando limpieza de invitados expirados...');
    
    // Buscar invitados expirados
    const invitadosExpirados = await Usuario.find({
      es_invitado: true,
      fecha_expiracion_invitado: { $lt: new Date() }
    });

    if (invitadosExpirados.length === 0) {
      console.log('[Cleanup] No hay invitados expirados');
      return;
    }

    const idsInvitados = invitadosExpirados.map(u => u._id);

    // Eliminar datos relacionados
    await Amistad.deleteMany({
      $or: [
        { usuario_id_1: { $in: idsInvitados } },
        { usuario_id_2: { $in: idsInvitados } }
      ]
    });

    await Conversacion.deleteMany({
      $or: [
        { usuario1_id: { $in: idsInvitados } },
        { usuario2_id: { $in: idsInvitados } }
      ]
    });

    await Mensaje.deleteMany({ emisor_id: { $in: idsInvitados } });
    await Notificacion.deleteMany({ usuario_id: { $in: idsInvitados } });
    await Playlist.deleteMany({ owner: { $in: idsInvitados } });
    await Reproduccion.deleteMany({ usuario_id: { $in: idsInvitados } });

    // Eliminar usuarios invitados
    const resultado = await Usuario.deleteMany({
      _id: { $in: idsInvitados }
    });

    console.log(`[Cleanup] ${resultado.deletedCount} invitados eliminados`);
    
  } catch (err) {
    console.error('[Cleanup] Error en limpieza de invitados:', err);
  }
});

module.exports = cron;