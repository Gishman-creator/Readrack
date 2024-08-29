// controllers/genreController.js
const pool = require('../../config/db');

exports.getGenresController = async (req, res) => {
    const { tab } = req.query; // 'series' or 'authors'

    if (!tab) {
        return res.status(400).json({ message: 'Tab is required' });
    }

    let query;
    if (tab === 'Series') {
        query = 'SELECT genres FROM series';
    } else if (tab === 'Authors') {
        query = 'SELECT genres FROM authors';
    } else {
        return res.status(400).json({ message: 'Invalid tab value' });
    }

    try {
        const [rows] = await pool.query(query);
        
        // Combine and deduplicate genres
        const genresSet = new Set();
        rows.forEach(row => {
            if (row.genres) {
                row.genres.split(',').forEach(genre => {
                    genresSet.add(genre.trim()); // Remove extra whitespace
                });
            }
        });

        const uniqueGenres = Array.from(genresSet);
        res.json({ genres: uniqueGenres });
    } catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).json({ message: 'Error fetching genres' });
    }
};
