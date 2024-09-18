const pool = require('../../config/db');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateAuthor = async (req, res) => {

    const { id } = req.params;
    console.log('Body', req.body);
    console.log('File', req.file); // Log file information

    const { authorName, nickname, dob, dod, nationality, biography, awards, x, instagram, facebook, website, genres, imageName } = req.body;
    console.log(authorName, nickname, dob, dod, nationality, biography, awards, x, instagram, facebook, website, genres);

    const image = req.file ? await putImage(id, req.file, 'authors') : imageName; // Await the function to resolve the promise
    console.log('The image key for Amazon is:', image);

    if (image) {
        console.log('Image is:', image);
    }

    try {
        const [result] = await pool.query(
            'UPDATE authors SET authorName = ?, nickname = ?, dob = ?, dod = ?, nationality = ?, biography = ?, awards = ?, x = ?, instagram = ?, facebook = ?, website = ?, genres = ?, image = ? WHERE id = ?',
            [authorName, nickname || null, dob, dod || null, nationality, biography, awards, x, instagram, facebook, website, genres, image, id]
        );

        // Fetch the updated author data
        const [authorRows] = await pool.query(`
            SELECT a.*, 
              COUNT(DISTINCT s.id) AS numSeries, 
              COUNT(DISTINCT b.id) AS numBooks
            FROM authors a
            LEFT JOIN series s ON a.id = s.author_id
            LEFT JOIN books b ON a.id = b.author_id
            WHERE a.id = ?
            GROUP BY a.id
        `, [id]
        );

        if (authorRows.length === 0) {
            return res.status(404).json({ message: 'Author not found after update' });
        }

        let url = null;
        if (authorRows[0].image && authorRows[0].image !== 'null') {
          url = await getImageURL(authorRows[0].image);
        }
        authorRows[0].imageURL = url;

        const updatedAuthors = authorRows[0];

        if (req.io) {
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
