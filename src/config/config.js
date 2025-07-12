/**
 * Application configuration
 */
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  
  // Server configuration
  port: process.env.PORT || 3000,
  
  // API configuration
  api: {
    prefix: '/api',
  },
  
  // Database configuration (for future use)
  db: {
    url: process.env.DB_URL || 'mongodb://localhost:27017/memo-service',
  },
  
  // JWT configuration (for future authentication)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};

module.exports = config;
