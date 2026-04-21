require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');

const connectDB = require('./config/database');
const passport = require('./config/passport');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const artRoutes = require('./routes/artRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();

// connect to MongoDB database
connectDB();

// view engine configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// body parsing and static file middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(path.join(__dirname, 'public')));

// session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'art_explorer_secret_key_2024',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'native',
    touchAfter: 24 * 3600 // lazy session update (24 hours)
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },
  name: 'art_sid'
}));

// request logging for development environment
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// passport authentication initialization
app.use(passport.initialize());
app.use(passport.session());

// global template variables middleware
app.use((req, res, next) => {
  // prefer session.user, fallback to Passport's req.user
  if (req.session?.user) {
    res.locals.user = req.session.user;
  } else if (req.user) {
    res.locals.user = {
      id: req.user._id?.toString(),
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar || null
    };
  } else {
    res.locals.user = null;
  }

  res.locals.currentPath = req.path;
  next();
});

// application routes
app.use('/', pageRoutes);
app.use('/auth', authRoutes);
app.use('/art', artRoutes);
app.use('/favorites', favoriteRoutes);

// error handling middleware
app.use(notFound);
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Art Explorer running on http://localhost:${PORT}`);
});

module.exports = app;