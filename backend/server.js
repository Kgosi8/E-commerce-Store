const dotenv = require('dotenv');
dotenv.config();                       // first, so every file below can read process.env

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./connection/db_connect');


// Routes
const authRoutes = require('./routes/customer/auth.js');
const productRoutes = require('./routes/customer/product.js');
const cartRoutes = require('./routes/customer/cart.js');
const adminRoutes = require('./routes/admin/admin_auth.js');
const orderRoutes = require('./routes/customer/order.js');

const app = express();

app.set('trust proxy', 1);             // needed behind Render's proxy
app.use(helmet());

// ── CORS ──
// CLIENT_URL can hold several origins, comma-separated:
// https://www.yourdomain.co.za,https://yourdomain.co.za
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:4200')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ── Middleware ──
app.use(express.json());
app.use(cookieParser());

// ── Rate limiting (login, register, password reset) ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,            // 15 minutes
  limit: 20,                           // 20 requests per IP per window
  message: { status: 'error', message: 'Too many attempts. Please try again later.' },
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
app.use('/api/forgot-password', authLimiter);
app.use('/api/reset-password', authLimiter);

// ── Database ──
connectDB();

// ── Health check (for Render and uptime monitors) ──
app.get('/health', (req, res) => res.json({ ok: true }));

// ── Routes ──
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// ── 404 for unknown routes ──
app.use((req, res) => {
  res.status(404).json({ success: false, status: 'error', message: 'Route not found.' });
});

// ── Error handler (catches upload errors, thrown errors, etc.) ──
app.use((err, req, res, next) => {
  console.error('[error]', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, status: 'error', message: 'File is too large (max 5MB).' });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    status: 'error',
    message: status === 500 ? 'Server error.' : err.message,
  });
});

// ── Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ── Optional: retry saved emails every 15 minutes ──
// Uncomment once services/mailSender.js (from the mail resilience step) is in place.
// const { retryFailedEmails } = require('./services/mailSender');
// setInterval(() => retryFailedEmails().catch(console.error), 15 * 60 * 1000);