// routes/auth.js
const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body; // <-- changed 'username' to 'email'

  // Demo credentials (replace with real auth logic)
  if (email === 'admin@demo.com' && password === 'Pass@123') {
  req.session.user = { 
    email,
    name: 'Yashvi Gadhiya' // or fetch from DB later
  };
  return res.redirect('/dashboard');
}
  res.render('login', { title: 'Login', error: 'Invalid username or password' });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('q3.sid');
    res.redirect('/login');
  });
});

module.exports = router;
