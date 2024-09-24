const pool = require('../../config/db');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateSerie = async (req, res) => {
  const { id } = req.params;
  const { serieName, numBooks, genres, link, author_id, related_collections, imageName } = req.body;
  // console.log('The image name is:', imageName);
    
  const image = req.file ? await putImage(id, req.file, 'series') : imageName; // Await the function to resolve the promise
  // console.log('The image key for Amazon is:', image);

  try {
    const [result] = await pool.query(
      'UPDATE series SET serieName = ?, numBooks = ?, genres = ?, link = ?, author_id = ?, related_collections = ?, image = ? WHERE id = ?',
      [serieName, numBooks, genres, link, author_id, related_collections, image, id]
    );

    // console.log('Serie updated successfully1 for:', id);

    // Fetch the updated serie data
    const [serieRows] = await pool.query(`
      SELECT series.*,
             YEAR(MIN(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS first_book_year,
             YEAR(MAX(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS last_book_year
      FROM series
      LEFT JOIN books ON books.serie_id = series.id
      WHERE series.id = ?
      GROUP BY series.id
      `, [id]
    );

    if (serieRows.length === 0) {
      return res.status(404).json({ message: 'Serie not found after update' });
    }
    
    // Fetch authors for the serieRows
    const authors = await getAuthorsByIds(serieRows[0].author_id);
    serieRows[0].authors = authors;

    let url = null;
    if (serieRows[0].image && serieRows[0].image !== 'null') {
      url = await getImageURL(serieRows[0].image);
    }
    serieRows[0].imageURL = url;

    const updatedSeries = serieRows[0];

    // Use req.io to emit the event
    if (req.io) {
      req.io.emit('seriesUpdated', updatedSeries);
      // console.log('Emitting updated series:', updatedSeries);
    } else {
      console.error('Socket.IO is not initialized.');
    }

    // console.log('Serie updated successfully2');

    res.status(200).json({ message: 'Serie updated successfully', result });
  } catch (error) {
    console.error('Error updating series:', error);
    res.status(500).json({ message: 'Failed to update series', error: error.message });
  }
};

module.exports = {
  updateSerie,
  // other controller methods
};
