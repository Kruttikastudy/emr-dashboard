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

async function checkRange() {
    try {
        console.log('Checking ICD code range...');
        const res = await pool.query('SELECT MIN(icd_code), MAX(icd_code) FROM icd_data');
        console.log('Range:', res.rows[0]);

        console.log('\nChecking for any code starting with "E"...');
        const eRes = await pool.query("SELECT COUNT(*) FROM icd_data WHERE icd_code LIKE 'E%'");
        console.log(`Found ${eRes.rows[0].count} codes starting with "E".`);

        if (eRes.rows[0].count > 0) {
            const sampleERes = await pool.query("SELECT icd_code, condition FROM icd_data WHERE icd_code LIKE 'E%' LIMIT 5");
            sampleERes.rows.forEach(row => console.log(`- [${row.icd_code}] ${row.condition}`));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkRange();
