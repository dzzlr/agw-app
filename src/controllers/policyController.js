const PolicyDocument = require('../models/policyModel');
const { savePolicies } = require('../utils/fileStorage');

// In-memory storage for policies (replace with database in production)
const controller = {
  policies: [],
  idCounter: 1,

  /**
   * Get all policies with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllPolicies: (req, res) => {
    try {
      let filteredPolicies = [...controller.policies];
      
      // Extract query parameters
      const { category, name } = req.query;
      
      // Filter by category if provided
      if (category) {
        // Validate category
        const validCategories = PolicyDocument.getValidCategories();
        if (!validCategories.includes(category)) {
          return res.status(400).json({
            success: false,
            error: `Invalid category parameter. Category must be one of: ${validCategories.join(', ')}`
          });
        }
        
        filteredPolicies = filteredPolicies.filter(policy => 
          policy.category === category
        );
      }
      
      // Filter by name if provided
      if (name) {
        const searchTerm = name.toLowerCase();
        filteredPolicies = filteredPolicies.filter(policy => 
          policy.name.toLowerCase().includes(searchTerm)
        );
      }
      
      // Sort policies by created_at in descending order (newest first)
      const sortedPolicies = filteredPolicies.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Descending order (newest first)
      });

      res.status(200).json({
        success: true,
        count: sortedPolicies.length,
        data: sortedPolicies
      });
    } catch (error) {
      console.error('Error getting policies:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  /**
   * Get a policy by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPolicyById: (req, res) => {
    try {
      const policy = controller.policies.find(policy => policy.id === parseInt(req.params.id));
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy document not found'
        });
      }

      res.status(200).json({
        success: true,
        data: policy
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  /**
   * Create a new policy document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createPolicy: async (req, res) => {
    try {
      const { name, category, doc_no, created_at } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a name'
        });
      }

      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a category'
        });
      }

      if (!doc_no) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a document number (doc_no)'
        });
      }

      // Validate category
      const validCategories = PolicyDocument.getValidCategories();
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Category must be one of: ${validCategories.join(', ')}`
        });
      }

      // Check if document number already exists
      const docNoExists = controller.policies.some(policy => policy.doc_no === doc_no);
      if (docNoExists) {
        return res.status(400).json({
          success: false,
          error: 'Document number already exists. Please use a unique document number.'
        });
      }

      // Parse created_at if provided, otherwise use current date
      let parsedCreatedAt = new Date();
      if (created_at) {
        try {
          parsedCreatedAt = new Date(created_at);
          if (isNaN(parsedCreatedAt.getTime())) {
            return res.status(400).json({
              success: false,
              error: 'Invalid created_at date format. Please use ISO format (e.g., 2025-07-12T14:00:00Z)'
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Invalid created_at date format. Please use ISO format (e.g., 2025-07-12T14:00:00Z)'
          });
        }
      }

      // Create new policy document
      try {
        const newPolicy = new PolicyDocument(
          controller.idCounter++,
          doc_no,
          name,
          category,
          parsedCreatedAt
        );

        const policyJson = newPolicy.toJSON();
        controller.policies.push(policyJson);

        // Save to JSON file
        try {
          await savePolicies(controller.policies);
        } catch (saveError) {
          console.error('Error saving policies:', saveError);
          // Continue with the response even if saving fails
        }

        res.status(201).json({
          success: true,
          data: policyJson
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  /**
   * Update a policy document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updatePolicy: async (req, res) => {
    try {
      const { name, category, doc_no, created_at } = req.body;
      const policyId = parseInt(req.params.id);

      // Find the policy to update
      const policyIndex = controller.policies.findIndex(policy => policy.id === policyId);
      
      if (policyIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Policy document not found'
        });
      }

      const existingPolicy = controller.policies[policyIndex];

      // Validate category if provided
      if (category) {
        const validCategories = PolicyDocument.getValidCategories();
        if (!validCategories.includes(category)) {
          return res.status(400).json({
            success: false,
            error: `Invalid category. Category must be one of: ${validCategories.join(', ')}`
          });
        }
      }

      // Check if document number already exists (if being changed)
      if (doc_no && doc_no !== existingPolicy.doc_no) {
        const docNoExists = controller.policies.some(policy => policy.doc_no === doc_no);
        if (docNoExists) {
          return res.status(400).json({
            success: false,
            error: 'Document number already exists. Please use a unique document number.'
          });
        }
      }

      // Parse created_at if provided
      let parsedCreatedAt = existingPolicy.created_at;
      if (created_at) {
        try {
          parsedCreatedAt = new Date(created_at);
          if (isNaN(parsedCreatedAt.getTime())) {
            return res.status(400).json({
              success: false,
              error: 'Invalid created_at date format. Please use ISO format (e.g., 2025-07-12T14:00:00Z)'
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Invalid created_at date format. Please use ISO format (e.g., 2025-07-12T14:00:00Z)'
          });
        }
      }

      // Update the policy with new values or keep existing ones
      const updatedPolicy = {
        ...existingPolicy,
        name: name || existingPolicy.name,
        category: category || existingPolicy.category,
        doc_no: doc_no || existingPolicy.doc_no,
        created_at: parsedCreatedAt
      };

      // Replace the old policy with the updated one
      controller.policies[policyIndex] = updatedPolicy;

      // Save to JSON file
      try {
        await savePolicies(controller.policies);
      } catch (saveError) {
        console.error('Error saving policies:', saveError);
        // Continue with the response even if saving fails
      }

      res.status(200).json({
        success: true,
        data: updatedPolicy
      });
    } catch (error) {
      console.error('Error updating policy:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  /**
   * Delete a policy document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deletePolicy: async (req, res) => {
    try {
      const policyId = parseInt(req.params.id);

      // Find the policy to delete
      const policyIndex = controller.policies.findIndex(policy => policy.id === policyId);
      
      if (policyIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Policy document not found'
        });
      }

      // Remove the policy from the array
      controller.policies.splice(policyIndex, 1);

      // Save to JSON file
      try {
        await savePolicies(controller.policies);
      } catch (saveError) {
        console.error('Error saving policies:', saveError);
        // Continue with the response even if saving fails
      }

      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      console.error('Error deleting policy:', error);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

module.exports = controller;
