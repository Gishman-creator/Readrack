// controllers/getAuthorsController.js
const pool = require('../../config/db');

exports.getAuthors = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT name, bookNo, date, nationality, link, searchCount 
      FROM authors
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).send('Error fetching authors');
  }
};
