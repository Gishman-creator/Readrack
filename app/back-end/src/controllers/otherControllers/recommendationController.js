const poolpg = require('../../config/dbpg');
const { getAuthorsByIds } = require('../../utils/getUtils');
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

    console.log('Genres', genres);

    if (!genres || genres.length === 0) {
        return res.status(400).json({ message: 'No genres provided' });
    }

    try {
        const userGenres = genres.split(',');
        console.log('userGenres', userGenres);

        const query = `
            SELECT a.*, 
              COUNT(DISTINCT s.id) AS "numSeries", 
              COUNT(DISTINCT b.id) AS "numBooks"
            FROM authors a
            LEFT JOIN series s ON s.author_id::TEXT LIKE CONCAT('%', a.id::TEXT, '%')
            LEFT JOIN books b ON b.author_id::TEXT LIKE CONCAT('%', a.id::TEXT, '%')
            WHERE (${userGenres.map((genre, index) => `s.genres::TEXT LIKE $${index + 1}`).join(' OR ')})
            AND a.id != $${userGenres.length + 1}
            GROUP BY a.id
            ORDER BY a."searchCount" DESC
            LIMIT 10;
        `;

        const genreParams = userGenres.map(genre => `%${genre.trim()}%`);
        genreParams.push(excludeId);

        console.log('Query:', query);
        console.log('Parameters:', genreParams);

        const { rows: results } = await poolpg.query(query, genreParams);

        for (const result of results) {
            let url = null;
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
            SELECT s.*
            FROM series s
            WHERE (${userGenres.map((genre, index) => `s.genres::TEXT LIKE $${index + 1}`).join(' OR ')})
            AND s.id != $${userGenres.length + 1}
            ORDER BY s."searchCount" DESC
            LIMIT 10;
        `;

        const genreParams = userGenres.map(genre => `%${genre.trim()}%`);
        genreParams.push(excludeId);

        const { rows: results } = await poolpg.query(query, genreParams);

        for (const result of results) {
            // Fetch authors for each result
            const authors = await getAuthorsByIds(result.author_id);
            result.authors = authors;

            let url = null;
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
