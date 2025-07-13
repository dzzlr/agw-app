const { pool } = require('../config/db');

/**
 * Get all audits from the database
 * @returns {Promise<Array>} Array of audit objects
 */
const getAllAudits = async () => {
  const query = 'SELECT * FROM audits ORDER BY created_at DESC';
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Get a single audit by ID
 * @param {string} id - Audit ID
 * @returns {Promise<Object|null>} Audit object or null if not found
 */
const getAuditById = async (id) => {
  const query = 'SELECT * FROM audits WHERE id = $1';
  const { rows } = await pool.query(query, [id]);
  return rows.length ? rows[0] : null;
};

/**
 * Create a new audit
 * @param {Object} audit - Audit object
 * @returns {Promise<Object>} Created audit object
 */
const createAudit = async (audit) => {
  const { name, category, scope, auditor, date } = audit;
  const now = new Date().toISOString();
  
  const query = `
    INSERT INTO audits (name, category, scope, auditor, date, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const values = [name, category, scope, auditor, date, now, now];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

/**
 * Update an existing audit
 * @param {string} id - Audit ID
 * @param {Object} audit - Updated audit data
 * @returns {Promise<Object|null>} Updated audit object or null if not found
 */
const updateAudit = async (id, audit) => {
  const { name, category, scope, auditor, date } = audit;
  const now = new Date().toISOString();
  
  const query = `
    UPDATE audits
    SET name = $1, category = $2, scope = $3, auditor = $4, date = $5, updated_at = $6
    WHERE id = $7
    RETURNING *
  `;
  
  const values = [name, category, scope, auditor, date, now, id];
  const { rows } = await pool.query(query, values);
  return rows.length ? rows[0] : null;
};

/**
 * Delete an audit by ID
 * @param {string} id - Audit ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteAudit = async (id) => {
  const query = 'DELETE FROM audits WHERE id = $1 RETURNING id';
  const { rows } = await pool.query(query, [id]);
  return rows.length > 0;
};

module.exports = {
  getAllAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit
};
