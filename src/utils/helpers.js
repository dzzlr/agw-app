const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Read data from a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Array>} - Array of data from the JSON file
 */
const readData = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    // Check if file exists, if not create it with empty array
    try {
      await fs.access(fullPath);
    } catch (error) {
      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Create empty file
      await fs.writeFile(fullPath, JSON.stringify([]));
    }
    
    const data = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    throw error;
  }
};

/**
 * Write data to a JSON file
 * @param {Array} data - Data to write to the file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<void>}
 */
const writeData = async (data, filePath) => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
};

/**
 * Generate a random ID
 * @returns {string} - Random ID
 */
const generateRandomId = () => {
  return crypto.randomBytes(8).toString('hex');
};

module.exports = {
  readData,
  writeData,
  generateRandomId
};
