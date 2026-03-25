require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { seedDatabase } = require('./src/config/seed');
const { logInfo, logError } = require('./src/utils/logger');

const PORT = 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
      logInfo('Server running on port 5000');
    });
  } catch (error) {
    logError(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
