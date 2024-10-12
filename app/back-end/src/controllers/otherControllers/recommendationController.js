const poolpg = require('../../config/dbpg');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { getImageURL } = require('../../utils/imageUtils');

/**
 * Get recommended authors based on the genres provided by the user.
 * @param {Array} userGenres - An array of genres that the user prefers.
 * @returns {Array} - An array of recommended authors sorted by searchCount.
 */

const mapGenresToGlobalGenres = (userGenres, globalGenres) => {
    return userGenres.map(userGenre => {
        // Remove leading/trailing spaces and convert to lowercase for comparison
        const trimmedUserGenre = userGenre.trim().toLowerCase();

        // Find a match in globalGenres, checking if any global genre contains the user genre as a substring
        const matchedGenre = globalGenres.find(globalGenre => {
            return globalGenre.toLowerCase().includes(trimmedUserGenre) || trimmedUserGenre.includes(globalGenre.toLowerCase());
        });

        // If a match is found, return the global genre, otherwise return the original user genre
        return matchedGenre || trimmedUserGenre;
    });
};

const globalGenres = [
    "Fiction", "Biography", "Autobiography", "Memoir", "History", "Science", "Technology",
    "Self-Help", "Business", "Cookbooks", "Travelogues", "Essays", "Poetry", "Humor",
    "Fantasy", "Mystery", "Thriller", "Romance", "Horror", "Adventure", "Young Adult",
    "Children's", "Drama", "Action and Adventure", "Science Fiction", "Classic", "Graphic Novel",
    "Crime", "Western", "Satire", "Tragedy", "Philosophy", "Religion", "Spirituality", "Political",
    "Anthology", "Art", "Music", "Sports", "Fitness", "Health", "Psychology", "Parenting",
    "Education", "Reference", "Encyclopedia", "Dictionary", "Comics", "Magazine", "Journal", "Periodical"
];

exports.recommendAuthors = async (req, res) => {
    const data = req.body.data;
    const genres = data.genres;
    const excludeId = data.id;

    if (!genres || genres.length === 0) {
        return res.status(400).json({ message: 'No genres provided' });
    }

    try {
        // Split genres and map to global genres
        const userGenres = genres.split(',');
        const mappedGenres = mapGenresToGlobalGenres(userGenres, globalGenres);
        console.log('Mapped Genres', mappedGenres);

        const query = `
            SELECT a.*, 
              COUNT(DISTINCT s.id) AS "numSeries", 
              COUNT(DISTINCT b.id) AS "numBooks"
            FROM authors a
            LEFT JOIN series s ON s.author_id::TEXT ILIKE CONCAT('%', a.id::TEXT, '%')
            LEFT JOIN books b ON b.author_id::TEXT ILIKE CONCAT('%', a.id::TEXT, '%')
            WHERE (${mappedGenres.map((genre, index) => `s.genres::TEXT ILIKE $${index + 1}`).join(' OR ')})
            AND a.id != $${mappedGenres.length + 1}
            GROUP BY a.id
            ORDER BY a."searchCount" DESC
            LIMIT 10;
        `;

        const genreParams = mappedGenres.map(genre => `%${genre.trim()}%`);
        genreParams.push(excludeId);

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
};

exports.recommendSeries = async (req, res) => {
    const { data } = req.body;
    const genres = data.genres;
    const excludeId = data.id;

    if (!genres || genres.length === 0) {
        return res.status(400).json({ message: 'No genres provided' });
    }

    try {
        const userGenres = genres.split(',');
        const mappedGenres = mapGenresToGlobalGenres(userGenres, globalGenres);

        const query = `
            SELECT s.*
            FROM series s
            WHERE (${mappedGenres.map((genre, index) => `s.genres::TEXT ILIKE $${index + 1}`).join(' OR ')})
            AND s.id != $${mappedGenres.length + 1}
            ORDER BY s."searchCount" DESC
            LIMIT 10;
        `;

        const genreParams = mappedGenres.map(genre => `%${genre.trim()}%`);
        genreParams.push(excludeId);

        const { rows: results } = await poolpg.query(query, genreParams);

        for (const result of results) {
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
};
