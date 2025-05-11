const mongoose = require('mongoose');

const playlistCancionSchema = new mongoose.Schema({
    playlist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
    cancion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cancion', required: true },
    orden: Number,
  }, { collection: 'playlistCanciones' });
  
  module.exports = mongoose.model('PlaylistCancion', playlistCancionSchema);