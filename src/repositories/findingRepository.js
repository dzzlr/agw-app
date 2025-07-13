const { pool } = require("../config/db");

/**
 * Find all findings
 * @returns {Promise<Array>} Array of finding objects
 */
const findAll = async () => {
  const result = await pool.query("SELECT * FROM findings ORDER BY updated_at DESC");
  return result.rows;
};

/**
 * Find a finding by ID
 * @param {string} id - Finding ID
 * @returns {Promise<Object|null>} Finding object or null if not found
 */
const findById = async (id) => {
  const result = await pool.query("SELECT * FROM findings WHERE id = $1", [id]);
  return result.rows.length ? result.rows[0] : null;
};

/**
 * Create a new finding
 * @param {Object} finding - Finding object
 * @returns {Promise<Object>} Created finding object
 */
const create = async ({
  name,
  category,
  root_cause,
  recommendation,
  commitment,
  commitment_date,
  person_in_charge,
  created_at,
  updated_at,
}) => {
  const result = await pool.query(
    `INSERT INTO findings
      (name, category, root_cause, recommendation, commitment, commitment_date, person_in_charge, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
    [
      name,
      category,
      root_cause,
      recommendation,
      commitment,
      commitment_date,
      person_in_charge,
      created_at,
      updated_at,
    ]
  );
  return result.rows[0];
};

/**
 * Update an existing finding
 * @param {string} id - Finding ID
 * @param {Object} finding - Updated finding data
 * @returns {Promise<Object|null>} Updated finding object or null if not found
 */
const update = async (id, {
  name,
  category,
  root_cause,
  recommendation,
  commitment,
  commitment_date,
  person_in_charge,
  updated_at,
}) => {
  const result = await pool.query(
    `UPDATE findings
     SET name = $1, 
         category = $2, 
         root_cause = $3, 
         recommendation = $4, 
         commitment = $5, 
         commitment_date = $6, 
         person_in_charge = $7, 
         updated_at = $8
     WHERE id = $9
     RETURNING *`,
    [
      name,
      category,
      root_cause,
      recommendation,
      commitment,
      commitment_date,
      person_in_charge,
      updated_at,
      id
    ]
  );
  return result.rows.length ? result.rows[0] : null;
};

/**
 * Delete a finding by ID
 * @param {Object} params - Object containing the ID
 * @returns {Promise<Array>} Array containing the deleted finding ID
 */
const deleteById = async ({ id }) => {
  const result = await pool.query(
    `DELETE FROM findings WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows;
};

module.exports = { findAll, findById, create, update, deleteById };
