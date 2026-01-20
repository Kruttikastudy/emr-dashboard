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

async function listConditions() {
    try {
        console.log('Listing first 50 conditions...');
        const res = await pool.query('SELECT condition FROM icd_data LIMIT 50');
        res.rows.forEach((row, i) => {
            console.log(`${i + 1}. ${row.condition}`);
        });

        console.log('\nSearching for any condition containing "dia"...');
        const diaRes = await pool.query("SELECT condition FROM icd_data WHERE condition ILIKE '%dia%' LIMIT 10");
        console.log(`Found ${diaRes.rows.length} rows for "dia".`);
        diaRes.rows.forEach((row, i) => {
            console.log(`${i + 1}. ${row.condition}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

listConditions();
