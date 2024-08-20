const pool = require('../../config/db');

const updateBook = async (req, res) => {
  const { id } = req.params;
  console.log('Body', req.body);
  console.log('File', req.file); // Log file information
  const { bookName, serieName, authorName, authorNo, serieNo, publishDate, genres, link } = req.body;

  // Access the file from req.file
  let image = req.file ? req.file.buffer : null; // Use buffer for memory storage

  if (image) {
    console.log('Image is there');
  } else {
    console.log('No image uploaded');
  }

  try {
    const [result] = await pool.query(
      'UPDATE books SET name = ?, serie_name = ?, author_name = ?, authorNo = ?, serieNo = ?, date = ?, genres = ?, link = ?, image = ? WHERE id = ?',
      [bookName, serieName || null, authorName, authorNo || 0, serieNo || 0, publishDate, genres, link, image, id]
    );
    res.status(200).json({ message: 'Book updated successfully', result });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
};


module.exports = {
  updateBook,
  // other controller methods
};
