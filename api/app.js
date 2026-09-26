const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const db = require('./models/db'); // MySQL pool connection

// Fail fast if critical secrets are missing — never run with a guessable default.
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// Restrict CORS to known origin(s) instead of allowing any origin.
// Set CLIENT_URL in your .env, e.g. CLIENT_URL=http://localhost:3000
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  // FIX: previously, an empty allowedOrigins list (CLIENT_URL unset) was
  // treated as "allow every origin" -- silently reopening the exact CORS
  // hole this code exists to close. Missing config now fails closed
  // (no browser origin is allowed) instead of failing open, with a loud
  // warning so it's obvious in logs rather than a silent security gap.
  console.warn(
    '⚠️ CLIENT_URL is not set — no browser origins will be allowed by CORS. Set CLIENT_URL in your environment.'
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl/Postman with no Origin header) and configured origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(bodyParser.json());

// Simple, unauthenticated health check for k8s readiness/liveness probes.
// No DB check here on purpose -- readiness shouldn't flap just because a
// single slow query happens; waitForDb() below already blocks startup
// until MySQL is confirmed reachable.
app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Generic error handler (avoid leaking stack traces / internals to clients)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Something went wrong' });
});

// Function to wait until MySQL is ready
const waitForDb = async (retries = 30, delay = 2000) => {
  while (retries > 0) {
    try {
      const [rows] = await db.promise().query("SHOW TABLES LIKE 'users'");
      if (rows.length > 0) {
        console.log('✅ MySQL `users` table found.');
        return;
      }
      console.log(`⏳ Waiting for MySQL (users table)... Retries left: ${retries}`);
    } catch (err) {
      console.error(`🔴 MySQL query failed: ${err.message}`);
    }

    retries--;
    await new Promise((res) => setTimeout(res, delay));
  }
  throw new Error('❌ MySQL `users` table not available after multiple retries.');
};

// Function to seed admin user if not exists.
// Requires ALL admin env vars to be explicitly set — no weak defaults like admin123.
const seedAdminUser = async () => {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || 'admin';

  if (!name || !email || !password) {
    console.log('ℹ️ ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD not fully set — skipping admin seeding.');
    return;
  }

  if (password.length < 12) {
    console.warn('⚠️ ADMIN_PASSWORD is shorter than 12 characters. Consider using a stronger password.');
  }

  try {
    const [existing] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);

    if (existing.length === 0) {
      const hashed = await bcrypt.hash(password, 12);
      await db
        .promise()
        .query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
          name,
          email,
          hashed,
          role,
        ]);
      console.log(`✅ Admin user created → ${email}`);
    } else {
      console.log(`ℹ️ Admin user already exists → ${email}`);
    }
  } catch (err) {
    console.error(`❌ Admin seeding failed: ${err.message}`);
  }
};

// Start server
(async () => {
  try {
    await waitForDb();
    await seedAdminUser();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
