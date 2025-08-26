require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Basic config
const PORT = process.env.PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_change_me';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '3600000', 10); // 1 hour

// View engine + layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'partials/layout');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Logging and parsers
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Redis client
const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));

async function configureApp() {
  await redisClient.connect();

  const store = new RedisStore({ client: redisClient });

  // Session middleware MUST come before routes
  app.use(
    session({
      store,
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // true if using HTTPS
        maxAge: SESSION_MAX_AGE,
        sameSite: 'lax'
      },
      name: 'q3.sid'
    })
  );

  // Expose user to templates (must also come after session)
  app.use((req, res, next) => {
    res.locals.user = req.session ? req.session.user : null;
    next();
  });

  // Routes
  const authRoutes = require('./routes/auth');
  const { ensureAuth } = require('./middleware/auth');

  app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
  });

  app.use('/', authRoutes);

  app.get('/dashboard', ensureAuth, (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard',
    sessionId: req.sessionID,
    name: req.session.user ? req.session.user.name : ''
  });
});

  // Extra test route
  app.get('/redis-test', async (req, res) => {
    try {
      await redisClient.set("name", "Yashvi");
      const value = await redisClient.get("name");
      res.send(`Redis value: ${value}`);
    } catch (err) {
      console.error('Redis error:', err);
      res.status(500).send('Redis test failed');
    }
  });

  // 404 page
  app.use((req, res) => {
    res.status(404).render('404', { title: 'Not Found' });
  });

  // Start server after everything is ready
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

configureApp().catch(err => {
  console.error('Failed to configure session/Redis:', err);
  process.exit(1);
});
