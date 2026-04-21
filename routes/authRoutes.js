const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/authMiddleware');

// Google OAuth authentication
router.get('/google',
  redirectIfAuth,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Google OAuth callback after user authenticates
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login?error=google',
    failureMessage: true
  }),
  authController.googleCallback
);

// local authentication routes
router.get('/register', redirectIfAuth, authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/login', redirectIfAuth, authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

module.exports = router;