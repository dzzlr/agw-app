/**
 * Policy Document Model
 * 
 * This model defines the schema for policy documents.
 * The data will be stored in a JSON document format.
 * 
 * Schema fields:
 * - id: Unique identifier for the document
 * - doc_no: Document number/reference
 * - name: Name of the policy document
 * - category: Category of the policy ('kebijakan', 'sop', 'pedoman', 'petunjuk_teknis')
 * - created_at: Timestamp when the document was created
 */

// Valid categories
const VALID_CATEGORIES = ['kebijakan', 'sop', 'pedoman', 'petunjuk_teknis'];

class PolicyDocument {
  /**
   * Create a new policy document
   * @param {number} id - Unique identifier
   * @param {string} doc_no - Document number/reference
   * @param {string} name - Name of the policy
   * @param {string} category - Category of the policy ('kebijakan', 'sop', 'pedoman', 'petunjuk_teknis')
   * @param {Date} created_at - Creation date (optional, defaults to current date)
   */
  constructor(id, doc_no, name, category, created_at = null) {
    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    
    this.id = id;
    this.doc_no = doc_no;
    this.name = name;
    this.category = category;
    this.created_at = created_at || new Date();
  }

  /**
   * Convert the document to a JSON object
   * @returns {Object} JSON representation of the document
   */
  toJSON() {
    return {
      id: this.id,
      doc_no: this.doc_no,
      name: this.name,
      category: this.category,
      created_at: this.created_at
    };
  }

  /**
   * Create a document from a JSON object
   * @param {Object} json - JSON object
   * @returns {PolicyDocument} New document instance
   */
  static fromJSON(json) {
    const doc = new PolicyDocument(
      json.id,
      json.doc_no,
      json.name,
      json.category,
      json.created_at ? new Date(json.created_at) : null
    );
    
    return doc;
  }

  /**
   * Get valid categories
   * @returns {Array} Array of valid categories
   */
  static getValidCategories() {
    return [...VALID_CATEGORIES];
  }
}

module.exports = PolicyDocument;
