import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    database: process.env.PG_DATABASE || 'db_icd_codes',
});

async function testSearch() {
    try {
        console.log('Testing connection to db_icd_codes...');
        const res = await pool.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);

        const q = 'diabetes';
        const query = `
      SELECT icd_10_code AS icd_code, original_condition AS condition, synonyms, drugs, billability, years
      FROM icd_codes_data
      WHERE icd_10_code ILIKE $1 
         OR original_condition ILIKE $1 
         OR synonyms ILIKE $1
      LIMIT 20
    `;
        const values = [`%${q}%`];
        console.log(`Searching for: ${q}`);
        const searchRes = await pool.query(query, values);
        console.log(`Found ${searchRes.rows.length} results:`);
        searchRes.rows.forEach((row, i) => {
            console.log(`${i + 1}. [${row.icd_code}] ${row.condition}`);
        });

    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        await pool.end();
    }
}

testSearch();
