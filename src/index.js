const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Import routes and utilities
const policyRoutes = require('./routes/policyRoutes');
const { loadPolicies } = require('./utils/fileStorage');
const policyController = require('./controllers/policyController');

// Initialize express app
const app = express();

// Set port
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/policy', policyRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Policy Document Service API',
    endpoints: [
      { method: 'GET', path: '/api/policy', description: 'Get all policies (Protected)' },
      { method: 'GET', path: '/api/policy/:id', description: 'Get a policy by ID (Protected)' },
      { method: 'POST', path: '/api/policy', description: 'Create a new policy (Protected)' },
      { method: 'PUT', path: '/api/policy/:id', description: 'Update a policy by ID (Protected)' },
      { method: 'DELETE', path: '/api/policy/:id', description: 'Delete a policy by ID (Protected)' },
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

    // Load existing policies
    try {
      const existingPolicies = await loadPolicies();
      if (existingPolicies && existingPolicies.length > 0) {
        // Set the policies in the controller
        policyController.policies = existingPolicies;
        
        // Set the ID counter to be one more than the highest ID
        const maxId = Math.max(...existingPolicies.map(policy => policy.id));
        policyController.idCounter = maxId + 1;
        
        console.log(`Loaded ${existingPolicies.length} existing policies`);
        
        console.log(`Loaded ${existingPolicies.length} existing policies`);
      }
    } catch (error) {
      console.error('Error loading existing policies:', error);
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
