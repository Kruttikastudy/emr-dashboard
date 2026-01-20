import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    database: process.env.PG_DATABASE || 'emr_db',
});

async function inspectTable() {
    try {
        console.log('Inspecting table icd_data...');
        const res = await pool.query('SELECT * FROM icd_data LIMIT 5');
        console.log(`Found ${res.rows.length} rows.`);
        res.rows.forEach((row, i) => {
            console.log(`${i + 1}.`, JSON.stringify(row, null, 2));
        });

        // Also check if there's ANY row with 'diabetes' in any column
        const searchAll = await pool.query(`
      SELECT * FROM icd_data 
      WHERE icd_code ILIKE '%diabetes%' 
         OR condition ILIKE '%diabetes%' 
         OR synonyms ILIKE '%diabetes%'
      LIMIT 5
    `);
        console.log(`Search for 'diabetes' found ${searchAll.rows.length} rows.`);

    } catch (err) {
        console.error('Error during inspection:', err);
    } finally {
        await pool.end();
    }
}

inspectTable();
