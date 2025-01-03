const poolpg = require('../../config/dbpg'); // Make sure this points to the pg poolpg configuration
const { putImage, getImageURL } = require('../../utils/imageUtils');

const updateAuthor = async (req, res) => {

    const { id } = req.params;

    const { author_name, dob, dod, nationality, biography, awards, x, instagram, facebook, website, genre, imageName } = req.body;

    const image = req.file ? await putImage(id, req.file, 'authors') : imageName;

    try {
        // Update author information
        const result = await poolpg.query(
            `UPDATE authors 
             SET author_name = $1, dob = $2, dod = $3, 
                 nationality = $4, biography = $5, awards = $6, x = $7, instagram = $8, 
                 facebook = $9, website = $10, genre = $11, image = $12 
             WHERE id = $13`,
            [author_name, dob, dod || null, nationality, biography, awards, x, instagram, facebook, website, genre, image, id]
        );

        // Fetch updated author data
        const authorResult = await poolpg.query(`
            SELECT *
            FROM authors
            WHERE id = $1
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
