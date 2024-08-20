// controllers/getAuthorsController.js
const pool = require('../../config/db');

exports.getAuthors = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM authors
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).send('Error fetching authors');
  }
};

exports.getAuthorById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM authors WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).send('Error fetching author');
  }
};
