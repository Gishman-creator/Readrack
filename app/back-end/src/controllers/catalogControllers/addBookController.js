// src/controllers/addBookController.js

const pool = require('../../config/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for image blob
const { putImage, getImageURL } = require('../../utils/imageUtils');

// Function to generate a random ID
const generateRandomId = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

// Helper function to fetch authors based on their IDs
const getAuthorsByIds = async (authorIds) => {
  if (!authorIds) return [];

  const idsArray = authorIds.split(',').map(id => id.trim()); // Split the string and trim any spaces
  const placeholders = idsArray.map(() => '?').join(','); // Prepare placeholders for SQL IN clause

  const query = `SELECT id AS author_id, authorName AS author_name, nickname FROM authors WHERE id IN (${placeholders})`;
  const [authors] = await pool.query(query, idsArray);
  
  return authors;
};

const addBook = async (req, res) => {
  try {
    const {
      bookName,
      author_id,
      serie_id,
      collection_id,
      publishDate,
      customDate,
      genres,
      link,
    } = req.body;

    console.log('the received author ids are:', author_id);

    console.log('The added book info:', req.body);
    
    const image = req.file ? await putImage('', req.file, 'books') : null; // Await the function to resolve the promise
    console.log('The image key for Amazon is:', image);

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
        id, image, bookName, author_id, serie_id, collection_id, genres, publishDate, customDate, link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      uniqueId,
      image,
      bookName,
      author_id || null,
      serieId,
      collectionId,
      genres || null,
      publishDate || null,
      customDate || null,
      link || null,
    ];

    console.log('The values are:', values)

    await pool.execute(query, values);

    const [bookData] = await pool.query(`
      SELECT books.*, series.serieName AS serie_name, collections.collectionName AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.id = ?
      `, [uniqueId]
    );

    const book = bookData[0];
    // Fetch authors for the book
    const authors = await getAuthorsByIds(book.author_id);
    book.authors = authors;

    let url = null;
    if (bookData[0].image) {
      url = await getImageURL(bookData[0].image);
    }
    bookData[0].imageURL = url;

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
