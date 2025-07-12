/**
 * Memo Model
 * 
 * This model defines the schema for memos and letters.
 * The data will be stored in a JSON document format.
 * 
 * Schema fields:
 * - id: Unique identifier for the document
 * - type: Type of document ('memo' or 'surat')
 * - memo_number: Document reference number
 * - to: Recipient(s) of the document
 * - cc: Carbon copy recipient(s)
 * - reason: Purpose or subject of the document
 * - created_by: Author or creator of the document
 * - created_at: Timestamp when the document was created
 * 
 * Example with Mongoose (MongoDB):
 * 
 * const mongoose = require('mongoose');
 * 
 * const MemoSchema = new mongoose.Schema({
 *   type: {
 *     type: String,
 *     enum: ['memo', 'surat'],
 *     required: [true, 'Please specify document type']
 *   },
 *   memo_number: {
 *     type: String,
 *     required: [true, 'Please add a document number'],
 *     unique: true,
 *     trim: true
 *   },
 *   to: {
 *     type: String,
 *     required: [true, 'Please specify recipient(s)'],
 *     trim: true
 *   },
 *   cc: {
 *     type: String,
 *     trim: true
 *   },
 *   reason: {
 *     type: String,
 *     required: [true, 'Please specify the reason or subject'],
 *     trim: true
 *   },
 *   created_by: {
 *     type: String,
 *     required: [true, 'Please specify the creator'],
 *     trim: true
 *   },
 *   created_at: {
 *     type: Date,
 *     default: Date.now
 *   }
 * });
 * 
 * module.exports = mongoose.model('Memo', MemoSchema);
 */

// For now, we'll use a simple class to represent a Memo or Letter document
class MemoDocument {
  /**
   * Create a new memo or letter document
   * @param {string} id - Unique identifier
   * @param {string} type - Document type ('memo' or 'surat')
   * @param {string} memo_number - Document reference number
   * @param {string} to - Recipient(s)
   * @param {string} reason - Purpose or subject
   * @param {string} created_by - Author or creator
   * @param {string} cc - Carbon copy recipient(s) (optional)
   * @param {Date} created_at - Creation date (optional, defaults to current date)
   */
  constructor(id, type, memo_number, to, reason, created_by, cc = '', created_at = null) {
    // Validate type
    if (!['memo', 'surat'].includes(type)) {
      throw new Error("Type must be either 'memo' or 'surat'");
    }
    
    this.id = id;
    this.type = type;
    this.memo_number = memo_number;
    this.to = to;
    this.cc = cc;
    this.reason = reason;
    this.created_by = created_by;
    this.created_at = created_at || new Date();
  }

  /**
   * Convert the document to a JSON object
   * @returns {Object} JSON representation of the document
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      memo_number: this.memo_number,
      to: this.to,
      cc: this.cc,
      reason: this.reason,
      created_by: this.created_by,
      created_at: this.created_at
    };
  }

  /**
   * Create a document from a JSON object
   * @param {Object} json - JSON object
   * @returns {MemoDocument} New document instance
   */
  static fromJSON(json) {
    const doc = new MemoDocument(
      json.id,
      json.type,
      json.memo_number,
      json.to,
      json.reason,
      json.created_by,
      json.cc,
      json.created_at ? new Date(json.created_at) : null
    );
    
    return doc;
  }
}

module.exports = MemoDocument;
