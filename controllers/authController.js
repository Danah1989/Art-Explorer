const bcrypt = require('bcryptjs');
const User = require('../models/User');

// handle Google OAuth callback after successful authentication
exports.googleCallback = (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/login?error=google');
  }

  req.logIn(req.user, (loginErr) => {
    if (loginErr) {
      console.error('Login error:', loginErr);
      return res.redirect('/auth/login?error=google');
    }

    // store user data in session
    req.session.user = {
      id: req.user._id.toString(),
      username: req.user.username || 'User',
      email: req.user.email || '',
      avatar: req.user.avatar || null,
      displayName: req.user.displayName || ''
    };

    const redirect = req.session.returnTo || '/';
    delete req.session.returnTo;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/auth/login?error=session');
      }
      res.redirect(redirect);
    });
  });
};

// display registration page
exports.getRegister = (req, res) => {
  if (req.session.user && req.session.user.username) return res.redirect('/');
  res.render('auth/register', { title: 'Create Account', error: null, formData: {} });
};

// handle registration form submission
exports.postRegister = async (req, res) => {
  if (req.session.user && req.session.user.username) return res.redirect('/');

  const { username, email, password, confirmPassword } = req.body;
  const formData = { username, email };

  // validation
  if (!username || !email || !password) {
    return res.render('auth/register', { title: 'Create Account', error: 'All fields are required', formData });
  }

  if (password !== confirmPassword) {
    return res.render('auth/register', { title: 'Create Account', error: 'Passwords do not match', formData });
  }

  try {
    // check for existing user
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.render('auth/register', { title: 'Create Account', error: `${field} already in use`, formData });
    }

    // create new user
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashed });

    // log user in
    req.session.user = { id: user._id, username: user.username, email: user.email, avatar: null };
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/');
    });
  } catch (err) {
    const msg = err.code === 11000 ? 'Username or email already exists' : 'Registration failed';
    res.render('auth/register', { title: 'Create Account', error: msg, formData });
  }
};

// display login page
exports.getLogin = (req, res) => {
  if (req.session.user && req.session.user.username) return res.redirect('/');
  const errorParam = req.query.error === 'google' ? 'Google sign-in failed. Please try again.' : null;
  res.render('auth/login', { title: 'Sign In', error: errorParam, formData: {} });
};

// handle login form submission
exports.postLogin = async (req, res) => {
  if (req.session.user && req.session.user.username) return res.redirect('/');

  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('auth/login', { title: 'Sign In', error: 'Email and password are required', formData: { email } });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // check if user exists and has password (not Google-only account)
    if (!user || !user.password) {
      return res.render('auth/login', {
        title: 'Sign In',
        error: !user
          ? 'Invalid email or password'
          : 'This account uses Google Sign-In. Use "Continue with Google" below.',
        formData: { email }
      });
    }

    // verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.render('auth/login', { title: 'Sign In', error: 'Invalid email or password', formData: { email } });
    }

    // log user in
    req.session.user = { id: user._id, username: user.username, email: user.email, avatar: null };
    const redirect = req.session.returnTo || '/';
    delete req.session.returnTo;

    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect(redirect);
    });
  } catch (err) {
    res.render('auth/login', { title: 'Sign In', error: 'Login failed. Please try again.', formData: { email } });
  }
};

// handle logout
exports.logout = (req, res) => {
  if (!req.session) {
    return res.redirect('/');
  }

  req.session.user = null;

  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }

    res.clearCookie('art_sid');
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};