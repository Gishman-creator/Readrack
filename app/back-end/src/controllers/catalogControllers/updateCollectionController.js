const poolpg = require('../../config/dbpg'); // Ensure this points to the PostgreSQL poolpg configuration
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateCollection = async (req, res) => {
  const { id } = req.params;
  const { collectionName, numBooks, genres, link, author_id, imageName } = req.body;
    
  const image = req.file ? await putImage(id, req.file, 'collections') : imageName;

  try {
    // Update the collection in the database
    const result = await poolpg.query(
      `UPDATE collections 
       SET collectionName = $1, numBooks = $2, genres = $3, link = $4, author_id = $5, image = $6 
       WHERE id = $7`,
      [collectionName, numBooks, genres, link, author_id || null, image, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Collection not found or not updated' });
    }

    // Fetch the updated collection data
    const collectionResult = await poolpg.query(`
      SELECT collections.*,
        EXTRACT(YEAR FROM MIN(COALESCE(books."publishDate", 
                                      -- Try converting customDate to a full date format
                                      CASE 
                                        WHEN books."customDate" ~* '^[0-9]{4}$' 
                                        THEN to_date(books."customDate", 'YYYY')  -- If only a year
                                        WHEN books."customDate" ~* '^[A-Za-z]+ [0-9]{4}$' 
                                        THEN to_date(books."customDate", 'Month YYYY')  -- If month and year
                                        ELSE NULL
                                      END))) AS first_book_year,
        EXTRACT(YEAR FROM MAX(COALESCE(books."publishDate", 
                                      CASE 
                                        WHEN books."customDate" ~* '^[0-9]{4}$' 
                                        THEN to_date(books."customDate", 'YYYY')
                                        WHEN books."customDate" ~* '^[A-Za-z]+ [0-9]{4}$' 
                                        THEN to_date(books."customDate", 'Month YYYY')
                                        ELSE NULL
                                      END))) AS last_book_year,
        COUNT(DISTINCT books.id) AS "numBooks"
      FROM collections
      LEFT JOIN books ON books.collection_id = collections.id
      WHERE collections.id = $1
      GROUP BY collections.id
    `, [id]);

    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Collection not found after update' });
    }

    // Fetch authors for the collection
    const authors = await getAuthorsByIds(collectionResult.rows[0].author_id);
    collectionResult.rows[0].authors = authors;

    // Fetch image URL
    let url = null;
    if (collectionResult.rows[0].image && collectionResult.rows[0].image !== 'null') {
      url = await getImageURL(collectionResult.rows[0].image);
    }
    collectionResult.rows[0].imageURL = url;

    const updatedCollections = collectionResult.rows[0];

    // Emit the updated collection data
    if (req.io) {
      req.io.emit('collectionsUpdated', updatedCollections);
    }

    res.status(200).json({ message: 'Collection updated successfully', updatedCollections });
  } catch (error) {
    console.error('Error updating collections:', error);
    res.status(500).json({ message: 'Failed to update collections', error: error.message });
  }
};

module.exports = {
  updateCollection,
  // other controller methods
};
