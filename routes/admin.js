const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAdmin } = require('../middleware/auth');

// Admin Dashboard
router.get('/', isAdmin, async (req, res) => {
  try {
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalRevenue }]] = await db.query("SELECT COALESCE(SUM(total_amount),0) as totalRevenue FROM orders WHERE status != 'cancelled'");
    const [[{ totalProducts }]] = await db.query('SELECT COUNT(*) as totalProducts FROM products');
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'");

    const [recentOrders] = await db.query(
      'SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10'
    );

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - DressKart',
      stats: { totalOrders, totalRevenue, totalProducts, totalUsers },
      recentOrders,
      user: req.session.user,
      cartCount: 0
    });
  } catch (err) {
    console.error(err);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalUsers: 0 },
      recentOrders: [],
      user: req.session.user,
      cartCount: 0
    });
  }
});

// ---- PRODUCTS ----
router.get('/products', isAdmin, async (req, res) => {
  const [products] = await db.query(
    'SELECT p.*, c.name as cat_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC'
  );
  const [categories] = await db.query('SELECT * FROM categories');
  res.render('admin/products', {
    title: 'Manage Products - Admin',
    products, categories,
    user: req.session.user, cartCount: 0,
    success: req.flash('success'), error: req.flash('error')
  });
});

router.get('/products/add', isAdmin, async (req, res) => {
  const [categories] = await db.query('SELECT * FROM categories');
  res.render('admin/product-form', {
    title: 'Add Product - Admin',
    categories, product: null,
    user: req.session.user, cartCount: 0,
    error: req.flash('error')
  });
});

router.post('/products/add', isAdmin, async (req, res) => {
  const { category_id, name, description, price, original_price, sizes, colors, stock, is_featured, is_active } = req.body;
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    await db.query(
      'INSERT INTO products (category_id, name, slug, description, price, original_price, sizes, colors, stock, is_featured, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [category_id, name, slug, description, price, original_price || null, sizes || '', colors || '', stock || 100, is_featured ? 1 : 0, is_active ? 1 : 0]
    );
    req.flash('success', 'Product added successfully!');
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add product.');
    res.redirect('/admin/products/add');
  }
});

router.get('/products/edit/:id', isAdmin, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  const [categories] = await db.query('SELECT * FROM categories');
  if (!rows.length) return res.redirect('/admin/products');
  res.render('admin/product-form', {
    title: 'Edit Product - Admin',
    product: rows[0], categories,
    user: req.session.user, cartCount: 0,
    error: req.flash('error')
  });
});

router.post('/products/edit/:id', isAdmin, async (req, res) => {
  const { category_id, name, description, price, original_price, sizes, colors, stock, is_featured, is_active } = req.body;
  try {
    await db.query(
      'UPDATE products SET category_id=?, name=?, description=?, price=?, original_price=?, sizes=?, colors=?, stock=?, is_featured=?, is_active=? WHERE id=?',
      [category_id, name, description, price, original_price || null, sizes || '', colors || '', stock || 100, is_featured ? 1 : 0, is_active ? 1 : 0, req.params.id]
    );
    req.flash('success', 'Product updated!');
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Update failed.');
    res.redirect(`/admin/products/edit/${req.params.id}`);
  }
});

router.post('/products/delete/:id', isAdmin, async (req, res) => {
  await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
  req.flash('success', 'Product deactivated.');
  res.redirect('/admin/products');
});

// ---- ORDERS ----
router.get('/orders', isAdmin, async (req, res) => {
  const [orders] = await db.query(
    'SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
  );
  res.render('admin/orders', {
    title: 'Manage Orders - Admin',
    orders,
    user: req.session.user, cartCount: 0,
    success: req.flash('success')
  });
});

router.post('/orders/status/:id', isAdmin, async (req, res) => {
  await db.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  req.flash('success', 'Order status updated!');
  res.redirect('/admin/orders');
});

// ---- USERS ----
router.get('/users', isAdmin, async (req, res) => {
  const [users] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
  res.render('admin/users', {
    title: 'Manage Users - Admin',
    users,
    user: req.session.user, cartCount: 0
  });
});

module.exports = router;
