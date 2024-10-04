const poolpg = require('../../config/dbpg'); // Make sure this points to the pg poolpg configuration
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateAuthor = async (req, res) => {

    const { id } = req.params;

    const { authorName, nickname, dob, dod, customDob, nationality, biography, awards, x, instagram, facebook, website, genres, imageName } = req.body;

    const image = req.file ? await putImage(id, req.file, 'authors') : imageName;

    try {
        // Update author information
        const result = await poolpg.query(
            `UPDATE authors 
             SET authorName = $1, nickname = $2, dob = $3, dod = $4, customDob = $5, 
                 nationality = $6, biography = $7, awards = $8, x = $9, instagram = $10, 
                 facebook = $11, website = $12, genres = $13, image = $14 
             WHERE id = $15`,
            [authorName, nickname || null, dob, dod || null, customDob || null, nationality, biography, awards, x, instagram, facebook, website, genres, image, id]
        );

        // Fetch updated author data
        const authorResult = await poolpg.query(`
            SELECT a.*, 
              COUNT(DISTINCT s.id) AS "numSeries", 
              COUNT(DISTINCT b.id) AS "numBooks"
            FROM authors a
            LEFT JOIN series s ON s.author_id::text LIKE '%' || a.id::text || '%'
            LEFT JOIN books b ON b.author_id::text LIKE '%' || a.id::text || '%'
            WHERE a.id = $1
            GROUP BY a.id
        `, [id]);

        if (authorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Author not found after update' });
        }

        // Handle image URL if an image exists
        let url = null;
        if (authorResult.rows[0].image && authorResult.rows[0].image !== 'null') {
            url = await getImageURL(authorResult.rows[0].image);
        }
        authorResult.rows[0].imageURL = url;

        const updatedAuthor = authorResult.rows[0];

        // Emit event via socket if available
        if (req.io) {
            req.io.emit('authorsUpdated', updatedAuthor);
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
