// src/controllers/addBookController.js

const pool = require('../../config/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for image blob

// Function to generate a random ID
const generateRandomId = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addBook = async (req, res) => {
  try {
    const {
      bookName,
      author_id,
      serie_id,
      collection_id,
      publishDate,
      genres,
      link,
    } = req.body;

    console.log('The added book info:', req.body);

    // Check if the file is attached and read the buffer
    const bookImageBlob = req.file ? req.file.buffer : null;

    let uniqueId;
    let isUnique = false;

    // Generate a unique ID
    while (!isUnique) {
      uniqueId = generateRandomId();

      // Check if the ID already exists
      const [rows] = await pool.execute('SELECT id FROM books WHERE id = ?', [uniqueId]);

      if (rows.length === 0) {
        isUnique = true;
      }
    }

    // Convert empty strings to null for foreign key fields
    const serieId = serie_id === '' ? null : serie_id;
    const collectionId = collection_id === '' ? null : collection_id;
    

    // Insert book data into the database with the unique ID
    const query = `
      INSERT INTO books (
        id, image, bookName, author_id, serie_id, collection_id, genres, publishDate, link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      uniqueId,
      bookImageBlob,
      bookName,
      author_id || null,
      serieId,
      collectionId,
      genres || null,
      publishDate || null,
      link || null,
    ];

    console.log('The values are:', values)

    await pool.execute(query, values);

    const [bookData] = await pool.query(`
      SELECT books.*, authors.authorName AS author_name, series.serieName AS serie_name, collections.collectionName AS collection_name
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.id = ?
      `, [uniqueId]
    );

    // Emit the newly added book data if Socket.IO is initialized
    if (req.io) {
      req.io.emit('bookAdded', bookData[0]);  // Emit the full book data
      console.log('Emitting added book:', bookData[0]);
    } else {
      console.log('Socket.IO is not initialized.');
    }

    res.status(201).json({ message: 'Book added successfully', bookId: uniqueId });
    console.log('Book added successfully');
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
};

module.exports = {
  addBook,
};
