const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Course Enrollment API is running' });
});

// Feature route groups
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/settings', settingsRoutes);

// Error handlers (keep these at the end)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
