import express from 'express';
import pool from '../config/pgConfig.js';

const router = express.Router();

// Search ICD-10 codes or conditions
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        // Searching by icd_10_code, original_condition, or synonyms
        const query = `
      SELECT icd_10_code AS icd_code, original_condition AS condition, synonyms, drugs, billability, years
      FROM icd_codes_data
      WHERE icd_10_code ILIKE $1 
         OR original_condition ILIKE $1 
         OR synonyms ILIKE $1
      LIMIT 10
    `;
        const values = [`%${q}%`];
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Error searching ICD-10:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get details for a specific ICD-10 code
router.get('/details/:code', async (req, res) => {
    const { code } = req.params;

    try {
        const query = 'SELECT icd_10_code AS icd_code, original_condition AS condition, synonyms, drugs, billability, years FROM icd_codes_data WHERE icd_10_code = $1';
        const result = await pool.query(query, [code]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'ICD-10 code not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching ICD-10 details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
