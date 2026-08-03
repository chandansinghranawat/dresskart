const express = require('express');
const router = express.Router();
const db = require('../config/db');

// All Products / Shop
router.get('/', async (req, res) => {
  try {
    const { category, sort, search, min_price, max_price } = req.query;
    let query = 'SELECT p.*, c.name as category_name, c.slug as cat_slug FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (min_price) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(max_price));
    }

    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'newest') query += ' ORDER BY p.created_at DESC';
    else query += ' ORDER BY p.is_featured DESC, p.created_at DESC';

    const [products] = await db.query(query, params);
    const [categories] = await db.query('SELECT * FROM categories');

    res.render('products/index', {
      title: 'Shop - DressKart India',
      products,
      categories,
      filters: { category, sort, search, min_price, max_price },
      user: req.session.user || null,
      cartCount: req.session.cartCount || 0
    });
  } catch (err) {
    console.error(err);
    res.render('products/index', {
      title: 'Shop - DressKart India',
      products: [],
      categories: [],
      filters: {},
      user: req.session.user || null,
      cartCount: 0
    });
  }
});

// Single Product
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, c.name as category_name, c.slug as cat_slug FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1',
      [req.params.slug]
    );
    if (rows.length === 0) {
      return res.status(404).render('error', { message: 'Product not found.', user: req.session.user || null });
    }
    const product = rows[0];
    product.sizes_arr = product.sizes ? product.sizes.split(',') : [];
    product.colors_arr = product.colors ? product.colors.split(',') : [];

    // Related products
    const [related] = await db.query(
      'SELECT * FROM products WHERE category_id = ? AND id != ? AND is_active = 1 LIMIT 4',
      [product.category_id, product.id]
    );

    res.render('products/detail', {
      title: `${product.name} - DressKart India`,
      product,
      related,
      user: req.session.user || null,
      cartCount: req.session.cartCount || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error.', user: req.session.user || null });
  }
});

module.exports = router;
