const pool = require('../../config/db');

const updateSerie = async (req, res) => {
  const { id } = req.params;
  const { serieName, numBooks, genres, link, authorName } = req.body;

  // Access the file from req.file
  let image = req.file ? req.file.buffer : null; // Use buffer for memory storage

  if (image) {
    console.log('Image is there');
  } else {
    console.log('No image uploaded');
  }

  try {
    const [result] = await pool.query(
      'UPDATE series SET name = ?, booksNo = ?, genres = ?, link = ?, author_name = ?, image = ? WHERE id = ?',
      [serieName, numBooks, genres, link, authorName, image, id]
    );
    res.status(200).json({ message: 'Series updated successfully', result });
  } catch (error) {
    console.error('Error updating series:', error);
    res.status(500).json({ message: 'Failed to update series', error: error.message });
  }
};

module.exports = {
  updateSerie,
  // other controller methods
};
