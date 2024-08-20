// controllers/getBooksController.js
const pool = require('../../config/db');

exports.getBooks = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM books
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Error fetching books');
  }
};

exports.getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).send('Error fetching book');
  }
};

exports.getBookBySerie = async (req, res) => {
  try {
    let { serieName } = req.params;

    // Decode the URL-encoded series name to handle spaces
    serieName = decodeURIComponent(serieName);

    const books = await pool.query('SELECT * FROM books WHERE serie_name = ?', [serieName]);

    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
