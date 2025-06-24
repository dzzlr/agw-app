const { pool } = require("../config/db");

// Fetch all config
const getAllConfig = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM system_config`
        );
    
        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Database error:", error.message);
  
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// Fetch config by key
const getConfig = async (req, res) => {
    try {
        const key = req.query.key; // Retrieve the key from the query parameters

        if (!key) {
            return res.status(400).json({ success: false, error: "Key is required" });
        }

        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT value FROM system_config WHERE key = $1`, [key]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: "Key not found" });
            }

            res.status(200).json({
                success: true,
                data: result.rows,  // Send back all rows found to match the API
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Database error:", error.message);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

// Update multiple configs
const updateConfig = async (req, res) => {
    try {
        const updates = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: "A list of key-value pairs is required",
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const { key, value } of updates) {
                if (!key || value === undefined) {
                    throw new Error("Each item must have a key and a value");
                }

                await client.query(
                    `UPDATE system_config 
                    SET value = $1 
                    WHERE key = $2`, [value, key]
                );
            }

            await client.query('COMMIT');
            res.status(200).json({
                success: true,
                message: "Configurations updated successfully",
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Transaction error:", error.message);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Database error:", error.message);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

module.exports = { getConfig, getAllConfig, updateConfig };