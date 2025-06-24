const { generateRandomId } = require('../utils/helpers');
const findingService = require('../services/findingService')
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
      username: "",
      ip: req.ip,
      status: "SUCCESS"
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
};

/**
 * Create a new audit finding
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFinding = async (req, res) => {
  const {
    kategoriAudit,
    namaTemuan,
    penyebab,
    rekomendasi,
    komitmenTindakLanjut,
    batasAkhirKomitmen,
    status,
    pic
  } = req.body;

  // Validate required fields
  if (!kategoriAudit || !namaTemuan) {
    return res.status(400).json({ error: 'Category and finding name are required' });
  }

  const newFinding = {
    id: generateRandomId(),
    kategoriAudit,
    namaTemuan,
    penyebab,
    rekomendasi,
    komitmenTindakLanjut,
    batasAkhirKomitmen,
    status: status || 'not yet',
    pic
  };

  try {
    const createdFinding = await findingsDb.createFinding(newFinding);
    res.status(201).json(createdFinding);
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
    const finding = await findingsDb.getFindingById(id);
    if (!finding) return res.status(404).json({ error: 'Finding not found' });
    res.json(finding);
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
  const {
    kategoriAudit,
    namaTemuan,
    penyebab,
    rekomendasi,
    komitmenTindakLanjut,
    batasAkhirKomitmen,
    status,
    pic
  } = req.body;

  try {
    const updatedFinding = await findingsDb.updateFinding(id, {
      kategoriAudit,
      namaTemuan,
      penyebab,
      rekomendasi,
      komitmenTindakLanjut,
      batasAkhirKomitmen,
      status,
      pic
    });
    
    if (!updatedFinding) return res.status(404).json({ error: 'Finding not found' });
    res.json(updatedFinding);
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
    const deleted = await findingsDb.deleteFinding(id);
    if (!deleted) return res.status(404).json({ error: 'Finding not found' });
    res.json({ message: 'Finding deleted successfully' });
  } catch (err) {
    console.error('Error deleting finding:', err);
    res.status(500).json({ error: 'Failed to delete data from database' });
  }
};

module.exports = {
  getAllFindings,
  createFinding,
  getFindingById,
  updateFinding,
  deleteFinding
};
