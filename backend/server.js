require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('Server running on port 5000');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
