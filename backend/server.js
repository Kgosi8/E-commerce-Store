const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./connection/db_connect');

// Routes
const authRoutes = require('./routes/customer/auth.js');
const productRoutes = require('./routes/customer/product.js');
const cartRoutes = require('./routes/customer/cart.js');
const adminRoutes = require('./routes/admin/admin_auth.js'); // adjust path

dotenv.config();

const app = express();

// ── Middleware ──
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(cookieParser());

// ── Database ──
connectDB();

// ── Routes ──
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);

// ── Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});