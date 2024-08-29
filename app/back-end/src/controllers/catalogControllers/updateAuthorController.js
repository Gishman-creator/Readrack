const pool = require('../../config/db');

const updateAuthor = async (req, res) => {
    const { id } = req.params;
    console.log('Body', req.body);
    console.log('File', req.file); // Log file information

    const { authorName, nickname, numSeries, numBooks, dob, nationality, biography, awards, x, instagram, facebook, website, genres } = req.body;
    console.log(authorName, nickname, numSeries, numBooks, dob, nationality, biography, awards, x, instagram, facebook, website, genres)

    // Access the file from req.file
    let image = req.file ? req.file.buffer : null; // Use buffer for memory storage

    if (image) {
        console.log('Image is there');
    } else {
        console.log('No image uploaded');
    }

    try {
        const [result] = await pool.query(
            'UPDATE authors SET authorName = ?, nickname = ?, numSeries = ?, numBooks = ?, dob = ?, nationality = ?, biography = ?, awards = ?, x = ?, instagram = ?, facebook = ?, website = ?, genres = ?, image = ? WHERE id = ?',
            [authorName, nickname || null, numSeries || 0, numBooks || 0, dob, nationality, biography, awards, x, instagram, facebook, website, genres, image, id]
        );

        // Fetch the updated author data
        const [authorRows] = await pool.query(
          'SELECT * FROM authors WHERE id = ?',
          [id]
        );
    
        if (authorRows.length === 0) {
          return res.status(404).json({ message: 'Author not found after update' });
        }

        const updatedAuthors = authorRows[0];

        if(req.io) {
            req.io.emit('authorsUpdated', updatedAuthors);
            console.log('Emitting updated authors:', updatedAuthors);
        } else {
            console.log('Socket.Io is not initialized.');
        }

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
