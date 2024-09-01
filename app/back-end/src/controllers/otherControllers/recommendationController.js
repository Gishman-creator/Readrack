const pool = require('../../config/db');

/**
 * Get recommended authors based on the genres provided by the user.
 * @param {Array} userGenres - An array of genres that the user prefers.
 * @returns {Array} - An array of recommended authors sorted by searchCount.
 */
exports.recommendAuthors = async (req, res) => {
    const { data } = req.query;
    const genres = data.genres;
    const excludeId = data.id;

    if (!genres || genres.length === 0) {
        return res.status(400).json({ message: 'No genres provided' });
    }

    try {
        const userGenres = genres.split(',');

        const query = `
            SELECT * FROM authors 
            WHERE ${userGenres.map(() => `genres LIKE ?`).join(' OR ')}
            AND id != ?
            ORDER BY searchCount DESC 
            LIMIT 10;
        `;

        const genreParams = userGenres.map(genre => `%${genre.trim()}%`);
        genreParams.push(excludeId);

        const [results] = await pool.query(query, genreParams);

        res.json(results);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return res.status(500).json({ message: 'Error fetching recommendations' });
    }
}

exports.recommendSeries = async (req, res) => {
    const { data } = req.query;
    const genres = data.genres;
    const excludeId = data.id;

    if (!genres || genres.length === 0) {
        return res.status(400).json({ message: 'No genres provided' });
    }

    try {
        const userGenres = genres.split(',');

        const query = `
            SELECT series.*, authors.nickname, authors.authorName AS author_name
            FROM series
            LEFT JOIN authors ON series.author_id = authors.id
            WHERE ${userGenres.map(() => `series.genres LIKE ?`).join(' OR ')}
            AND series.id != ?
            ORDER BY series.searchCount DESC
            LIMIT 10;
        `;

        const genreParams = userGenres.map(genre => `%${genre.trim()}%`);
        genreParams.push(excludeId);

        const [results] = await pool.query(query, genreParams);

        res.json(results);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return res.status(500).json({ message: 'Error fetching recommendations' });
    }
}
