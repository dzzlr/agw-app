const { generateRandomId } = require('../utils/helpers');
const findingService = require('../services/findingService');
const auditService = require('../services/auditService');
const { writeAuditLog } = require('../utils/logger');

/**
 * Get all audit findings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllFindings = async (req, res) => {
  try {
    const findings = await findingService.getAllFinding();
    res.status(200).json(findings);
    writeAuditLog("GET_ALL_FINDING", {
      username: req.user?.username || "",
      ip: req.ip,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error retrieving findings:', err);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
};

/**
 * Create a new audit finding
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFinding = async (req, res) => {
  try {
    const {
      name,
      category,
      root_cause,
      recommendation,
      commitment,
      commitment_date,
      person_in_charge
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    // Get all available audit names
    const availableAuditNames = await auditService.getAllAuditNames();
    
    // Check if the provided category exists in the audit names
    if (!availableAuditNames.includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category. Category must match an existing audit name.',
        availableCategories: availableAuditNames
      });
    }

    const now = new Date().toISOString();
    
    const newFinding = {
      name,
      category,
      root_cause: root_cause || '',
      recommendation: recommendation || '',
      commitment: commitment || '',
      commitment_date: commitment_date || '',
      person_in_charge: person_in_charge || '',
      created_at: now,
      updated_at: now
    };

    const createdFinding = await findingService.create(newFinding);
    res.status(201).json(createdFinding);
    
    writeAuditLog("CREATE_FINDING", {
      username: req.user?.username || "",
      ip: req.ip,
      findingId: createdFinding.id,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error creating finding:', err);
    res.status(500).json({ error: 'Failed to create data in database' });
  }
};

/**
 * Get an audit finding by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFindingById = async (req, res) => {
  const { id } = req.params;
  try {
    const finding = await findingService.getById(id);
    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    
    res.status(200).json(finding);
    
    writeAuditLog("GET_FINDING_BY_ID", {
      username: req.user?.username || "",
      ip: req.ip,
      findingId: id,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error getting finding by ID:', err);
    res.status(500).json({ error: 'Failed to read data from database' });
  }
};

/**
 * Update an audit finding by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFinding = async (req, res) => {
  const { id } = req.params;
  try {
    // First check if the finding exists
    const existingFinding = await findingService.getById(id);
    if (!existingFinding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    const {
      name,
      category,
      root_cause,
      recommendation,
      commitment,
      commitment_date,
      person_in_charge
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    // Get all available audit names
    const availableAuditNames = await auditService.getAllAuditNames();
    
    // Check if the provided category exists in the audit names
    if (!availableAuditNames.includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category. Category must match an existing audit name.',
        availableCategories: availableAuditNames
      });
    }

    const now = new Date().toISOString();
    
    const updatedFinding = {
      id,
      name,
      category,
      root_cause: root_cause || existingFinding.root_cause,
      recommendation: recommendation || existingFinding.recommendation,
      commitment: commitment || existingFinding.commitment,
      commitment_date: commitment_date || existingFinding.commitment_date,
      person_in_charge: person_in_charge || existingFinding.person_in_charge,
      created_at: existingFinding.created_at,
      updated_at: now
    };

    const result = await findingService.update(id, updatedFinding);
    res.status(200).json(result);
    
    writeAuditLog("UPDATE_FINDING", {
      username: req.user?.username || "",
      ip: req.ip,
      findingId: id,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error updating finding:', err);
    res.status(500).json({ error: 'Failed to update data in database' });
  }
};

/**
 * Delete an audit finding by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFinding = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await findingService.deleteById({ id });
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    
    res.status(200).json({ message: 'Finding deleted successfully' });
    
    writeAuditLog("DELETE_FINDING", {
      username: req.user?.username || "",
      ip: req.ip,
      findingId: id,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error deleting finding:', err);
    res.status(500).json({ error: 'Failed to delete data from database' });
  }
};

/**
 * Get available categories for findings (from audit names)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAvailableCategories = async (req, res) => {
  try {
    const availableCategories = await auditService.getAllAuditNames();
    res.status(200).json({ availableCategories });
    
    writeAuditLog("GET_AVAILABLE_CATEGORIES", {
      username: req.user?.username || "",
      ip: req.ip,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error retrieving available categories:', err);
    res.status(500).json({ error: 'Failed to retrieve available categories' });
  }
};

module.exports = {
  getAllFindings,
  createFinding,
  getFindingById,
  updateFinding,
  deleteFinding,
  getAvailableCategories
};
