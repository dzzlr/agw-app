const express = require('express');
const {
  getAllFindings,
  createFinding,
  getFindingById,
  updateFinding,
  deleteFinding
} = require('../controllers/findingsController');
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// GET /api/findings - Get all audit findings
router.get('/', authMiddleware(["it_governance"]), getAllFindings);

// POST /api/findings - Create a new audit finding
router.post('/', authMiddleware(["it_governance"]), createFinding);

// GET /api/findings/:id - Get an audit finding by ID
router.get('/:id', authMiddleware(["it_governance"]), getFindingById);

// PUT /api/findings/:id - Update an audit finding by ID
router.put('/:id', authMiddleware(["it_governance"]), updateFinding);

// DELETE /api/findings/:id - Delete an audit finding by ID
router.delete('/:id', authMiddleware(["it_governance"]), deleteFinding);

module.exports = router;
