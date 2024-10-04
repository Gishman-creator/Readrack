// controllers/genreController.js
const poolpg = require('../../config/dbpg');

const genres = [
    "Fiction", "Biography", "Autobiography", "Memoir", "History", "Science", "Technology",
    "Self-Help", "Business", "Cookbooks", "Travelogues", "Essays", "Poetry", "Humor",
    "Fantasy", "Mystery", "Thriller", "Romance", "Horror", "Adventure", "Young Adult",
    "Children's", "Drama", "Action and Adventure", "Science Fiction", "Classic", "Graphic Novel",
    "Crime", "Western", "Satire", "Tragedy", "Philosophy", "Religion", "Spirituality", "Political",
    "Anthology", "Art", "Music", "Sports", "Fitness", "Health", "Psychology", "Parenting",
    "Education", "Reference", "Encyclopedia", "Dictionary", "Comics", "Magazine", "Journal", "Periodical"
];

exports.getGenresController = async (req, res) => {
    const { tab } = req.query; // 'series' or 'authors'

    if (!tab) {
        return res.status(400).json({ message: 'Tab is required' });
    }

    let tableName;
    if (tab === 'Series') {
        tableName = 'series';
    } else if (tab === 'Authors') {
        tableName = 'authors';
    } else {
        return res.status(400).json({ message: 'Invalid tab value' });
    }

    try {
        // Construct the query with ILIKE for PostgreSQL and array of placeholders
        const query = `
            SELECT genres
            FROM ${tableName}
            WHERE ${genres.map((_, index) => `genres ILIKE $${index + 1}`).join(' OR ')}
        `;

        // Generate the parameters for the ILIKE clauses
        const params = genres.map(genre => `%${genre}%`);

        const result = await poolpg.query(query, params);

        // Initialize a set to track matched genres
        const genresWithResults = new Set();

        // Iterate over each row and match genres with flexible comparison
        result.rows.forEach(row => {
            const rowGenres = row.genres.split(',').map(g => g.trim().toLowerCase()); // Normalize and split
            genres.forEach(genre => {
                if (rowGenres.some(rg => rg.includes(genre.toLowerCase()))) {
                    genresWithResults.add(genre); // Add the genre if any part of it matches
                }
            });
        });

        res.json({ genres: Array.from(genresWithResults) });
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ message: 'Error fetching genres' });
    }
};
