const { Pool } = require('pg'); // Import the Pool class from pg package
const dotenv = require('dotenv');
dotenv.config();

// Create a connection pool to PostgreSQL
const poolpg = new Pool({
    host: process.env.HOST,               // Use the PostgreSQL host
    user: process.env.PG_USER,            // PostgreSQL user (adjust environment variable if needed)
    password: process.env.PG_PASSWORD,    // PostgreSQL password (adjust environment variable if needed)
    database: process.env.PG_DATABASE,    // PostgreSQL database (adjust environment variable if needed)
    port: process.env.PG_PORT || 5432,        // Default PostgreSQL port
});

// Test the connection to the PostgreSQL database
async function testConnection() {
    try {
        const res = await poolpg.query('SELECT 1 + 1 AS solution');
        console.log('✅ Successfully connected to the PostgreSQL database.');
    } catch (error) {
        console.log('❌ Error connecting to the PostgreSQL database:', error.message);
    }
}

// Run the test connection
testConnection();

// Export the poolpg object to be used elsewhere
module.exports = poolpg;
