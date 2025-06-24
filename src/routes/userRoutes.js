const express = require("express");
const {
  getUsers,
  createUser,
  getUsersById,
  emailUserById,
  emailUsersByIds,
  updateUser
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// GET /api/users - Fetch all users
router.get("/", authMiddleware(["approver", "master"]), getUsers);

// POST /api/users - Create a new user
router.post("/", authMiddleware(["master"]), createUser);

// PUT /api/users/:id - Update user by ID
router.put("/:id", authMiddleware(["master"]), updateUser);

// GET /api/users/:id - Fetch user by ID
router.get("/:id", authMiddleware(["master"]), getUsersById);

// POST /api/users/:id/email - Email a single user by ID
router.post("/:id/email", authMiddleware(["approver", "master"]), emailUserById);

// POST /api/users/email - Email multiple users by a list of IDs
router.post("/email", authMiddleware(["approver", "master"]), emailUsersByIds);

module.exports = router;
