// controllers/getBooksController.js
const pool = require('../../config/db');

exports.getBooks = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT name, serie_name AS serieName, author_name AS authorName, date, link 
      FROM books
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Error fetching books');
  }
};
