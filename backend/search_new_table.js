import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    database: 'db_icd_codes',
});

async function searchInNewTable() {
    try {
        console.log('Searching for "diabetes" in icd_codes_data...');
        const res = await pool.query(`
      SELECT icd_10_code, original_condition 
      FROM icd_codes_data 
      WHERE original_condition ILIKE '%diabetes%' 
         OR synonyms ILIKE '%diabetes%'
      LIMIT 10
    `);
        console.log(`Found ${res.rows.length} rows.`);
        res.rows.forEach((row, i) => {
            console.log(`${i + 1}. [${row.icd_10_code}] ${row.original_condition}`);
        });

        const countRes = await pool.query('SELECT COUNT(*) FROM icd_codes_data');
        console.log(`\nTotal rows in icd_codes_data: ${countRes.rows[0].count}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

searchInNewTable();
