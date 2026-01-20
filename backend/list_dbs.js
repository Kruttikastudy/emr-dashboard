import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connect to 'postgres' database to list other databases
const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    database: 'postgres',
});

async function listDatabases() {
    try {
        console.log('Listing all databases...');
        const res = await pool.query('SELECT datname FROM pg_database WHERE datistemplate = false');
        console.log(`Found ${res.rows.length} databases:`);
        res.rows.forEach(row => {
            console.log(`- ${row.datname}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

listDatabases();
