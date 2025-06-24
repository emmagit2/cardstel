// db.js
const { Pool } = require('pg');
require('dotenv').config(); // Only needed locally

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:123@localhost:5432/mychatapp',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
