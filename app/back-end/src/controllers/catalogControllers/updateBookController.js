const pool = require('../../config/db');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateBook = async (req, res) => {
  const { id } = req.params;
  console.log('Body', req.body);
  console.log('File', req.file); // Log file information
  console.log('The request body is:', req.body);
  const { bookName, serie_id, collection_id, author_id, publishDate, customDate, genres, link, imageName } = req.body;
    
  const image = req.file ? await putImage(id, req.file, 'books') : imageName; // Await the function to resolve the promise
  console.log('The image key for Amazon is:', image);

  if (image) {
    console.log('Image is there');
  } else {
    console.log('No image uploaded');
  }

  try {
    // Update the book in the database
    const [updateResult] = await pool.query(
      'UPDATE books SET bookName = ?, serie_id = ?, collection_id = ?, author_id = ?, publishDate = ?, customDate = ?, genres = ?, link = ?, image = ? WHERE id = ?',
      [bookName, serie_id || null, collection_id || null, author_id || null, publishDate || null, customDate || null, genres, link, image, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found or not updated' });
    }

    // Fetch the updated book data
    const [bookRows] = await pool.query(`
      SELECT books.*, authors.authorName AS author_name, authors.nickname, series.serieName AS serie_name, collections.collectionName AS collection_name
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.id = ?
      `, [id]
    );

    if (bookRows.length === 0) {
      return res.status(404).json({ message: 'Book not found after update' });
    }

    const book = bookRows[0];
    // Fetch authors for the book
    const authors = await getAuthorsByIds(book.author_id);
    book.authors = authors;

    let url = null;
    if (bookRows[0].image && bookRows[0].image !== 'null') {
      url = await getImageURL(bookRows[0].image);
    }
    bookRows[0].imageURL = url;

    const updatedBook = bookRows[0];

    // Emit the updated serie data
    if (req.io) {
      req.io.emit('booksUpdated', updatedBook);
      console.log('Emitting updated books:', updatedBook);
    } else {
      console.log('Socket.IO is not initialized.');
    }

    res.status(200).json({ message: 'Book updated successfully', updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
};

module.exports = {
  updateBook,
  // other controller methods
};
