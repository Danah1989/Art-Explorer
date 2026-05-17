const Favorite = require('../models/Favorite');
const api = require('../services/artInstituteAPI');
const { hslToHex } = require('../utils/colorUtils');

// display user's favorites gallery
exports.index = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.session.user.id }).sort({ savedAt: -1 });
    res.render('favorites/index', { title: 'My Gallery', favorites });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: err.message, status: 500 });
  }
};

// add artwork to favorites
exports.add = async (req, res) => {
  const { artworkId, title, artist, imageId, dateDisplay, medium, colorH, colorS, colorL, notes, colorTags } = req.body;

  try {
    // build dominant color object if color data provided
    const dominantColor = (colorH !== undefined && colorH !== '')
      ? {
        hue: Number(colorH),
        saturation: Number(colorS),
        lightness: Number(colorL),
        hex: hslToHex(Number(colorH), Number(colorS), Number(colorL))
      }
      : null;

    await Favorite.create({
      user: req.session.user.id,
      artworkId: Number(artworkId),
      title,
      artist,
      imageId,
      dateDisplay,
      medium,
      dominantColor,
      notes: notes || '',
      colorTags: colorTags ? colorTags.split(',').map(t => t.trim()).filter(Boolean) : []
    });

    // handle AJAX vs form submission
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true });
    }
    res.redirect(`/art/detail/${artworkId}`);
  } catch (err) {
    // handle duplicate favorite error
    if (err.code === 11000) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(409).json({ success: false, message: 'Already in favorites' });
      }
    }
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.redirect(`/art/detail/${artworkId}`);
  }
};

// remove artwork from favorites
exports.remove = async (req, res) => {
  try {
    const fav = await Favorite.findOne({ _id: req.params.id, user: req.session.user.id });
    if (!fav) return res.status(404).json({ success: false, message: 'Not found' });

    await fav.deleteOne();

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true });
    }
    res.redirect('/favorites');
  } catch (err) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.redirect('/favorites');
  }
};

// toggle favorite status (add if not saved, remove if already saved)
exports.toggle = async (req, res) => {
  const { artworkId, title, artist, imageId, dateDisplay, medium, colorH, colorS, colorL, notes } = req.body;

  try {
    const existing = await Favorite.findOne({
      user: req.session.user.id,
      artworkId: Number(artworkId)
    });

    // remove if already favorited
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, action: 'removed', favoriteId: null });
    }

    // add if not favorited
    const dominantColor = (colorH !== undefined && colorH !== '')
      ? {
        hue: Number(colorH),
        saturation: Number(colorS),
        lightness: Number(colorL),
        hex: hslToHex(Number(colorH), Number(colorS), Number(colorL))
      }
      : null;

    const fav = await Favorite.create({
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

    return res.json({ success: true, action: 'added', favoriteId: fav._id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// update notes for a favorite artwork
exports.updateNotes = async (req, res) => {
  const { notes, colorTags } = req.body;

  try {
    const fav = await Favorite.findOne({ _id: req.params.id, user: req.session.user.id });
    if (!fav) return res.status(404).json({ success: false, message: 'Not found' });

    fav.notes = notes || '';
    fav.colorTags = colorTags ? colorTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    await fav.save();

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, favorite: fav });
    }
    res.redirect('/favorites');
  } catch (err) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.redirect('/favorites');
  }
};