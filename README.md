# DressKart India 🇮🇳
> Petroleum Brand Uniforms, Caps & Bags — E-commerce MVP

## Quick Start

### 1. Setup Database (XAMPP / phpMyAdmin)
1. Start XAMPP → Start **Apache** and **MySQL**
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Go to **Import** tab → Upload `database/schema.sql`
4. This creates the `dresskart_db` database with all tables + sample products

### 2. Configure Environment
Edit `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=         ← your XAMPP MySQL password (usually empty)
DB_NAME=dresskart_db
```

### 3. Run the App
```bash
npm install       # first time only
npm start         # production
npm run dev       # development with auto-reload
```

Open: **http://localhost:3000**

---

## Admin Access
- URL: http://localhost:3000/admin
- Email: `admin@dresskart.in`
- Password: `admin123`

## Features
- 🛍️ Product catalog with categories (Uniforms, Caps, Bags)
- 🔍 Search and filter products
- 🛒 Shopping cart with size/color selection
- ✅ Checkout with Indian state/address form
- 📦 Order management (COD / UPI / Net Banking)
- 👤 User registration & login
- 🔐 Admin panel — manage products, orders, users

## Project Structure
```
dresskart/
├── server.js          # Express app entry point
├── config/db.js       # MySQL connection
├── routes/            # Express routers
├── middleware/        # Auth middleware
├── views/             # EJS templates
│   ├── partials/      # Header & footer
│   ├── products/      # Shop pages
│   ├── cart/          # Cart page
│   ├── orders/        # Checkout, success, my-orders
│   ├── auth/          # Login, register
│   └── admin/         # Admin dashboard
├── public/
│   ├── css/style.css  # All styles
│   └── js/main.js     # Frontend JS
└── database/schema.sql  # DB setup + seed data
```
