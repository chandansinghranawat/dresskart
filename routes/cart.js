const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isLoggedIn } = require('../middleware/auth');

// View Cart
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [cartItems] = await db.query(
      `SELECT c.*, p.name, p.price, p.image, p.slug, p.stock
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total > 999 ? 0 : 60;

    res.render('cart/index', {
      title: 'My Cart - DressKart India',
      cartItems,
      total,
      shipping,
      grandTotal: total + shipping,
      user: req.session.user,
      cartCount: req.session.cartCount || 0
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Add to Cart
router.post('/add', isLoggedIn, async (req, res) => {
  const { product_id, quantity, size, color } = req.body;
  const userId = req.session.user.id;

  try {
    // Check if already in cart
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?',
      [userId, product_id, size || '', color || '']
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [parseInt(quantity) || 1, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)',
        [userId, product_id, parseInt(quantity) || 1, size || '', color || '']
      );
    }

    // Update session cart count
    const [countRow] = await db.query('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', [userId]);
    req.session.cartCount = countRow[0].total || 0;

    req.flash('success', 'Item added to cart!');
    res.redirect('back');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not add to cart.');
    res.redirect('back');
  }
});

// Update Cart Quantity
router.post('/update/:id', isLoggedIn, async (req, res) => {
  const { quantity } = req.body;
  const cartId = req.params.id;
  const userId = req.session.user.id;

  try {
    if (parseInt(quantity) <= 0) {
      await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cartId, userId]);
    } else {
      await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, cartId, userId]);
    }

    const [countRow] = await db.query('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', [userId]);
    req.session.cartCount = countRow[0].total || 0;

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
});

// Remove from Cart
router.post('/remove/:id', isLoggedIn, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.session.user.id]);

    const [countRow] = await db.query('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', [req.session.user.id]);
    req.session.cartCount = countRow[0].total || 0;

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
});

module.exports = router;
