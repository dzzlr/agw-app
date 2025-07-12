const jwt = require("jsonwebtoken");

// Authentication Middleware with Role-Based Access Control
const authMiddleware = (allowedRoles = []) => (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Access denied. No token provided.",
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];

    // Verify JWT token
    const secretKey = process.env.APP_SECRET_KEY;
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          error: "Invalid Token",
          message: "Token is invalid or has expired.",
        });
      }

      // Check if user's role is allowed
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "You do not have permission to access this resource.",
        });
      }

      // Attach user info to request
      req.user = decoded;
      req.headers['x-user-id'] = req.user.id; // Save current user id
      req.headers['x-user-role'] = req.user.role; // Save current user role
      next();
    });
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
};

module.exports = authMiddleware;
