const express = require("express");
const { loginUser } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/login - User login
router.post("/login", loginUser);

module.exports = router;
