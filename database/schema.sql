-- DressKart India Database Schema
-- Run this in phpMyAdmin or MySQL CLI

CREATE DATABASE IF NOT EXISTS dresskart_db;
USE dresskart_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  pincode VARCHAR(10),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(255)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image VARCHAR(255) DEFAULT 'default-product.jpg',
  sizes VARCHAR(255) COMMENT 'comma separated: S,M,L,XL,XXL',
  colors VARCHAR(255) COMMENT 'comma separated: Red,Blue,Navy',
  stock INT DEFAULT 100,
  brand VARCHAR(100) DEFAULT 'DressKart',
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  size VARCHAR(10),
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'COD',
  payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  size VARCHAR(10),
  color VARCHAR(50),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =====================
-- SEED DATA
-- =====================

-- Categories
INSERT INTO categories (name, slug, description, image) VALUES
('Petroleum Uniforms', 'petroleum-uniforms', 'Official uniforms for petroleum pump attendants and staff', 'cat-uniforms.jpg'),
('Caps & Headwear', 'caps-headwear', 'Branded caps and headwear for petroleum brand staff', 'cat-caps.jpg'),
('Bags & Accessories', 'bags-accessories', 'Branded bags and accessories for petroleum staff', 'cat-bags.jpg');

-- Admin User (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@dresskart.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Products - Uniforms
INSERT INTO products (category_id, name, slug, description, price, original_price, sizes, colors, is_featured) VALUES
(1, 'HPCL Pump Attendant Uniform Set', 'hpcl-pump-attendant-uniform', 'Official HPCL branded uniform set for pump attendants. Includes shirt and trousers. Durable, breathable fabric suitable for all-day wear.', 799.00, 999.00, 'S,M,L,XL,XXL', 'Blue,Navy Blue', 1),
(1, 'BPCL Staff Uniform Shirt', 'bpcl-staff-uniform-shirt', 'Official BPCL branded staff uniform shirt. Premium quality polyester-cotton blend.', 449.00, 599.00, 'S,M,L,XL,XXL,3XL', 'Green,White', 1),
(1, 'Indian Oil (IOCL) Full Uniform Set', 'iocl-full-uniform-set', 'Complete Indian Oil Corporation uniform set. Includes shirt, trouser, and belt. High visibility reflective strips for safety.', 1099.00, 1399.00, 'S,M,L,XL,XXL', 'Red,Orange', 1),
(1, 'Generic Petrol Pump Uniform Shirt', 'generic-petrol-pump-shirt', 'Standard petrol pump attendant uniform shirt. Can be customized with your brand logo. Bulk orders available.', 349.00, 450.00, 'S,M,L,XL,XXL,3XL', 'Blue,Green,Red,Orange', 0),
(1, 'Petroleum Supervisor Uniform', 'petroleum-supervisor-uniform', 'Premium supervisor grade uniform for petrol pump managers and supervisors. Formal yet functional design.', 1299.00, 1599.00, 'M,L,XL,XXL', 'Navy Blue,Black', 0),
(1, 'Winter Jacket - Petroleum Staff', 'winter-jacket-petroleum-staff', 'Branded winter jacket for petroleum pump staff. Warm, windproof with logo embroidery area.', 999.00, 1299.00, 'S,M,L,XL,XXL', 'Navy Blue,Black', 0);

-- Products - Caps
INSERT INTO products (category_id, name, slug, description, price, original_price, sizes, colors, is_featured) VALUES
(2, 'HPCL Branded Cap', 'hpcl-branded-cap', 'Official HPCL branded cap. Adjustable strap, UV protection. Embroidered logo.', 199.00, 299.00, 'Free Size', 'Blue,Navy Blue', 1),
(2, 'BPCL Staff Cap', 'bpcl-staff-cap', 'BPCL branded staff cap with embroidered logo. Adjustable fit for all head sizes.', 179.00, 249.00, 'Free Size', 'Green,White', 1),
(2, 'Indian Oil IOCL Cap', 'iocl-staff-cap', 'Indian Oil Corporation branded cap. High quality fabric with moisture-wicking inner band.', 199.00, 279.00, 'Free Size', 'Red,Orange', 0),
(2, 'Petroleum Brand Mesh Cap', 'petroleum-mesh-cap', 'Breathable mesh back cap for petrol pump staff. Ideal for summer use.', 149.00, 199.00, 'Free Size', 'Blue,Green,Red', 0),
(2, 'Hard Hat Safety Cap', 'hard-hat-safety-cap', 'ISI marked safety hard hat for petroleum facility workers. Ventilated design.', 299.00, 399.00, 'Free Size', 'Yellow,White,Red', 0);

-- Products - Bags
INSERT INTO products (category_id, name, slug, description, price, original_price, sizes, colors, is_featured) VALUES
(3, 'DressKart Branded Tote Bag', 'dresskart-tote-bag', 'Large capacity tote bag with DressKart branding. Can be customized for petroleum brands. Eco-friendly canvas material.', 249.00, 349.00, 'Standard', 'Blue,Red,Green', 1),
(3, 'Petroleum Staff Backpack', 'petroleum-staff-backpack', 'Spacious backpack for petroleum staff. Multiple compartments, laptop sleeve, branded.', 699.00, 899.00, 'Standard', 'Navy Blue,Black', 1),
(3, 'Branded Sling Bag', 'branded-sling-bag', 'Compact sling bag for petrol pump staff. Water resistant material. Logo embroidery.', 349.00, 449.00, 'Standard', 'Blue,Black,Green', 0),
(3, 'Document Carry Bag', 'document-carry-bag', 'Professional document carry bag for petroleum company staff. A4 size capacity.', 299.00, 399.00, 'Standard', 'Black,Navy Blue', 0);
