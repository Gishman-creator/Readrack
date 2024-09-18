const pool = require('../../config/db');
const { getImageURL } = require('../../utils/imageUtils');

/**
 * Get recommended authors based on the genres provided by the user.
 * @param {Array} userGenres - An array of genres that the user prefers.
 * @returns {Array} - An array of recommended authors sorted by searchCount.
 */
exports.recommendAuthors = async (req, res) => {
    const data = req.body.data;
    const genres = data.genres;
    const excludeId = data.id;

    if (!genres || genres.length === 0) {
        return res.status(400).json({ message: 'No genres provided' });
    }

    try {
        const userGenres = genres.split(',');

        const query = `
            SELECT a.*, 
              COUNT(DISTINCT s.id) AS numSeries, 
              COUNT(DISTINCT b.id) AS numBooks
            FROM authors a
            LEFT JOIN series s ON a.id = s.author_id
            LEFT JOIN books b ON FIND_IN_SET(a.id, b.author_id) > 0
            WHERE (${userGenres.map(() => `a.genres LIKE ?`).join(' OR ')})
            AND a.id != ?
            GROUP BY a.id
            ORDER BY searchCount DESC 
            LIMIT 10;
        `;

        const genreParams = userGenres.map(genre => `%${genre.trim()}%`);
        genreParams.push(excludeId);

        const [results] = await pool.query(query, genreParams);

        let url = null;
        for (const result of results) {
          url = null;
          if (result.image) {
            url = await getImageURL(result.image);
          }
          result.imageURL = url;
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return res.status(500).json({ message: 'Error fetching recommendations' });
    }
}

exports.recommendSeries = async (req, res) => {
    const { data } = req.body;
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
            WHERE (${userGenres.map(() => `series.genres LIKE ?`).join(' OR ')})
            AND series.id != ?
            ORDER BY series.searchCount DESC
            LIMIT 10;
        `;

        const genreParams = userGenres.map(genre => `%${genre.trim()}%`);
        genreParams.push(excludeId);

        const [results] = await pool.query(query, genreParams);

        let url = null;
        for (const result of results) {
          url = null;
          if (result.image) {
            url = await getImageURL(result.image);
          }
          result.imageURL = url;
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return res.status(500).json({ message: 'Error fetching recommendations' });
    }
}
