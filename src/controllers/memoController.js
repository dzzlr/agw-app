const MemoDocument = require('../models/memoModel');
const { saveMemos } = require('../utils/fileStorage');

// In-memory storage for memos (replace with database in production)
const controller = {
  memos: [],
  idCounter: 1,
  memoCounter: 0,  // Counter for 'memo' type documents
  suratCounter: 0, // Counter for 'surat' type documents

  /**
   * Get all memos sorted by latest creation date
   * With optional filtering by reason and type
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllMemos: (req, res) => {
    try {
      let filteredMemos = [...controller.memos];
      
      // Extract query parameters
      const { reason, type } = req.query;
      
      // Filter by reason if provided
      if (reason) {
        // Filter memos by reason (case-insensitive)
        const searchTerm = reason.toLowerCase();
        filteredMemos = filteredMemos.filter(memo => 
          memo.reason.toLowerCase().includes(searchTerm)
        );
      }
      
      // Filter by type if provided
      if (type) {
        // Validate type parameter
        if (!['memo', 'surat'].includes(type)) {
          return res.status(400).json({
            success: false,
            error: "Invalid type parameter. Type must be either 'memo' or 'surat'."
          });
        }
        
        // Filter memos by exact type match
        filteredMemos = filteredMemos.filter(memo => memo.type === type);
      }
      
      // Sort memos by created_at in descending order (newest first)
      const sortedMemos = filteredMemos.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Descending order (newest first)
      });

      res.status(200).json({
        success: true,
        count: sortedMemos.length,
        data: sortedMemos
      });
    } catch (error) {
      console.error('Error getting memos:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  /**
   * Get a memo by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getMemoById: (req, res) => {
    try {
      const memo = controller.memos.find(memo => memo.id === parseInt(req.params.id));
      
      if (!memo) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      res.status(200).json({
        success: true,
        data: memo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  /**
   * Generate a memo number based on type and counters
   * @param {string} type - Document type ('memo' or 'surat')
   * @param {Date} createdAt - Creation date
   * @returns {string} Generated memo number
   */
  generateMemoNumber: (type, createdAt) => {
    const year = createdAt.getFullYear();
    
    if (type === 'memo') {
      controller.memoCounter++;
      // Format: 0001/ITE-IAG/M/2024
      return `${controller.memoCounter.toString().padStart(4, '0')}/ITE-IAG/M/${year}`;
    } else if (type === 'surat') {
      controller.suratCounter++;
      // Format: 0001/ITE-IAG/2024
      return `${controller.suratCounter.toString().padStart(4, '0')}/ITE-IAG/${year}`;
    }
    
    return '';
  },

  /**
   * Initialize counters based on existing memos
   */
  initializeCounters: () => {
    // Reset counters
    controller.memoCounter = 0;
    controller.suratCounter = 0;
    
    // Find the highest counter for each type
    controller.memos.forEach(memo => {
      if (memo.type === 'memo') {
        // Extract the counter from memo_number (e.g., "0001/ITE-IAG/M/2024")
        const counterStr = memo.memo_number.split('/')[0];
        const counter = parseInt(counterStr, 10);
        if (!isNaN(counter) && counter > controller.memoCounter) {
          controller.memoCounter = counter;
        }
      } else if (memo.type === 'surat') {
        // Extract the counter from memo_number (e.g., "0001/ITE-IAG/2024")
        const counterStr = memo.memo_number.split('/')[0];
        const counter = parseInt(counterStr, 10);
        if (!isNaN(counter) && counter > controller.suratCounter) {
          controller.suratCounter = counter;
        }
      }
    });
    
    console.log(`Initialized counters: memo=${controller.memoCounter}, surat=${controller.suratCounter}`);
  },

  /**
   * Create a new memo
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createMemo: async (req, res) => {
    try {
      const { type, to, cc, reason, created_by } = req.body;

      // Validation
      if (!type || !['memo', 'surat'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: "Please provide a valid type ('memo' or 'surat')"
        });
      }

      if (!to) {
        return res.status(400).json({
          success: false,
          error: 'Please provide recipient(s)'
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a reason or subject'
        });
      }

      if (!created_by) {
        return res.status(400).json({
          success: false,
          error: 'Please provide the creator'
        });
      }

      // Create new memo document
      try {
        const createdAt = new Date();
        const memo_number = controller.generateMemoNumber(type, createdAt);
        
        const newMemo = new MemoDocument(
          controller.idCounter++,
          type,
          memo_number,
          to,
          reason,
          created_by,
          cc || '',
          createdAt
        );

        const memoJson = newMemo.toJSON();
        controller.memos.push(memoJson);

        // Save to JSON file
        try {
          await saveMemos(controller.memos);
        } catch (saveError) {
          console.error('Error saving memos:', saveError);
          // Continue with the response even if saving fails
        }

        res.status(201).json({
          success: true,
          data: memoJson
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
    } catch (error) {
      console.error('Error creating memo:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

module.exports = controller;
