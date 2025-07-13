const auditService = require('../services/auditService');
const { writeAuditLog } = require('../utils/logger');

/**
 * Get all audits
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAudits = async (req, res) => {
  try {
    const audits = await auditService.getAllAudits();
    res.status(200).json(audits);
    writeAuditLog("GET_ALL_AUDITS", {
      username: req.user?.username || "",
      ip: req.ip,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error retrieving audits:', err);
    res.status(500).json({ error: 'Failed to retrieve audits' });
  }
};

/**
 * Get an audit by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuditById = async (req, res) => {
  const { id } = req.params;
  try {
    const audit = await auditService.getAuditById(id);
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    res.status(200).json(audit);
    writeAuditLog("GET_AUDIT_BY_ID", {
      username: req.user?.username || "",
      ip: req.ip,
      auditId: id,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error retrieving audit by ID:', err);
    res.status(500).json({ error: 'Failed to retrieve audit' });
  }
};

/**
 * Create a new audit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAudit = async (req, res) => {
  const { name, category, scope, auditor, date } = req.body;

  // Validate required fields
  if (!name || !category || !scope || !auditor || !date) {
    return res.status(400).json({ 
      error: 'Missing required fields. Name, category, scope, auditor, and date are required.' 
    });
  }

  // Validate category
  const validCategories = ['internal', 'external', 'regulatory'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ 
      error: 'Invalid category. Must be one of: internal, external, regulatory' 
    });
  }

  try {
    const newAudit = await auditService.createAudit({
      name,
      category,
      scope,
      auditor,
      date
    });
    
    res.status(201).json(newAudit);
    writeAuditLog("CREATE_AUDIT", {
      username: req.user?.username || "",
      ip: req.ip,
      auditId: newAudit.id,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error creating audit:', err);
    res.status(500).json({ error: 'Failed to create audit' });
  }
};

/**
 * Update an existing audit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAudit = async (req, res) => {
  const { id } = req.params;
  const { name, category, scope, auditor, date } = req.body;

  // Validate required fields
  if (!name || !category || !scope || !auditor || !date) {
    return res.status(400).json({ 
      error: 'Missing required fields. Name, category, scope, auditor, and date are required.' 
    });
  }

  // Validate category
  const validCategories = ['internal', 'external', 'regulatory'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ 
      error: 'Invalid category. Must be one of: internal, external, regulatory' 
    });
  }

  try {
    const updatedAudit = await auditService.updateAudit(id, {
      name,
      category,
      scope,
      auditor,
      date
    });
    
    if (!updatedAudit) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    
    res.status(200).json(updatedAudit);
    writeAuditLog("UPDATE_AUDIT", {
      username: req.user?.username || "",
      ip: req.ip,
      auditId: id,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error updating audit:', err);
    res.status(500).json({ error: 'Failed to update audit' });
  }
};

/**
 * Delete an audit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAudit = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deleted = await auditService.deleteAudit(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    
    res.status(200).json({ message: 'Audit deleted successfully' });
    writeAuditLog("DELETE_AUDIT", {
      username: req.user?.username || "",
      ip: req.ip,
      auditId: id,
      status: "SUCCESS"
    });
  } catch (err) {
    console.error('Error deleting audit:', err);
    res.status(500).json({ error: 'Failed to delete audit' });
  }
};

module.exports = {
  getAllAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit
};
