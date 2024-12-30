// src/controllers/addBookController.js

const poolpg = require('../../config/dbpg');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for image blob
const { putImage, getImageURL } = require('../../utils/imageUtils');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { generateUniqueId } = require('../../utils/idUtils');


const addBook = async (req, res) => {
  try {
    let {
      book_name,
      author_id,
      serie_id,
      publish_date,
      serie_index,
      genre,
      amazon_link,
    } = req.body;

    const image = req.file ? await putImage('', req.file, 'books') : null;

    const uniqueId = await generateUniqueId('books', 6)

    // Convert empty strings to null for foreign key fields
    const serieId = Number.isNaN(parseInt(serie_id)) ? 0 : parseInt(serie_id);
    const serieIndex = Number.isNaN(parseInt(serie_index)) ? 0 : parseInt(serie_index);

    // Insert book data into the database with the unique ID
    const query = `
      INSERT INTO books (
        id, image, book_name, author_id, serie_id, genre, publish_date, serie_index, amazon_link
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const values = [
      uniqueId,
      image,
      book_name,
      author_id,
      serieId,
      genre || null,
      publish_date || null,
      serieIndex,
      amazon_link || null,
    ];

    // console.log('values', values);

    // Increment num_books for each author in author_id
    const authorIds = author_id.split(',').map(id => id.trim()); // Split if multiple authors
    await poolpg.query(`
      UPDATE authors
      SET num_books = num_books + 1
      WHERE id = ANY($1::int[])
    `, [authorIds]);

    await poolpg.query(query, values);

    const { rows: bookData } = await poolpg.query(`
      SELECT books.*, series.serie_name
      FROM books
      LEFT JOIN series ON books.serie_id::text = series.id::text
      WHERE books.id = $1
    `, [uniqueId]);

    const book = bookData[0];

    // Fetch authors for the book
    const authors = await getAuthorsByIds(book.author_id);
    book.authors = authors;

    let url = null;
    if (bookData[0].image && bookData[0].image !== 'null') {
      url = await getImageURL(bookData[0].image);
    }
    bookData[0].imageURL = url;

    // Emit the newly added book data if Socket.IO is initialized
    if (req.io) {
      req.io.emit('bookAdded', bookData[0]);  // Emit the full book data
    }

    res.status(201).json({ message: 'Book added successfully', bookId: uniqueId });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
};

module.exports = {
  addBook,
};
