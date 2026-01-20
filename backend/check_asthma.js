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

async function checkAsthma() {
    try {
        console.log('Searching for "Asthma"...');
        const res = await pool.query("SELECT * FROM icd_data WHERE condition ILIKE '%Asthma%'");
        console.log(`Found ${res.rows.length} rows for "Asthma".`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkAsthma();
