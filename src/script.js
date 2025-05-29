const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const SolicitudAmistad = require('./models/solicitudAmistad');
const Amistad = require('./models/amistad');

(async () => {
  await mongoose.connect('mongodb://mongo:IRwFlFqcQSSJrlnOkkZqbzYlJkQsdISC@switchback.proxy.rlwy.net:57931');

  const user1 = await Usuario.create({ nombre: 'Mario', email: 'mario@test.com', password: '$2b$10$XGUAOcS3TuxAj9npd3HaTe2ep5mwArdOee4t9FpuJ7aoiqyb3LXhC' });
  const user2 = await Usuario.create({ nombre: 'Luigi', email: 'luigi@test.com', password: '123456' });

  const solicitud = await SolicitudAmistad.create({
    de_usuario_id: user1._id,
    para_usuario_id: user2._id
  });

  solicitud.estado = 'aceptada';
  await solicitud.save();

  await Amistad.create({
    usuario_id_1: user1._id,
    usuario_id_2: user2._id,
    estado: 'aceptada'
  });

  console.log('✅ Amistad creada entre Mario y Luigi');
  process.exit();
})();
