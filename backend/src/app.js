const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const path = require('path');

// Global middleware
app.use(cors());
app.use(express.json());

// Simple health endpoint
app.get('/api/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({
      success: true,
      data: {
        status: 'OK',
        db: 'connected',
      },
    });
  }

  return res.status(503).json({
    success: false,
    message: 'Database not connected',
  });
});

// Feature route groups
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Error handlers (keep these at the end)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
