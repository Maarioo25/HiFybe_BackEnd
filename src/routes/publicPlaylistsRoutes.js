// src/routes/publicPlaylistsRoutes.js
const express = require('express');
const router = express.Router();
const { getPublicPlaylistByUserAndId } = require('../controllers/publicPlaylistsController');

router.get('/:userId/:playlistId', getPublicPlaylistByUserAndId);

module.exports = router;
