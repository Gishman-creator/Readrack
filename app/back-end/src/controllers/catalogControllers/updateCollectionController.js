const pool = require('../../config/db');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateCollection = async (req, res) => {
  const { id } = req.params;
  const { collectionName, numBooks, genres, link, author_id, imageName } = req.body;
  // console.log('The update collection update body is:', req.body);
  // console.log('The image info is:', req.file);
    
  const image = req.file ? await putImage(id, req.file, 'collections') : imageName; // Await the function to resolve the promise
  // console.log('The image key for Amazon is:', image);

  try {
    const [result] = await pool.query(
      'UPDATE collections SET collectionName = ?, numBooks = ?, genres = ?, link = ?, author_id = ?, image = ? WHERE id = ?',
      [collectionName, numBooks, genres, link, author_id || null, image, id]
    );

    // console.log('Collection updated successfully1 for:', id);

    // Fetch the updated collection data
    const [collectionRows] = await pool.query(`
      SELECT collections.*,
       YEAR(MIN(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS first_book_year,
       YEAR(MAX(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS last_book_year,
       COUNT(DISTINCT books.id) AS numBooks
      FROM collections
      LEFT JOIN books ON books.collection_id = collections.id
      WHERE collections.id = ?
      GROUP BY collections.id
      `, [id]
    );

    if (collectionRows.length === 0) {
      return res.status(404).json({ message: 'Collection not found after update' });
    }

    // Fetch authors for the collectionRows
    const authors = await getAuthorsByIds(collectionRows[0].author_id);
    collectionRows[0].authors = authors;

    let url = null;
    if (collectionRows[0].image && collectionRows[0].image !== 'null') {
      url = await getImageURL(collectionRows[0].image);
    }
    collectionRows[0].imageURL = url;

    const updatedCollections = collectionRows[0];

    // Use req.io to emit the event
    if (req.io) {
      req.io.emit('collectionsUpdated', updatedCollections);
      // console.log('Emitting updated collections:', updatedCollections);
    } else {
      console.error('Socket.IO is not initialized.');
    }

    // console.log('Collection updated successfully2');

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
