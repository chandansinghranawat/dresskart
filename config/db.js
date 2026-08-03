/**
 * config/db.js
 * SQLite adapter that exposes the same promise-based API as mysql2/promise.
 * All queries use the same `db.query(sql, params)` interface.
 * Switch to MySQL in production by swapping this file only.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'database', 'dresskart.db');

// Ensure the database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

console.log('✅ SQLite database ready:', DB_PATH);

/**
 * Translate MySQL-style ? placeholders — better-sqlite3 uses ? too, so
 * no change needed. We just wrap calls in a promise-compatible interface.
 *
 * Returns [ rows, fields ] to match mysql2/promise destructuring.
 */
const db = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        const trimmed = sql.trim().toUpperCase();
        if (trimmed.startsWith('SELECT') || trimmed.startsWith('SHOW')) {
          const stmt = sqlite.prepare(sql);
          const rows = stmt.all(...params);
          resolve([rows, []]);
        } else {
          const stmt = sqlite.prepare(sql);
          const info = stmt.run(...params);
          // Expose insertId and affectedRows like mysql2 does
          resolve([{ insertId: info.lastInsertRowid, affectedRows: info.changes }, []]);
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  // Expose raw sqlite instance for transactions if needed
  raw: sqlite
};

module.exports = db;
