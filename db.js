// db.js
const { Pool } = require('pg');

// You can also load from environment variables using dotenv
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mychatapp',   // your database name
  password: '123', // replace with your postgres password
  port: 5432,
});

module.exports = pool;
