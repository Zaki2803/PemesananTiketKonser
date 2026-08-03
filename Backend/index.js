import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';

// Admin Routes
import adminAuthRoutes from './routes/admin/adminAuthRoutes.js';
import adminArtistRoutes from './routes/admin/artistRoutes.js';
import adminEventRoutes from './routes/admin/eventRoutes.js';
import adminTicketCategoryRoutes from './routes/admin/ticketCategoryRoutes.js';
import adminOrderRoutes from './routes/admin/orderRoutes.js';
import adminPaymentRoutes from './routes/admin/paymentRoutes.js';
import adminDashboardRoutes from './routes/admin/dashboardRoutes.js';

// Customer Routes
import customerAuthRoutes from './routes/customer/customerAuthRoutes.js';
import customerEventRoutes from './routes/customer/eventRoutes.js';
import customerOrderRoutes from './routes/customer/orderRoutes.js';
import customerPaymentRoutes from './routes/customer/paymentRoutes.js';
import customerProfileRoutes from './routes/customer/profileRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// Middleware
// ==============================
const corsOptions = {
  origin: [
    process.env.WEB_URL   || 'http://localhost:5173', // Web admin (React/Vite)
    process.env.MOBILE_URL || 'http://localhost:8081', // Mobile (Expo)
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ==============================
// Admin Routes
// ==============================
app.use('/api/admin/auth',       adminAuthRoutes);
app.use('/api/admin/artists',    adminArtistRoutes);
app.use('/api/admin/events',     adminEventRoutes);
app.use('/api/admin/categories', adminTicketCategoryRoutes);
app.use('/api/admin/orders',     adminOrderRoutes);
app.use('/api/admin/payments',   adminPaymentRoutes);
app.use('/api/admin/dashboard',  adminDashboardRoutes);

// ==============================
// Customer Routes
// ==============================
app.use('/api/customer/auth',     customerAuthRoutes);
app.use('/api/customer/events',   customerEventRoutes);
app.use('/api/customer/orders',   customerOrderRoutes);
app.use('/api/customer/payments', customerPaymentRoutes);
app.use('/api/customer/profile',  customerProfileRoutes);

// ==============================
// Root endpoint
// ==============================
app.get('/', (req, res) => {
  res.json({ message: 'Konser Ticket API is running' });
});

// ==============================
// 404 Handler
// ==============================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} tidak ditemukan` });
});

// ==============================
// Global Error Handler
// ==============================
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

// ==============================
// Start Server
// ==============================
app.listen(PORT, async () => {
  try {
    await db.query('SELECT 1');
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
