const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seedUsers() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(__dirname, 'user_seeder_encrypted.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} users to seed`);
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // First, clear existing data (optional, comment out if you don't want to clear)
      await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
      
      // Insert each user
      for (const user of records) {
        const now = new Date().toISOString();
        
        const query = `
          INSERT INTO users (
            username, password, email, name, division, role, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        const values = [
          user.username,
          user.password, // Already encrypted in the CSV
          user.email,
          user.name,
          user.division,
          user.role,
          now,
          now
        ];
        
        await client.query(query, values);
        console.log(`Seeded user: ${user.name}`);
      }
      
      // Commit transaction
      await client.query('COMMIT');
      console.log('User seeding completed successfully');
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      console.error('Error seeding users:', error);
      throw error;
    } finally {
      // Release the client
      client.release();
    }
  } catch (error) {
    console.error('Error in seed process:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the seeder
seedUsers();
