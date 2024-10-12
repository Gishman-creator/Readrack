const poolpg = require('../../config/dbpg'); // Ensure this points to the PostgreSQL poolpg configuration
const { fetchPublishYearsUtil } = require('../../utils/fetchPublishYearsUtil');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateSerie = async (req, res) => {
  const { id } = req.params;
  const { serieName, numBooks, genres, link, author_id, related_collections, imageName } = req.body;

  const image = req.file ? await putImage(id, req.file, 'series') : imageName;

  try {
    // Update the series data in the database
    const result = await poolpg.query(
      `UPDATE series 
       SET "serieName" = $1, "numBooks" = $2, genres = $3, link = $4, author_id = $5, related_collections = $6, image = $7 
       WHERE id = $8`,
      [serieName, numBooks, genres, link, author_id || null, related_collections, image, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Serie not found or not updated' });
    }

    // Fetch the updated serie data
    const serieResult = await poolpg.query(`
      SELECT series.*,
      COUNT(DISTINCT books.id) AS "currentBooks"
      FROM series
      LEFT JOIN books ON books.serie_id = series.id
      WHERE series.id = $1
      GROUP BY series.id
    `, [id]);

    if (serieResult.rows.length === 0) {
      return res.status(404).json({ message: 'Serie not found after update' });
    }

    // Fetch authors for the serie
    const authors = await getAuthorsByIds(serieResult.rows[0].author_id);
    serieResult.rows[0].authors = authors;

    // Use the utility function to fetch publish years
    const publishYears = await fetchPublishYearsUtil(serieResult.rows.id, 'serie');

    // Step 3: Find the first and last book years
    serieResult.rows[0].first_book_year = publishYears.length > 0 ? Math.min(...publishYears) : null;
    serieResult.rows[0].last_book_year = publishYears.length > 0 ? Math.max(...publishYears) : null;

    // Fetch image URL if image is set
    let url = null;
    if (serieResult.rows[0].image && serieResult.rows[0].image !== 'null') {
      url = await getImageURL(serieResult.rows[0].image);
    }
    serieResult.rows[0].imageURL = url;

    const updatedSeries = serieResult.rows[0];

    // Emit the updated series data using Socket.IO
    if (req.io) {
      req.io.emit('seriesUpdated', updatedSeries);
    } else {
      console.error('Socket.IO is not initialized.');
    }

    res.status(200).json({ message: 'Serie updated successfully', updatedSeries });
  } catch (error) {
    console.error('Error updating series:', error);
    res.status(500).json({ message: 'Failed to update series', error: error.message });
  }
};

module.exports = {
  updateSerie,
  // other controller methods
};
