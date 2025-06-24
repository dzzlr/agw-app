const express = require("express");
const {
  getConfig,
  getAllConfig,
  updateConfig
} = require("../controllers/configController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// GET /api/config/all - Fetch all config
router.get("/all", authMiddleware(["maker","approver","master"]), getAllConfig);

// GET /api/config - Fetch config by key
router.get("/", authMiddleware(["maker","approver","master"]), getConfig);

// PUT /api/config - Update config
router.put("/", authMiddleware(["maker","approver","master"]), updateConfig);

module.exports = router;
