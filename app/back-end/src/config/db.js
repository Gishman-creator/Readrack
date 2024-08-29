const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    timezone: 'Z'
})

async function testConnection() {
    try {
        const [rows] = await pool.query('select 1 + 1 as solution');
        console.log('✅ Successfully connected to the database.');
    } catch (error) {
        console.log('❌ Error connecting to the database:', error.message);
    }
};

testConnection();

module.exports = pool; 