const fs = require('fs').promises;
const path = require('path');
const PolicyDocument = require('../models/policyModel');

// Path to the JSON storage file
const DATA_FILE = path.join(__dirname, '../../data/policies.json');

/**
 * Ensure the data directory exists
 */
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Save policies to JSON file
 * @param {Array} policies - Array of policy documents
 * @returns {Promise<void>}
 */
async function savePolicies(policies) {
  try {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE, JSON.stringify(policies, null, 2));
  } catch (error) {
    console.error('Error saving policies to file:', error);
    throw new Error('Failed to save policies to storage');
  }
}

/**
 * Load policies from JSON file
 * @returns {Promise<Array>} Array of policy documents
 */
async function loadPolicies() {
  try {
    await ensureDataDirectory();
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const policies = JSON.parse(data);
      
      // Convert plain objects to PolicyDocument instances if needed
      return policies;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return empty array
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('Error loading policies from file:', error);
    throw new Error('Failed to load policies from storage');
  }
}

module.exports = {
  savePolicies,
  loadPolicies
};
