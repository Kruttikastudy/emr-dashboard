import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    database: process.env.PG_DATABASE || 'icd_data',
});

async function globalSearch() {
    try {
        console.log('Performing global search for "diabetes"...');
        const res = await pool.query(`
      SELECT * FROM icd_data 
      WHERE icd_code ILIKE '%diabetes%' 
         OR condition ILIKE '%diabetes%' 
         OR synonyms ILIKE '%diabetes%'
         OR drugs ILIKE '%diabetes%'
    `);
        console.log(`Found ${res.rows.length} rows.`);
        if (res.rows.length > 0) {
            res.rows.forEach((row, i) => {
                console.log(`${i + 1}. [${row.icd_code}] ${row.condition}`);
            });
        } else {
            console.log('No rows found for "diabetes".');

            console.log('\nChecking for any condition with "mellitus"...');
            const mellRes = await pool.query("SELECT condition FROM icd_data WHERE condition ILIKE '%mellitus%' LIMIT 5");
            console.log(`Found ${mellRes.rows.length} rows for "mellitus".`);
            mellRes.rows.forEach(row => console.log(`- ${row.condition}`));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

globalSearch();
