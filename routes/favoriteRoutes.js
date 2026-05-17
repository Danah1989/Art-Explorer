const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/authMiddleware');

// all favorite routes require authentication
router.use(requireAuth);

// view user's favorites gallery
router.get('/', favoriteController.index);

// check if an artwork is favorited (returns JSON)
router.get('/check/:artworkId', favoriteController.check);

// toggle favorite — POST adds, DELETE /toggle removes
router.post('/toggle', favoriteController.toggle);

// add artwork to favorites
router.post('/', favoriteController.add);

// remove artwork from favorites
router.delete('/:id', favoriteController.remove);

// update notes for a favorite artwork
router.put('/:id/notes', favoriteController.updateNotes);

module.exports = router;