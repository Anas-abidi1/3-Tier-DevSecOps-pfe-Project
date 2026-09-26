require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2');

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Only enable TLS when explicitly configured with a real CA — otherwise
// leave it off. `rejectUnauthorized: false` (the previous setting) claims to
// use TLS while skipping certificate validation entirely, which defeats the
// point of TLS and is worse than not using it, since it gives a false sense
// of security against MITM attacks.
let sslConfig = undefined;
if (process.env.DB_SSL === 'true') {
  if (!process.env.DB_SSL_CA_PATH) {
    throw new Error('DB_SSL=true requires DB_SSL_CA_PATH to point to a trusted CA certificate');
  }
  sslConfig = {
    ca: fs.readFileSync(process.env.DB_SSL_CA_PATH),
    rejectUnauthorized: true,
  };
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig,
});

module.exports = db;
