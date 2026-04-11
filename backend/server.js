require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { seedDatabase } = require('./src/config/seed');
const { logInfo, logError } = require('./src/utils/logger');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    
    const server = app.listen(PORT, () => {
      logInfo('Server running on port ' + PORT);
    });

    // Graceful Shutdown Handler
    const gracefulShutdown = () => {
      logInfo('Received signal, shutting down gracefully...');
      server.close(async () => {
        logInfo('HTTP server closed.');
        await mongoose.connection.close();
        logInfo('MongoDB connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    logError(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
