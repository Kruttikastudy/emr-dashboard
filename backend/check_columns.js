import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    database: process.env.PG_DATABASE || 'icd_data', // Wait, .env said PG_DATABASE=icd_data
});

async function checkColumns() {
    try {
        console.log('Checking columns for table icd_data...');
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'icd_data'
    `);
        console.log(`Found ${res.rows.length} columns:`);
        res.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

        const countRes = await pool.query('SELECT COUNT(*) FROM icd_data');
        console.log(`Total rows in icd_data: ${countRes.rows[0].count}`);

    } catch (err) {
        console.error('Error during column check:', err);
    } finally {
        await pool.end();
    }
}

checkColumns();
