const pool = require('../../config/db');

const updateAuthor = async (req, res) => {
  const { id } = req.params;
  console.log('Body', req.body);
  console.log('File', req.file); // Log file information

  const { authorName, numSeries, numBooks, dob, nationality, biography, awards, x, instagram, facebook, website, genres } = req.body;

  // Access the file from req.file
  let image = req.file ? req.file.buffer : null; // Use buffer for memory storage

  if (image) {
      console.log('Image is there');
  } else {
      console.log('No image uploaded');
  }

  try {
      const [result] = await pool.query(
          'UPDATE authors SET name = ?, seriesNo = ?, bookNo = ?, date = ?, nationality = ?, bio = ?, awards = ?, x = ?, ig = ?, fb = ?, link = ?, genres = ?, image = ? WHERE id = ?',
          [authorName, numSeries  || 0, numBooks || 0, dob, nationality, biography, awards, x, instagram, facebook, website, genres, image, id]
      );
      res.status(200).json({ message: 'Author updated successfully', result });
  } catch (error) {
      console.error('Error updating author:', error);
      res.status(500).json({ message: 'Failed to update author', error: error.message });
  }
};

module.exports = {
  updateAuthor,
  // other controller methods
};
