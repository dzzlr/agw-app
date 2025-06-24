const { pool } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { writeAuditLog } = require('../utils/logger');

// Secret key for JWT (use environment variables in production)
const JWT_SECRET = process.env.APP_SECRET_KEY;

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, division: user.division },
      JWT_SECRET,
      { expiresIn: "2h" } // Token expires in 2 hours
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        division: user.division,
      },
    });

    writeAuditLog("LOGIN", {
      username: user.username,
      ip: req.ip,
      status: "SUCCESS"
    });

  } catch (error) {
    writeAuditLog("LOGIN", {
      username: user.username,
      ip: req.ip,
      status: error.message
    });
    // console.error("Login error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { loginUser };
