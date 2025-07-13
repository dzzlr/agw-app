const auditRepository = require('../repositories/auditRepository');

/**
 * Get all audits
 * @returns {Promise<Array>} Array of audit objects
 */
const getAllAudits = async () => {
  return await auditRepository.getAllAudits();
};

/**
 * Get a single audit by ID
 * @param {string} id - Audit ID
 * @returns {Promise<Object|null>} Audit object or null if not found
 */
const getAuditById = async (id) => {
  return await auditRepository.getAuditById(id);
};

/**
 * Create a new audit
 * @param {Object} audit - Audit object
 * @returns {Promise<Object>} Created audit object
 */
const createAudit = async (audit) => {
  return await auditRepository.createAudit(audit);
};

/**
 * Update an existing audit
 * @param {string} id - Audit ID
 * @param {Object} audit - Updated audit data
 * @returns {Promise<Object|null>} Updated audit object or null if not found
 */
const updateAudit = async (id, audit) => {
  return await auditRepository.updateAudit(id, audit);
};

/**
 * Delete an audit by ID
 * @param {string} id - Audit ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteAudit = async (id) => {
  return await auditRepository.deleteAudit(id);
};

module.exports = {
  getAllAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit
};
