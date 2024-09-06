const pool = require('../../config/db');

const updateCollection = async (req, res) => {
  const { id } = req.params;
  const { collectionName, numBooks, genres, link, author_id } = req.body;
  console.log('The update collection update body is:', req.body);

  let image = req.file ? req.file.buffer : null;
  console.log('The image is:', image);
  console.log('Image content type:', req.file ? req.file.mimetype : 'No file uploaded');

  try {
    const [result] = await pool.query(
      'UPDATE collections SET collectionName = ?, numBooks = ?, genres = ?, link = ?, author_id = ?, image = ? WHERE id = ?',
      [collectionName, numBooks, genres, link, author_id || null, image, id]
    );

    console.log('Collection updated successfully1 for:', id);

    // Fetch the updated collection data
    const [collectionRows] = await pool.query(`
      SELECT collections.*, 
             authors.nickname, 
             authors.authorName AS author_name,
             YEAR(MIN(books.publishDate)) AS first_book_year,
             YEAR(MAX(books.publishDate)) AS last_book_year
      FROM collections
      LEFT JOIN authors ON collections.author_id = authors.id
      LEFT JOIN books ON books.collection_id = collections.id
      WHERE collections.id = ?
      GROUP BY collections.id, authors.nickname, authors.authorName
      `, [id]
    );

    // Fetch the first book's name and date for each collections
    for (let i = 0; i < collectionRows.length; i++) {
      const [firstBook] = await pool.query(`
        SELECT bookName, publishDate
        FROM books
        WHERE collection_id = ?
        ORDER BY publishDate ASC
        LIMIT 1
      `, [collectionRows[i].id]);

      // Embed the first book's name and date into the collections result
      collectionRows[i].firstBook = firstBook.length > 0 ? firstBook[0] : null;
    }

    if (collectionRows.length === 0) {
      return res.status(404).json({ message: 'Collection not found after update' });
    }

    const updatedCollections = collectionRows[0];

    // Use req.io to emit the event
    if (req.io) {
      req.io.emit('collectionsUpdated', updatedCollections);
      console.log('Emitting updated collections:', updatedCollections);
    } else {
      console.error('Socket.IO is not initialized.');
    }

    console.log('Collection updated successfully2');

    res.status(200).json({ message: 'Collection updated successfully', result });
  } catch (error) {
    console.error('Error updating collections:', error);
    res.status(500).json({ message: 'Failed to update collections', error: error.message });
  }
};

module.exports = {
  updateCollection,
  // other controller methods
};
