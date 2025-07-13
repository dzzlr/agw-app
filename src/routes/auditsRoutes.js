const express = require('express');
const {
  getAllAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit
} = require('../controllers/auditsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/audits - Get all audits
router.get('/', authMiddleware(["it_governance"]), getAllAudits);

// POST /api/audits - Create a new audit
router.post('/', authMiddleware(["it_governance"]), createAudit);

// GET /api/audits/:id - Get an audit by ID
router.get('/:id', authMiddleware(["it_governance"]), getAuditById);

// PUT /api/audits/:id - Update an audit by ID
router.put('/:id', authMiddleware(["it_governance"]), updateAudit);

// DELETE /api/audits/:id - Delete an audit by ID
router.delete('/:id', authMiddleware(["it_governance"]), deleteAudit);

module.exports = router;
