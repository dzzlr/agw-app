const { Pool, types } = require('pg');

// Ensure numeric and integer types are parsed as numbers
types.setTypeParser(1700, val => parseFloat(val));
types.setTypeParser(23, val => parseInt(val, 10));

// PostgreSQL setup
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_DB_PORT,
});

// Function to initialize DB connection
const initDBConnection = async () => {
  try {
    // Attempt to connect to the PostgreSQL database
    const client = await pool.connect();
    console.log('Connected to the database successfully');
    client.release();  // Release the client back to the pool
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);  // Exit the process if the connection fails
  }
};

// Export the pool and initDBConnection function
module.exports = {
  pool,
  initDBConnection,
};
