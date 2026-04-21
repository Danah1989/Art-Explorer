const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// google oauth 2.0 strategy configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;

      // check if user already exists by google id
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      // check if email already registered (account linking)
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0]?.value || null;
          user.displayName = profile.displayName || user.displayName;
          await user.save();
          return done(null, user);
        }
      }

      // generate username from display name or email
      let username;

      if (profile.displayName) {
        username = profile.displayName
          .replace(/\s+/g, '')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase();
      }

      if (!username && email) {
        username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      }

      // fallback username if none generated
      if (!username || username.length < 3) {
        username = 'user' + Math.random().toString(36).substring(2, 8);
      }

      username = username.slice(0, 20);
      if (username.length < 3) {
        username = username.padEnd(3, '0');
      }

      // ensure username is unique
      let finalUsername = username;
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = username + counter;
        counter++;
      }

      // create new user
      const userData = {
        googleId: profile.id,
        username: finalUsername,
        displayName: profile.displayName || '',
        email: email ? email.toLowerCase() : `${profile.id}@google.user`,
        avatar: profile.photos?.[0]?.value || null
      };

      user = await User.create(userData);
      return done(null, user);

    } catch (err) {
      console.error('google strategy error:', err);
      return done(err, null);
    }
  }));

// serialize user id to session
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// deserialize user from session by id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (err) {
    console.error('deserialize error:', err);
    done(err, null);
  }
});

module.exports = passport;