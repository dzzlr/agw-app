const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Authentication middleware to verify JWT token and check user role
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} Express middleware function
 */
const authenticate = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Access denied. No token provided.'
        });
      }

      // Extract the token
      const token = authHeader.split(' ')[1];

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.APP_SECRET_KEY);
        // console.log(decoded)
        
        // Check if user has required role
        if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
          return res.status(403).json({
            success: false,
            error: 'Access denied. Insufficient permissions.'
          });
        }

        // Add user info to request object
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token.'
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error during authentication.'
      });
    }
  };
};

module.exports = authenticate;
