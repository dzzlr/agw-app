const express = require('express');
const router = express.Router();
const memoController = require('../controllers/memoController');
const authenticate = require('../middleware/auth');

// Define allowed roles
const ALLOWED_ROLES = ['master', 'it_management', 'it_governance', 'it_architecture'];

/**
 * @route   GET api/memo
 * @desc    Get all memos
 * @access  Protected - Requires authentication with specific roles
 */
router.get('/', authenticate(ALLOWED_ROLES), memoController.getAllMemos);

/**
 * @route   POST api/memo
 * @desc    Create a new memo
 * @access  Protected - Requires authentication with specific roles
 */
router.post('/', authenticate(ALLOWED_ROLES), memoController.createMemo);

/**
 * @route   GET api/memo/:id
 * @desc    Get a memo by ID
 * @access  Protected - Requires authentication with specific roles
 */
router.get('/:id', authenticate(ALLOWED_ROLES), memoController.getMemoById);

module.exports = router;
