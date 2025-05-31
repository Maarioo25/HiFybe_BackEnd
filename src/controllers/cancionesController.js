const Cancion = require('../models/cancion');
const axios = require('axios');

exports.obtenerCanciones = async (req, res) => {
  const canciones = await Cancion.find();
  res.json(canciones);
};

exports.obtenerCancionPorId = async (req, res) => {
  const cancion = await Cancion.findById(req.params.id);
  res.json(cancion);
};

exports.crearCancion = async (req, res) => {
  const nuevaCancion = await Cancion.create(req.body);
  res.json(nuevaCancion);
};

exports.actualizarCancion = async (req, res) => {
  const cancion = await Cancion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(cancion);
};

exports.eliminarCancion = async (req, res) => {
  await Cancion.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Canción eliminada' });
};

exports.obtenerCancionSpotify = async (req, res) => {
  const { id } = req.params;

  try {
    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const token = tokenRes.data.access_token;

    const spotifyRes = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const track = spotifyRes.data;

    return res.json({
      id: track.id,
      nombre: track.name,
      artista: track.artists.map(a => a.name).join(', '),
      imagen: track.album.images?.[0]?.url || null,
      uri: track.uri
    });
  } catch (err) {
    console.error('Error al obtener canción de Spotify:', err.response?.data || err.message);
    return res.status(500).json({ mensaje: 'Error al obtener datos de Spotify' });
  }
};

