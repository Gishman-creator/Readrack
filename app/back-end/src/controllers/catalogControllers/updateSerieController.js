const pool = require('../../config/db');

const updateSerie = async (req, res) => {
  const { id } = req.params;
  const { serieName, numBooks, genres, link, author_id } = req.body;

  let image = req.file ? req.file.buffer : null;
  console.log('The image is:', image);

  try {
    const [result] = await pool.query(
      'UPDATE series SET serieName = ?, numBooks = ?, genres = ?, link = ?, author_id = ?, image = ? WHERE id = ?',
      [serieName, numBooks, genres, link, author_id, image, id]
    );

    // Fetch the updated serie data
    const [serieRows] = await pool.query(`
      SELECT series.*, authors.authorName AS author_name
      FROM series
      LEFT JOIN authors ON series.author_id = authors.id
      WHERE series.id = ?
      `, [id]
    );

    // Fetch the first book's name and date for each series
    for (let i = 0; i < serieRows.length; i++) {
      const [firstBook] = await pool.query(`
        SELECT bookName, publishDate
        FROM books
        WHERE serie_id = ?
        ORDER BY publishDate ASC
        LIMIT 1
      `, [serieRows[i].id]);

      // Embed the first book's name and date into the series result
      serieRows[i].firstBook = firstBook.length > 0 ? firstBook[0] : null;
    }

    if (serieRows.length === 0) {
      return res.status(404).json({ message: 'Serie not found after update' });
    }

    const updatedSeries = serieRows[0];

    // Use req.io to emit the event
    if (req.io) {
      req.io.emit('seriesUpdated', updatedSeries);
      console.log('Emitting updated series:', updatedSeries);
    } else {
      console.error('Socket.IO is not initialized.');
    }

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
