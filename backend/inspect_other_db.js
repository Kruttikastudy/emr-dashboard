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

async function inspectOtherDb() {
    try {
        console.log('Inspecting database db_icd_codes...');
        const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log(`Found ${tablesRes.rows.length} tables:`);
        tablesRes.rows.forEach(row => console.log(`- ${row.table_name}`));

        if (tablesRes.rows.length > 0) {
            const tableName = tablesRes.rows[0].table_name;
            console.log(`\nChecking columns for table ${tableName}...`);
            const colsRes = await pool.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = $1
      `, [tableName]);
            colsRes.rows.forEach(row => console.log(`- ${row.column_name}`));

            console.log(`\nSearching for "diabetes" in ${tableName}...`);
            // Assuming 'condition' or similar column exists, let's just try a broad search if possible
            // or just check row count first
            const countRes = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
            console.log(`Total rows: ${countRes.rows[0].count}`);

            // Try to find 'diabetes' in any text column
            const searchRes = await pool.query(`
        SELECT * FROM ${tableName} 
        WHERE icd_code ILIKE '%diabetes%' 
           OR condition ILIKE '%diabetes%' 
        LIMIT 5
      `).catch(e => {
                console.log('Search failed (maybe column names different):', e.message);
                return { rows: [] };
            });

            console.log(`Found ${searchRes.rows.length} rows for "diabetes".`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

inspectOtherDb();
