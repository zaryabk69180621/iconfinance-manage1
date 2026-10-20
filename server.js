const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const feeSlipRoutes = require('./routes/feeSlipRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const batchRoutes = require('./routes/batchRoutes');
const semesterFeeRoutes = require('./routes/semesterFeeRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Initialize Daily Database Backup Scheduler (11:30 AM PKT)
if (process.env.ENABLE_AUTO_BACKUP !== 'false') {
  require('./scripts/scheduleBackup');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Imperial College of Nursing Swat - Finance Management API',
    status: 'Active',
    endpoints: {
      auth: '/api/auth',
      feeSlips: '/api/fee-slips',
      students: '/api/students',
      batches: '/api/batches',
      semesterFees: '/api/semester-fees'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/fee-slips', feeSlipRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/semester-fees', semesterFeeRoutes);

// Global 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
