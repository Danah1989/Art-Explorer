const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// home page
router.get('/', pageController.home);

module.exports = router;