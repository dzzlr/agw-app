const { pool } = require("../config/db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// Fetch all users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, username, role, division, email FROM users"
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Fetch users by id
const getUsersById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, username, role, division, email FROM users WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, username, password, role, division, email } = req.body;

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    if (!name || !username || !password || !role || !division || !email) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    await pool.query(
      `INSERT INTO users (name, username, password, role, division, email, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, username, hashedPassword, role, division, email, createdAt, updatedAt]
    );

    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update existing user
const updateUser = async (req, res) => {
  try {
    const { name, role, division, email } = req.body;
    const { id } = req.params;
    const updatedAt = new Date().toISOString();

    if (!id || !name || !role || !division || !email) {
      console.log(id, name, role, division, email);
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // Update user in DB
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, role = $2, division = $3, email = $4, updated_at = $5
       WHERE id = $6`,
      [name, role, division, email, updatedAt, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Email a user
const emailUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, text } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    // Fetch user email by id
    const result = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const userEmail = result.rows[0].email;

    // Create a transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cabmail391@gmail.com',
        pass: 'xpgr shsw koxp peap'  // Use the generated App Password
      }
    });

    // Set up email data
    let mailOptions = {
      from: 'cabmail391@gmail.com',
      to: userEmail,
      subject: subject || 'Sample Email',
      text: text || 'This is a sample email sent from the cab service.'
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error.message);
        return res.status(500).json({ success: false, error: "Failed to send email" });
      }
      res.status(200).json({ success: true, message: "Email sent successfully" });
    });

  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Email multiple users by a list of IDs
const emailUsersByIds = async (req, res) => {
  try {
    const { ids, subject, text } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "A list of user IDs is required" });
    }

    // Fetch user emails from DB using integer ID array
    const result = await pool.query(
      `SELECT email FROM users WHERE id = ANY($1::int[])`,
      [ids]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "No users found for given IDs" });
    }

    const userEmails = result.rows.map(row => row.email);

    // Create a transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cabmail391@gmail.com',
        pass: 'xpgr shsw koxp peap' // use App Password
      }
    });

    // Set up email options
    let mailOptions = {
      from: 'cabmail391@gmail.com',
      to: userEmails.join(','),
      subject: subject || 'Sample Email',
      text: text || 'This is a sample email sent from the cab service.'
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error.message);
        return res.status(500).json({ success: false, error: "Failed to send email" });
      }
      return res.status(200).json({ success: true, message: "Emails sent successfully", to: userEmails });
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getUsers, createUser, updateUser, getUsersById, emailUserById, emailUsersByIds };
