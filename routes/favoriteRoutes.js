const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/authMiddleware');

// all favorite routes require authentication
router.use(requireAuth);

// view user's favorites gallery
router.get('/', favoriteController.index);

// toggle favorite status (add/remove)
router.post('/toggle', favoriteController.toggle);

// add artwork to favorites
router.post('/', favoriteController.add);

// remove artwork from favorites
router.delete('/:id', favoriteController.remove);

// update notes for a favorite artwork
router.put('/:id/notes', favoriteController.updateNotes);

module.exports = router;