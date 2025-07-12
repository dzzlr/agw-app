const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Import routes and utilities
const memoRoutes = require('./routes/memoRoutes');
const { loadMemos } = require('./utils/fileStorage');
const memoController = require('./controllers/memoController');

// Initialize express app
const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/memo', memoRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Memo Service API',
    endpoints: [
      { method: 'GET', path: '/api/memo', description: 'Get all memos (Protected)' },
      { method: 'GET', path: '/api/memo/:id', description: 'Get a memo by ID (Protected)' },
      { method: 'POST', path: '/api/memo', description: 'Create a new memo (Protected)' },
    ],
    authentication: 'This API requires Bearer token authentication with specific roles'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Create data directory if it doesn't exist
async function initializeApp() {
  try {
    // Create data directory
    const dataDir = path.join(__dirname, '../data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
      console.log('Data directory created or already exists');
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error('Error creating data directory:', error);
      }
    }

    // Load existing memos
    try {
      const existingMemos = await loadMemos();
      if (existingMemos && existingMemos.length > 0) {
        // Set the memos in the controller
        memoController.memos = existingMemos;
        
        // Set the ID counter to be one more than the highest ID
        const maxId = Math.max(...existingMemos.map(memo => memo.id));
        memoController.idCounter = maxId + 1;
        
        // Initialize memo and surat counters
        memoController.initializeCounters();
        
        console.log(`Loaded ${existingMemos.length} existing memos`);
      }
    } catch (error) {
      console.error('Error loading existing memos:', error);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Initialize the application
initializeApp();

module.exports = app; // For testing purposes
