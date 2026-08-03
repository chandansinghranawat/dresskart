// Auth middleware
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Please login to continue.');
  res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).render('error', { message: 'Access denied. Admins only.', user: req.session.user || null });
}

function isGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  next();
}

module.exports = { isLoggedIn, isAdmin, isGuest };
