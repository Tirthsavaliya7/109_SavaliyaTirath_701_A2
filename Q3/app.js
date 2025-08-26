const express = require('express');
const session = require('express-session');
const Redis = require('ioredis');
const connectRedis = require('connect-redis');
const path = require('path');

const app = express();
const redisClient = new Redis(); // You can add host, port if needed

const RedisStore = connectRedis(session); // ✅ important
let redisStore = new RedisStore({ client: redisClient });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: redisStore,
  secret: '$1213chjsdgc235&6', // 🔑 write any long string
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 60000 } // 1 minute
}));

app.get('/', (req, res) => {
  res.render('index'); // ✅ your login form
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    req.session.user = username;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render('dashboard', { user: req.session.user });
  } else {
    res.redirect('/');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
