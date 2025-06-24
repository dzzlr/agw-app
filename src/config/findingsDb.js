// const { Pool } = require('pg');

// // Create a PostgreSQL connection pool
// const pool = new Pool({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DB,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_DB_PORT,
// });

// // Initialize the findings table if it doesn't exist
// const initFindingsTable = async () => {
//   try {
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS audit_findings (
//         id VARCHAR(255) PRIMARY KEY,
//         kategori_audit VARCHAR(255) NOT NULL,
//         nama_temuan VARCHAR(255) NOT NULL,
//         penyebab TEXT,
//         rekomendasi TEXT,
//         komitmen_tindak_lanjut TEXT,
//         batas_akhir_komitmen DATE,
//         pic VARCHAR(255),
//         status VARCHAR(50) DEFAULT 'not yet',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);
//     console.log('Audit findings table initialized');
//   } catch (error) {
//     console.error('Error initializing audit findings table:', error);
//   }
// };

// // Get all findings
// const getAllFindings = async () => {
//   try {
//     const result = await pool.query('SELECT * FROM audit_findings ORDER BY batas_akhir_komitmen ASC');
    
//     // Convert snake_case column names to camelCase for frontend compatibility
//     return result.rows.map(row => ({
//       id: row.id,
//       kategoriAudit: row.kategori_audit,
//       namaTemuan: row.nama_temuan,
//       penyebab: row.penyebab,
//       rekomendasi: row.rekomendasi,
//       komitmenTindakLanjut: row.komitmen_tindak_lanjut,
//       batasAkhirKomitmen: row.batas_akhir_komitmen ? row.batas_akhir_komitmen.toISOString().split('T')[0] : null,
//       pic: row.pic,
//       status: row.status,
//       createdAt: row.created_at,
//       updatedAt: row.updated_at
//     }));
//   } catch (error) {
//     console.error('Error getting findings:', error);
//     throw error;
//   }
// };

// // Get finding by ID
// const getFindingById = async (id) => {
//   try {
//     const result = await pool.query('SELECT * FROM audit_findings WHERE id = $1', [id]);
    
//     if (result.rows.length === 0) {
//       return null;
//     }
    
//     const row = result.rows[0];
//     return {
//       id: row.id,
//       kategoriAudit: row.kategori_audit,
//       namaTemuan: row.nama_temuan,
//       penyebab: row.penyebab,
//       rekomendasi: row.rekomendasi,
//       komitmenTindakLanjut: row.komitmen_tindak_lanjut,
//       batasAkhirKomitmen: row.batas_akhir_komitmen ? row.batas_akhir_komitmen.toISOString().split('T')[0] : null,
//       pic: row.pic,
//       status: row.status,
//       createdAt: row.created_at,
//       updatedAt: row.updated_at
//     };
//   } catch (error) {
//     console.error('Error getting finding by ID:', error);
//     throw error;
//   }
// };

// // Create a new finding
// const createFinding = async (finding) => {
//   try {
//     const {
//       id,
//       kategoriAudit,
//       namaTemuan,
//       penyebab,
//       rekomendasi,
//       komitmenTindakLanjut,
//       batasAkhirKomitmen,
//       pic,
//       status
//     } = finding;
    
//     const result = await pool.query(
//       `INSERT INTO audit_findings 
//        (id, kategori_audit, nama_temuan, penyebab, rekomendasi, komitmen_tindak_lanjut, batas_akhir_komitmen, pic, status)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//        RETURNING *`,
//       [id, kategoriAudit, namaTemuan, penyebab, rekomendasi, komitmenTindakLanjut, batasAkhirKomitmen, pic, status]
//     );
    
//     const row = result.rows[0];
//     return {
//       id: row.id,
//       kategoriAudit: row.kategori_audit,
//       namaTemuan: row.nama_temuan,
//       penyebab: row.penyebab,
//       rekomendasi: row.rekomendasi,
//       komitmenTindakLanjut: row.komitmen_tindak_lanjut,
//       batasAkhirKomitmen: row.batas_akhir_komitmen ? row.batas_akhir_komitmen.toISOString().split('T')[0] : null,
//       pic: row.pic,
//       status: row.status,
//       createdAt: row.created_at,
//       updatedAt: row.updated_at
//     };
//   } catch (error) {
//     console.error('Error creating finding:', error);
//     throw error;
//   }
// };

// // Update a finding
// const updateFinding = async (id, finding) => {
//   try {
//     const {
//       kategoriAudit,
//       namaTemuan,
//       penyebab,
//       rekomendasi,
//       komitmenTindakLanjut,
//       batasAkhirKomitmen,
//       pic,
//       status
//     } = finding;
    
//     const result = await pool.query(
//       `UPDATE audit_findings 
//        SET kategori_audit = $1, 
//            nama_temuan = $2, 
//            penyebab = $3, 
//            rekomendasi = $4, 
//            komitmen_tindak_lanjut = $5, 
//            batas_akhir_komitmen = $6, 
//            pic = $7, 
//            status = $8,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE id = $9
//        RETURNING *`,
//       [kategoriAudit, namaTemuan, penyebab, rekomendasi, komitmenTindakLanjut, batasAkhirKomitmen, pic, status, id]
//     );
    
//     if (result.rows.length === 0) {
//       return null;
//     }
    
//     const row = result.rows[0];
//     return {
//       id: row.id,
//       kategoriAudit: row.kategori_audit,
//       namaTemuan: row.nama_temuan,
//       penyebab: row.penyebab,
//       rekomendasi: row.rekomendasi,
//       komitmenTindakLanjut: row.komitmen_tindak_lanjut,
//       batasAkhirKomitmen: row.batas_akhir_komitmen ? row.batas_akhir_komitmen.toISOString().split('T')[0] : null,
//       pic: row.pic,
//       status: row.status,
//       createdAt: row.created_at,
//       updatedAt: row.updated_at
//     };
//   } catch (error) {
//     console.error('Error updating finding:', error);
//     throw error;
//   }
// };

// // Delete a finding
// const deleteFinding = async (id) => {
//   try {
//     const result = await pool.query('DELETE FROM audit_findings WHERE id = $1 RETURNING id', [id]);
//     return result.rows.length > 0;
//   } catch (error) {
//     console.error('Error deleting finding:', error);
//     throw error;
//   }
// };

// module.exports = {
//   initFindingsTable,
//   getAllFindings,
//   getFindingById,
//   createFinding,
//   updateFinding,
//   deleteFinding
// };
