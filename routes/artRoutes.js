const express = require('express');
const router = express.Router();
const artController = require('../controllers/artController');

// search and browse artworks
router.get('/search', artController.search);

// view single artwork details
router.get('/detail/:id', artController.detail);

// browse artworks by type
router.get('/type/:typeId', artController.getArtworksByType);

// redirect legacy color search URLs
router.get('/color-search', artController.colorSearchRedirect);

// redirect legacy types page
router.get('/types', (req, res) => res.redirect('/art/search'));

module.exports = router;