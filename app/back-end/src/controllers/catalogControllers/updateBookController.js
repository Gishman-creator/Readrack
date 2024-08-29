const pool = require('../../config/db');

const updateBook = async (req, res) => {
  const { id } = req.params;
  console.log('Body', req.body);
  console.log('File', req.file); // Log file information
  const { bookName, serie_id, author_id, publishDate, genres, link } = req.body;

  // Access the file from req.file
  let image = req.file ? req.file.buffer : null; // Use buffer for memory storage

  if (image) {
    console.log('Image is there');
  } else {
    console.log('No image uploaded');
  }

  try {
    // Update the book in the database
    const [updateResult] = await pool.query(
      'UPDATE books SET bookName = ?, serie_id = ?, author_id = ?, publishDate = ?, genres = ?, link = ?, image = ? WHERE id = ?',
      [bookName, serie_id || null, author_id, publishDate, genres, link, image, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found or not updated' });
    }

    // Fetch the updated book data
    const [bookRows] = await pool.query(`
      SELECT books.*, authors.nickname, authors.authorName AS author_name, series.serieName AS serie_name
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN series ON books.serie_id = series.id
      WHERE books.id = ?
      `, [id]
    );

    if (bookRows.length === 0) {
      return res.status(404).json({ message: 'Book not found after update' });
    }

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
