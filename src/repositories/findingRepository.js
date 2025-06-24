const { pool } = require("../config/db");

const findAll = async () => {
  const result = await pool.query("SELECT * FROM findings");
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query("SELECT * FROM findings WHERE id = $1", [id]);
  return result.rows[0];
};

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

const deleteById = async ({ id }) => {
  const result = await pool.query(
    `DELETE FROM audit_findings WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows;
};

module.exports = { findAll, findById, create, deleteById };
