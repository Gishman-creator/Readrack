const poolpg = require('../../config/dbpg'); // Ensure this points to the PostgreSQL poolpg configuration
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateBook = async (req, res) => {
  const { id } = req.params;

  const { book_name, serie_id, author_id, serie_index, publish_date, genre, amazon_link, imageName } = req.body;

  const image = req.file ? await putImage(id, req.file, 'books') : imageName;
  const serieId = Number.isNaN(parseInt(serie_id)) ? 0 : parseInt(serie_id);

  try {
    // Update the book in the database
    const updateResult = await poolpg.query(
      `UPDATE books 
       SET book_name = $1, serie_id = $2, author_id = $3, serie_index = $4,
        publish_date = $5, genre = $6, amazon_link = $7, image = $8
       WHERE id = $9`,
      [book_name, serieId, author_id || null, serie_index || null, publish_date || null, genre, amazon_link, image, id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: 'Book not found or not updated' });
    }

    // Fetch the updated book data
    const bookResult = await poolpg.query(`
      SELECT books.*, authors.author_name, 
             series.serie_name
      FROM books
      LEFT JOIN authors ON books.author_id::text = authors.id::text
      LEFT JOIN series ON books.serie_id::text = series.id::text
      WHERE books.id = $1
    `, [id]);

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found after update' });
    }

    const book = bookResult.rows[0];

    // Fetch authors for the book
    const authors = await getAuthorsByIds(book.author_id);
    book.authors = authors;

    let url = null;
    if (book.image && book.image !== 'null') {
      url = await getImageURL(book.image);
    }
    book.imageURL = url;

    const updatedBook = book;

    // Emit the updated book data
    if (req.io) {
      req.io.emit('booksUpdated', updatedBook);
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
