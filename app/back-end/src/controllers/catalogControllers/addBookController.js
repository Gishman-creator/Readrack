const pool = require('../../config/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for image blob

const addBook = async (req, res) => {
  try {
    const {
      bookName,
      authorName,
      authorNo,
      serieName,
      serieNo,
      publishDate,
      genres,
      link,
    } = req.body;

    // Check if the file is attached and read the buffer
    const bookImageBlob = req.file ? req.file.buffer : null;

    // Insert book data into the database
    const query = `
      INSERT INTO books (
        image, name, serie_name, serieNo, author_name, genres, authorNo, date, link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      bookImageBlob,
      bookName,
      serieName || null,
      serieNo || null,
      authorName || null,
      genres || null,
      authorNo || null,
      publishDate || null,
      link || null,
    ];

    const [result] = await pool.execute(query, values);

    res.status(201).json({ message: 'Book added successfully', bookId: result.insertId });
    console.log('Book added successfully');
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
};

module.exports = {
  addBook,
};
