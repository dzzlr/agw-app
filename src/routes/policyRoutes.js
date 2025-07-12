const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const authenticate = require('../middleware/auth');

// Define allowed roles for read operations
const READ_ROLES = ['master', 'it_management', 'it_governance', 'it_architecture'];

// Define allowed roles for write operations (create, update, delete)
const WRITE_ROLES = ['it_governance'];

/**
 * @route   GET api/policy
 * @desc    Get all policies
 * @access  Protected - Requires authentication with READ_ROLES
 */
router.get('/', authenticate(READ_ROLES), policyController.getAllPolicies);

/**
 * @route   GET api/policy/:id
 * @desc    Get a policy by ID
 * @access  Protected - Requires authentication with READ_ROLES
 */
router.get('/:id', authenticate(READ_ROLES), policyController.getPolicyById);

/**
 * @route   POST api/policy
 * @desc    Create a new policy
 * @access  Protected - Requires authentication with WRITE_ROLES (it_governance only)
 */
router.post('/', authenticate(WRITE_ROLES), policyController.createPolicy);

/**
 * @route   PUT api/policy/:id
 * @desc    Update a policy by ID
 * @access  Protected - Requires authentication with WRITE_ROLES (it_governance only)
 */
router.put('/:id', authenticate(WRITE_ROLES), policyController.updatePolicy);

/**
 * @route   DELETE api/policy/:id
 * @desc    Delete a policy by ID
 * @access  Protected - Requires authentication with WRITE_ROLES (it_governance only)
 */
router.delete('/:id', authenticate(WRITE_ROLES), policyController.deletePolicy);

module.exports = router;
