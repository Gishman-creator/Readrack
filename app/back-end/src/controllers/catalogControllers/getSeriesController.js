// controllers/getSeriesController.js
const pool = require('../../config/db'); // Ensure your database connection pool is correctly imported

exports.getSeries = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT name, author_name AS authorName, booksNo, genres, link, searchCount 
      FROM series
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).send('Error fetching series');
  }
};
