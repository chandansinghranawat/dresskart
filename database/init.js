/**
 * database/init.js — Real product data from DressKart India catalogues
 */
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'dresskart.db');
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      image TEXT DEFAULT 'default-product.jpg',
      sizes TEXT,
      colors TEXT,
      stock INTEGER DEFAULT 100,
      brand TEXT DEFAULT 'DressKart',
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      size TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      total_amount REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'COD',
      payment_status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      size TEXT,
      color TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  if (catCount > 0) {
    console.log('📦 Database already seeded. Skipping.');
    return;
  }

  console.log('🌱 Seeding database with real DressKart India catalogue data...');

  // ── Categories ──────────────────────────────────────────────
  const ic = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
  ic.run('BPCL Uniforms', 'bpcl-uniforms', 'Bharat Petroleum branded uniforms and accessories');
  ic.run('HPCL Uniforms', 'hpcl-uniforms', 'Hindustan Petroleum branded uniforms and accessories');
  ic.run('IOCL Uniforms', 'iocl-uniforms', 'Indian Oil Corporation branded uniforms and accessories');
  ic.run('Caps & Headwear', 'caps-headwear', 'Branded caps for BPCL, HPCL and IOCL staff');
  ic.run('Bags & Accessories', 'bags-accessories', 'Cash bags, belts, I-cards and accessories');
  ic.run('Seasonal Wear', 'seasonal-wear', 'Winter jackets and machine covers for petroleum staff');

  // Admin user — password: admin123
  const hashed = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@dresskart.in', hashed, 'admin');

  const ip = db.prepare(`INSERT INTO products (category_id, name, slug, description, price, original_price, sizes, colors, is_featured, brand) VALUES (?,?,?,?,?,?,?,?,?,?)`);

  // ── BPCL Products (cat_id=1) ─────────────────────────────────
  ip.run(1,'BPCL T-Shirt','bpcl-t-shirt','Official Bharat Petroleum branded polo T-shirt for pump staff. Blue and yellow colour scheme with BPCL logo embroidery. Comfortable polyester-cotton blend for all-day wear.',549,699,'S,M,L,XL,XXL','Blue,Yellow',1,'BPCL');
  ip.run(1,'BPCL Uniform Shirt','bpcl-uniform-shirt','Official BPCL branded half-sleeve uniform shirt with zipper front. Durable fabric with logo on chest pocket. Standard pump attendant uniform.',499,649,'S,M,L,XL,XXL','Blue,Yellow',1,'BPCL');
  ip.run(1,'BPCL Airboy T-Shirt','bpcl-airboy-t-shirt','BPCL Airboy branded grey polo T-shirt. Front and back AIRBOY print. Lightweight fabric ideal for petrol pump staff.',449,579,'S,M,L,XL,XXL','Grey',1,'BPCL');
  ip.run(1,'BPCL Staff Trouser','bpcl-trouser','Black uniform trouser for Bharat Petroleum pump staff. Formal cut, durable fabric with side pockets.',599,749,'26,28,30,32,34,36,38,40,42','Black',0,'BPCL');
  ip.run(1,'BPCL Complete Uniform Set','bpcl-complete-set','Complete BPCL staff uniform set — includes T-shirt, trouser, cash bag, cap, belt, and I-card. Everything your pump attendant needs in one order.',1899,2399,'S,M,L,XL,XXL','Blue,Yellow',1,'BPCL');
  ip.run(1,'BPCL Winter Jacket','bpcl-winter-jacket','BPCL branded padded winter jacket. Blue body with yellow accent. Warm and windproof — ideal for north Indian winters at petrol pump stations.',1199,1499,'S,M,L,XL,XXL,3XL','Blue,Yellow',1,'BPCL');
  ip.run(1,'BPCL Machine Cover','bpcl-machine-cover','Protective cover for petrol dispensing machines. BPCL branded, waterproof material to protect pump machines overnight.',699,899,'Regular','Transparent',0,'BPCL');

  // ── HPCL Products (cat_id=2) ─────────────────────────────────
  ip.run(2,'HPCL Shirt - Half Sleeves','hpcl-shirt-half-sleeve','Official Hindustan Petroleum half-sleeve uniform shirt. Light blue with black piping. HPCL logo on chest. Standard attendant uniform.',499,649,'S,M,L,XL,XXL','Light Blue,Black',1,'HPCL');
  ip.run(2,'HPCL Shirt - Full Sleeves','hpcl-shirt-full-sleeve','Official HPCL full-sleeve uniform shirt. Light blue with black piping and HPCL logo. Ideal for cooler months.',549,699,'S,M,L,XL,XXL','Light Blue,Black',1,'HPCL');
  ip.run(2,'HPCL T-Shirt','hpcl-t-shirt','HPCL branded blue polo T-shirt with red and white stripe. Comfortable for all-day wear at petrol pump stations.',499,649,'S,M,L,XL,XXL','Blue,Red',1,'HPCL');
  ip.run(2,'HPCL Waistcoat','hpcl-waistcoat','Black HPCL branded waistcoat/vest. Worn over the uniform shirt. Gives a professional supervisor look with HPCL logo.',449,599,'S,M,L,XL,XXL','Black',0,'HPCL');
  ip.run(2,'HPCL Staff Trouser','hpcl-trouser','Dark navy uniform trouser for Hindustan Petroleum pump staff. Formal cut with side and back pockets.',599,749,'26,28,30,32,34,36,38,40,42','Navy Blue,Black',0,'HPCL');
  ip.run(2,'HPCL Complete Uniform Set','hpcl-complete-set','Complete HPCL staff uniform set — trouser, T-shirt, half-sleeve shirt, full-sleeve shirt, cash bag, cap, belt, and I-card.',2199,2799,'S,M,L,XL,XXL','Blue,Black',1,'HPCL');
  ip.run(2,'HPCL Winter Jacket','hpcl-winter-jacket','HPCL branded navy padded winter jacket with red accent pockets. Warm, windproof and water resistant.',1199,1499,'S,M,L,XL,XXL,3XL','Navy Blue,Red',1,'HPCL');
  ip.run(2,'HPCL Machine Cover','hpcl-machine-cover','Protective waterproof cover for HP petrol dispensing machines. HPCL branded.',699,899,'Regular','Blue,Yellow',0,'HPCL');

  // ── IOCL Products (cat_id=3) ─────────────────────────────────
  ip.run(3,'IOCL T-Shirt','iocl-t-shirt','Indian Oil Corporation branded orange polo T-shirt with grey collar. IndianOil logo on chest and back. Sizes up to 3XL.',549,699,'S,M,L,XL,XXL,3XL','Orange,Grey',1,'IOCL');
  ip.run(3,'IOCL Shirt - Half Sleeves','iocl-shirt-half-sleeve','IOCL branded orange half-sleeve shirt with grey collar and IndianOil embroidered logo. Standard pump attendant wear.',499,649,'S,M,L,XL,XXL,3XL','Orange,Grey',1,'IOCL');
  ip.run(3,'IOCL Shirt - Full Sleeves','iocl-shirt-full-sleeve','IOCL branded orange full-sleeve shirt with grey collar. IndianOil logo embroidery. Ideal for winter and cooler weather.',549,699,'S,M,L,XL,XXL,3XL','Orange,Grey',1,'IOCL');
  ip.run(3,'IOCL Uniform Waistcoat','iocl-waistcoat','Khaki/beige IOCL branded waistcoat with IndianOil logo. Worn over shirts for professional look.',449,579,'S,M,L,XL,XXL,3XL','Khaki,Beige',0,'IOCL');
  ip.run(3,'IOCL Kurti','iocl-kurti','Orange IOCL branded kurti for female pump staff. Grey collar with IndianOil logo. Comfortable and professional.',499,649,'S,M,L,XL,XXL','Orange,Grey',0,'IOCL');
  ip.run(3,'IOCL Staff Trouser','iocl-trouser','Khaki/beige uniform trouser for Indian Oil pump staff. Formal fit with side pockets.',599,749,'26,28,30,32,34,36,38,40,42','Khaki,Beige',0,'IOCL');
  ip.run(3,'IOCL Dungari (Coverall)','iocl-dungari','Full-body IOCL branded coverall/dungari for maintenance and technical staff. Durable fabric with reflective safety strips.',899,1149,'Regular','Khaki,Grey',0,'IOCL');
  ip.run(3,'IOCL Complete Uniform Set','iocl-complete-set','Complete IOCL staff set — T-shirt, half-sleeve shirt, full-sleeve shirt, trouser, cash bag, cap, belt, and I-card.',2299,2899,'S,M,L,XL,XXL,3XL','Orange,Khaki',1,'IOCL');
  ip.run(3,'IOCL Winter Jacket','iocl-winter-jacket','Navy blue IOCL winter jacket with orange hood and accents. IndianOil branded. Padded and windproof.',1199,1499,'S,M,L,XL,XXL,3XL','Navy Blue,Orange',1,'IOCL');
  ip.run(3,'IOCL Machine Cover','iocl-machine-cover','Protective cover for Indian Oil petrol dispensing machines. Waterproof branded cover.',699,899,'Regular','Transparent,Orange',0,'IOCL');

  // ── Caps (cat_id=4) ──────────────────────────────────────────
  ip.run(4,'BPCL Staff Cap','bpcl-cap','Official Bharat Petroleum branded cap. Blue with yellow brim. Adjustable strap. Embroidered BPCL logo. Sizes: Regular and Medium.',199,279,'Regular,Medium','Blue,Yellow',1,'BPCL');
  ip.run(4,'HPCL Staff Cap','hpcl-cap','Official Hindustan Petroleum branded navy cap with red button top. HP logo embroidery. Adjustable fit.',199,279,'Regular,Medium','Navy Blue,Red',1,'HPCL');
  ip.run(4,'IOCL Staff Cap','iocl-cap','Indian Oil Corporation branded khaki/beige cap with IndianOil logo patch. Adjustable fit for all head sizes.',199,279,'Regular,Medium','Khaki,Beige',1,'IOCL');
  ip.run(4,'IOCL Dhruva Cap','iocl-dhruva-cap','Special IOCL Dhruva Star Performer orange and navy cap. IndianOil logo with Star Performer embroidery. For recognition programs.',249,349,'Regular,Medium','Orange,Navy Blue',0,'IOCL');

  // ── Bags & Accessories (cat_id=5) ────────────────────────────
  ip.run(5,'BPCL Cash Bag','bpcl-cash-bag','Premium BPCL branded cash bag. Navy blue with yellow zipper trim. Multiple compartments for cash and documents. BPCL logo.',349,449,'Premium','Navy Blue,Yellow',1,'BPCL');
  ip.run(5,'HPCL Cash Bag','hpcl-cash-bag','Premium HPCL branded cash bag. Navy blue with white trim. Secure zipper compartments. HP logo embroidery.',349,449,'Premium','Navy Blue,White',1,'HPCL');
  ip.run(5,'IOCL Cash Bag','iocl-cash-bag','Premium IOCL branded cash bag. Blue with orange trim and IndianOil logo. Spacious and durable for daily use.',349,449,'Premium','Blue,Orange',1,'IOCL');
  ip.run(5,'BPCL Belt','bpcl-belt','BPCL branded uniform belt. Black canvas with laminated BPCL logo buckle. Rust-free buckle. Fits all sizes.',149,199,'Free Size','Black',0,'BPCL');
  ip.run(5,'HPCL Belt','hpcl-belt','HPCL branded uniform belt. Navy canvas with laminated HP logo buckle. Rust-free buckle. Standard uniform accessory.',149,199,'Free Size','Navy Blue',0,'HPCL');
  ip.run(5,'IOCL Belt','iocl-belt','IOCL branded uniform belt. Black canvas with laminated IndianOil logo buckle. Rust-free, durable.',149,199,'Free Size','Black',0,'IOCL');
  ip.run(5,'BPCL I-Card with Lanyard','bpcl-icard','Official BPCL identity card holder with branded lanyard. Lock pouch type card holder. BPCL printed lanyard.',99,149,'Free Size','Blue,Yellow',0,'BPCL');
  ip.run(5,'HPCL I-Card with Lanyard','hpcl-icard','Official HPCL identity card holder with HP branded red lanyard. Lock pouch type for security.',99,149,'Free Size','Red,White',0,'HPCL');
  ip.run(5,'IOCL I-Card with Lanyard','iocl-icard','Official IOCL identity card holder with Indian Oil branded lanyard. Lock pouch type.',99,149,'Free Size','Orange,Blue',0,'IOCL');
  ip.run(5,'BPCL Flag','bpcl-flag','Bharat Petroleum branded flag. Available in blue and yellow variants. 30×45 inches. High quality fabric printing.',299,399,'30x45 inches','Blue,Yellow',0,'BPCL');
  ip.run(5,'HPCL Flag','hpcl-flag','Hindustan Petroleum branded flag. Multiple colour options — white, blue, red. 30×45 inches.',299,399,'30x45 inches','White,Blue,Red',0,'HPCL');
  ip.run(5,'IOCL Flag','iocl-flag','Indian Oil Corporation branded flag. Blue and orange colour variants. 30×45 inches. Vivid print quality.',299,399,'30x45 inches','Blue,Orange',0,'IOCL');
  ip.run(5,'BPCL Accessories Set','bpcl-accessories-set','Complete BPCL accessories bundle — Cash Bag + Cap + Belt + I-Card. All official BPCL branded items.',749,999,'Standard','Blue,Yellow',1,'BPCL');
  ip.run(5,'HPCL Accessories Set','hpcl-accessories-set','Complete HPCL accessories bundle — Cash Bag + Cap + Belt + I-Card. All official HP branded items.',749,999,'Standard','Navy Blue,Red',1,'HPCL');
  ip.run(5,'IOCL Accessories Set','iocl-accessories-set','Complete IOCL accessories bundle — Cap + Belt + Cash Bag + I-Card. All official IndianOil branded items.',749,999,'Standard','Khaki,Orange',1,'IOCL');

  // ── Seasonal Wear (cat_id=6) ──────────────────────────────────
  ip.run(6,'BPCL Winter Jacket (Seasonal)','bpcl-winter-jacket-seasonal','BPCL branded padded winter jacket. Blue with yellow accent. S to 3XL. Windproof and warm for petrol pump outdoor work.',1199,1499,'S,M,L,XL,XXL,3XL','Blue,Yellow',0,'BPCL');
  ip.run(6,'HPCL Winter Jacket (Seasonal)','hpcl-winter-jacket-seasonal','HPCL branded navy winter jacket with red pocket accents. S to 3XL. Ideal for north and central Indian winters.',1199,1499,'S,M,L,XL,XXL,3XL','Navy Blue,Red',0,'HPCL');
  ip.run(6,'IOCL Winter Jacket (Seasonal)','iocl-winter-jacket-seasonal','IOCL branded navy jacket with orange hood and accents. S to 3XL. Padded and water resistant.',1199,1499,'S,M,L,XL,XXL,3XL','Navy Blue,Orange',0,'IOCL');
  ip.run(6,'Petrol Pump Machine Cover','petrol-pump-machine-cover','Waterproof protective cover for petrol dispensing machines. Available for BPCL, HPCL and IOCL branded machines. Protects against dust and rain.',699,899,'Regular','Transparent',1,'DressKart');

  console.log('✅ Database seeded with', db.prepare('SELECT COUNT(*) as c FROM products').get().c, 'real products!');
}

module.exports = init;
