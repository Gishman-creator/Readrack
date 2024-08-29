// recommendationController.js
const pool = require('../../config/db'); // Assuming your db.js is in the config folder

/**
 * Get recommended series based on the genres provided by the user.
 * @param {Array} userGenres - An array of genres that the user prefers.
 * @returns {Array} - An array of recommended series sorted by searchCount.
 */
exports.recommendAuthors = async (req, res) => {
    const { genres } = req.query;

    if (!genres || genres.length === 0) {
        return res.status(400).json({ message: 'No genres provided' });
    }

    try {
        // Convert the user genres to an array
        const userGenres = genres.split(',');

        // SQL query to match series genres and order by searchCount
        const query = `
            SELECT * FROM authors 
            WHERE ${userGenres.map(() => `genres LIKE ?`).join(' OR ')}
            ORDER BY searchCount DESC 
            LIMIT 10;
        `;

        // Map the genres to match SQL wildcards
        const genreParams = userGenres.map(genre => `%${genre.trim()}%`);

        // Execute the query
        const [results] = await pool.query(query, genreParams);

        res.json(results);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return res.status(500).json({ message: 'Error fetching recommendations' });
    }
}


exports.recommendSeries = async (req, res) => {
    const { genres } = req.query;

    if (!genres || genres.length === 0) {
        return res.status(400).json({ message: 'No genres provided' });
    }

    try {
        // Convert the user genres to an array
        const userGenres = genres.split(',');

        // SQL query to match series genres and order by searchCount
        const query = `
            SELECT * FROM series 
            WHERE ${userGenres.map(() => `genres LIKE ?`).join(' OR ')}
            ORDER BY searchCount DESC 
            LIMIT 10;
        `;

        // Map the genres to match SQL wildcards
        const genreParams = userGenres.map(genre => `%${genre.trim()}%`);

        // Execute the query
        const [results] = await pool.query(query, genreParams);

        res.json(results);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return res.status(500).json({ message: 'Error fetching recommendations' });
    }
}

