// middleware to require authentication for protected routes
exports.requireAuth = (req, res, next) => {
  if (req.session.user && req.session.user.username) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

// middleware to redirect authenticated users away from auth pages
exports.redirectIfAuth = (req, res, next) => {
  if (req.session.user && req.session.user.username) return res.redirect('/');
  next();
};