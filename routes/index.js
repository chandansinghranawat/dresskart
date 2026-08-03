const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Home Page
router.get('/', async (req, res) => {
  try {
    const [featuredProducts] = await db.query(
      'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_featured = 1 AND p.is_active = 1 LIMIT 8'
    );
    const [categories] = await db.query('SELECT * FROM categories');
    const [newArrivals] = await db.query(
      'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 ORDER BY p.created_at DESC LIMIT 4'
    );

    res.render('index', {
      title: 'DressKart India - Petroleum Brand Uniforms',
      featuredProducts,
      categories,
      newArrivals,
      user: req.session.user || null,
      cartCount: req.session.cartCount || 0
    });
  } catch (err) {
    console.error(err);
    res.render('index', {
      title: 'DressKart India',
      featuredProducts: [],
      categories: [],
      newArrivals: [],
      user: req.session.user || null,
      cartCount: 0
    });
  }
});

// About Page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Us - DressKart India',
    user: req.session.user || null,
    cartCount: req.session.cartCount || 0
  });
});

// Contact Page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us - DressKart India',
    user: req.session.user || null,
    cartCount: req.session.cartCount || 0
  });
});

module.exports = router;
