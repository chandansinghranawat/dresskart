const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { isGuest, isLoggedIn } = require('../middleware/auth');

// GET Login
router.get('/login', isGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login - DressKart India',
    user: null,
    cartCount: 0,
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// POST Login
router.post('/login', isGuest, async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    // Load cart count
    const [cartRows] = await db.query('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', [user.id]);
    req.session.cartCount = cartRows[0].total || 0;

    if (user.role === 'admin') return res.redirect('/admin');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Try again.');
    res.redirect('/auth/login');
  }
});

// GET Register
router.get('/register', isGuest, (req, res) => {
  res.render('auth/register', {
    title: 'Register - DressKart India',
    user: null,
    cartCount: 0,
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// POST Register
router.post('/register', isGuest, async (req, res) => {
  const { name, email, password, confirm_password, phone } = req.body;

  if (!name || !email || !password) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/auth/register');
  }
  if (password !== confirm_password) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/auth/register');
  }
  if (password.length < 6) {
    req.flash('error', 'Password must be at least 6 characters.');
    return res.redirect('/auth/register');
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      req.flash('error', 'Email already registered. Please login.');
      return res.redirect('/auth/register');
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashed, phone || null]
    );
    req.flash('success', 'Account created! Please login.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed. Try again.');
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', isLoggedIn, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
