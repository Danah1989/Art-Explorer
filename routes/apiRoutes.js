const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const api = require('../services/artInstituteAPI');
const { hslToHex } = require('../utils/colorUtils');

// api auth middleware - returns 401 json instead of redirect
function apiAuth(req, res, next) {
  if (req.session.user && req.session.user.username) return next();
  return res.status(401).json({ success: false, error: 'Authentication required' });
}

// ARTWORKS (public - no auth required)

// get artworks with filters (search, date, color, type)
router.get('/artworks', async (req, res) => {
  try {
    const { q = '', page = 1, dateStart, dateEnd, colorHue, typeId } = req.query;

    const result = await api.searchArtworks({
      query: q,
      page: parseInt(page) || 1,
      limit: 12,
      dateStart,
      dateEnd,
      colorHue: colorHue || undefined,
      colorTolerance: 30,
      typeId
    });

    res.json({
      success: true,
      data: result.artworks,
      pagination: {
        total: result.total,
        page: parseInt(page) || 1,
        totalPages: result.pagination.total_pages || 1,
        limit: 12
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// get random artwork for homepage
router.get('/artworks/random', async (req, res) => {
  try {
    const artwork = await api.getRandomArtwork();
    if (!artwork) return res.status(404).json({ success: false, error: 'No artwork found' });
    res.json({ success: true, data: artwork });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// get single artwork by id
router.get('/artworks/:id', async (req, res) => {
  try {
    const artwork = await api.getArtworkById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, error: 'Artwork not found' });
    res.json({ success: true, data: artwork });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// FAVORITES (protected - login required)

// get all favorites for logged in user
router.get('/favorites', apiAuth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.session.user.id }).sort({ savedAt: -1 });
    res.json({ success: true, data: favorites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// save artwork to favorites
router.post('/favorites', apiAuth, async (req, res) => {
  const { artworkId, title, artist, imageId, dateDisplay, medium, colorH, colorS, colorL, notes } = req.body;

  if (!artworkId) return res.status(400).json({ success: false, error: 'artworkId is required' });

  try {
    const dominantColor = (colorH !== undefined && colorH !== '')
      ? { hue: Number(colorH), saturation: Number(colorS), lightness: Number(colorL), hex: hslToHex(Number(colorH), Number(colorS), Number(colorL)) }
      : null;

    const favorite = await Favorite.create({
      user: req.session.user.id,
      artworkId: Number(artworkId),
      title,
      artist,
      imageId,
      dateDisplay,
      medium,
      dominantColor,
      notes: notes || '',
      colorTags: []
    });

    res.status(201).json({ success: true, data: favorite });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Artwork already in favorites' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// remove favorite by id
router.delete('/favorites/:id', apiAuth, async (req, res) => {
  try {
    const fav = await Favorite.findOne({ _id: req.params.id, user: req.session.user.id });
    if (!fav) return res.status(404).json({ success: false, error: 'Favorite not found' });

    await fav.deleteOne();
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// update notes for a favorite
router.put('/favorites/:id/notes', apiAuth, async (req, res) => {
  const { notes } = req.body;

  try {
    const fav = await Favorite.findOne({ _id: req.params.id, user: req.session.user.id });
    if (!fav) return res.status(404).json({ success: false, error: 'Favorite not found' });

    fav.notes = notes || '';
    await fav.save();

    res.json({ success: true, data: fav });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// USER (protected)

// get current logged in user profile
router.get('/me', apiAuth, (req, res) => {
  const { id, username, email, avatar } = req.session.user;
  res.json({ success: true, data: { id, username, email, avatar: avatar || null } });
});

module.exports = router;