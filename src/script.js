const mongoose = require('mongoose');
const Usuario = require('./models/usuario');

(async () => {
  await mongoose.connect('mongodb://mongo:IRwFlFqcQSSJrlnOkkZqbzYlJkQsdISC@switchback.proxy.rlwy.net:57931');

  const updated = await Usuario.findOneAndUpdate(
    { email: 'luigi@test.com' },
    { foto_perfil: 'https://i.pinimg.com/736x/cb/44/76/cb44766dd7b181b93c4a242844e41ac0.jpg' },
    { new: true }
  );

  console.log('Usuario actualizado:', updated);
  process.exit();
})();
