const { Pool } = require('pg'); // Import the Pool class from pg package
const dotenv = require('dotenv');
dotenv.config();

const prod = process.env.NODE_ENV === "production";

// Create a connection pool to PostgreSQL
// const poolpg = new Pool({
//     connectionString: !prod ? process.env.DATABASE_URL_LOCAL : process.env.DATABASE_URL
// });

// Create a connection pool to PostgreSQL
const poolpg = new Pool({
    connectionString: !prod ? process.env.DATABASE_URL_LOCAL3 : process.env.DATABASE_URL3
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
