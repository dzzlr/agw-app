const fs = require('fs').promises;
const path = require('path');
const MemoDocument = require('../models/memoModel');

// Path to the JSON storage file
const DATA_FILE = path.join(__dirname, '../../data/memos.json');

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
 * Save memos to JSON file
 * @param {Array} memos - Array of memo documents
 * @returns {Promise<void>}
 */
async function saveMemos(memos) {
  try {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE, JSON.stringify(memos, null, 2));
  } catch (error) {
    console.error('Error saving memos to file:', error);
    throw new Error('Failed to save memos to storage');
  }
}

/**
 * Load memos from JSON file
 * @returns {Promise<Array>} Array of memo documents
 */
async function loadMemos() {
  try {
    await ensureDataDirectory();
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const memos = JSON.parse(data);
      
      // Convert plain objects to MemoDocument instances if needed
      return memos;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return empty array
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('Error loading memos from file:', error);
    throw new Error('Failed to load memos from storage');
  }
}

module.exports = {
  saveMemos,
  loadMemos
};
