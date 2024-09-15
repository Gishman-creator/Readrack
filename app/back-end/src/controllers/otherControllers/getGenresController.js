// controllers/genreController.js
const pool = require('../../config/db');

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

    let query;
    if (tab === 'Series') {
        query = 'SELECT COUNT(*) as count FROM series WHERE genres LIKE ?';
    } else if (tab === 'Authors') {
        query = 'SELECT COUNT(*) as count FROM authors WHERE genres LIKE ?';
    } else {
        return res.status(400).json({ message: 'Invalid tab value' });
    }

    try {
        const genresWithResults = [];

        // Loop through each genre and execute the query
        for (let genre of genres) {
            const [rows] = await pool.query(query, [`%${genre}%`]);

            if (rows[0].count > 0) {
                genresWithResults.push(genre); // Only add genre if rows found
            }
        }

        res.json({ genres: genresWithResults });
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ message: 'Error fetching genres' });
    }
};
