const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isLoggedIn } = require('../middleware/auth');

// Checkout Page
router.get('/checkout', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [cartItems] = await db.query(
      `SELECT c.*, p.name, p.price, p.image, p.slug FROM cart c 
       JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      req.flash('error', 'Your cart is empty.');
      return res.redirect('/cart');
    }

    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const userInfo = userRows[0];

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total > 999 ? 0 : 60;

    res.render('orders/checkout', {
      title: 'Checkout - DressKart India',
      cartItems,
      total,
      shipping,
      grandTotal: total + shipping,
      userInfo,
      user: req.session.user,
      cartCount: req.session.cartCount || 0,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
});

// Place Order
router.post('/place', isLoggedIn, async (req, res) => {
  const userId = req.session.user.id;
  const { shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, payment_method, notes } = req.body;

  try {
    const [cartItems] = await db.query(
      `SELECT c.*, p.name, p.price FROM cart c 
       JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      req.flash('error', 'Your cart is empty.');
      return res.redirect('/cart');
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total > 999 ? 0 : 60;
    const grandTotal = total + shipping;

    const orderNumber = 'DK' + Date.now();
    const shippingAddress = `${shipping_name}, ${shipping_phone}, ${shipping_address}, ${shipping_city}, ${shipping_state} - ${shipping_pincode}`;

    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, orderNumber, grandTotal, shippingAddress, payment_method || 'COD', notes || '']
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cartItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, size, color) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price, item.size || '', item.color || '']
      );
    }

    // Clear cart
    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    req.session.cartCount = 0;

    res.redirect(`/orders/success/${orderNumber}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Order placement failed. Try again.');
    res.redirect('/orders/checkout');
  }
});

// Order Success
router.get('/success/:orderNumber', isLoggedIn, async (req, res) => {
  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE order_number = ? AND user_id = ?',
      [req.params.orderNumber, req.session.user.id]
    );
    if (orderRows.length === 0) return res.redirect('/');

    const order = orderRows[0];
    const [items] = await db.query(
      'SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [order.id]
    );

    res.render('orders/success', {
      title: 'Order Placed! - DressKart India',
      order,
      items,
      user: req.session.user,
      cartCount: 0
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// My Orders
router.get('/my-orders', isLoggedIn, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.user.id]
    );

    res.render('orders/my-orders', {
      title: 'My Orders - DressKart India',
      orders,
      user: req.session.user,
      cartCount: req.session.cartCount || 0
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Order Detail
router.get('/detail/:orderNumber', isLoggedIn, async (req, res) => {
  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE order_number = ? AND user_id = ?',
      [req.params.orderNumber, req.session.user.id]
    );
    if (orderRows.length === 0) return res.status(404).render('error', { message: 'Order not found.', user: req.session.user });

    const order = orderRows[0];
    const [items] = await db.query(
      'SELECT oi.*, p.name, p.image, p.slug FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [order.id]
    );

    res.render('orders/detail', {
      title: `Order ${order.order_number} - DressKart India`,
      order,
      items,
      user: req.session.user,
      cartCount: req.session.cartCount || 0
    });
  } catch (err) {
    console.error(err);
    res.redirect('/orders/my-orders');
  }
});

module.exports = router;
