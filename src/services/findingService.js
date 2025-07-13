const findingRepository = require('../repositories/findingRepository');

/**
 * Get all findings
 * @returns {Promise<Array>} Array of finding objects
 */
const getAllFinding = async () => {
  return findingRepository.findAll();
};

/**
 * Get a finding by ID
 * @param {string} id - Finding ID
 * @returns {Promise<Object|null>} Finding object or null if not found
 */
const getById = async (id) => {
  return findingRepository.findById(id);
};

/**
 * Create a new finding
 * @param {Object} finding - Finding object
 * @returns {Promise<Object>} Created finding object
 */
const create = async (finding) => {
  return findingRepository.create(finding);
};

/**
 * Update an existing finding
 * @param {string} id - Finding ID
 * @param {Object} finding - Updated finding data
 * @returns {Promise<Object|null>} Updated finding object or null if not found
 */
const update = async (id, finding) => {
  return findingRepository.update(id, finding);
};

/**
 * Delete a finding by ID
 * @param {Object} params - Object containing the ID
 * @returns {Promise<Array>} Array containing the deleted finding ID
 */
const deleteById = async (params) => {
  return findingRepository.deleteById(params);
};

module.exports = { 
  getAllFinding, 
  getById, 
  create, 
  update,
  deleteById 
};
