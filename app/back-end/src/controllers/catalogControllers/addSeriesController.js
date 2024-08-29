// src/controllers/catalogControllers/addSeriesController.js

const pool = require('../../config/db');

// Function to generate a random ID
const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addSeries = async (req, res) => {
    const { serieName, author_id, numBooks, genres, link } = req.body;
    const image = req.file ? req.file.buffer : null; // Get image from request

    try {
        let uniqueId;
        let isUnique = false;

        // Generate a unique ID
        while (!isUnique) {
            uniqueId = generateRandomId();

            // Check if the ID already exists
            const [rows] = await pool.query('SELECT id FROM series WHERE id = ?', [uniqueId]);

            if (rows.length === 0) {
                isUnique = true;
            }
        }

        // Insert series data into the database with the unique ID
        const [result] = await pool.query(
            'INSERT INTO series (id, serieName, author_id, numBooks, genres, link, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uniqueId, serieName, author_id, numBooks, genres, link, image]
        );

        const [serieData] = await pool.query(`
            SELECT series.*, author.nickname, authors.authorName AS author_name
            FROM series
            LEFT JOIN authors ON series.author_id = authors.id
            WHERE series.id = ?
            `, [uniqueId]
        );

        // Fetch the first book's name and date for each series
        for (let i = 0; i < serieData.length; i++) {
            const [firstBook] = await pool.query(`
                SELECT bookName, publishDate
                FROM books
                WHERE serie_id = ?
                ORDER BY publishDate ASC
                LIMIT 1
            `, [serieData[i].id]);

            // Embed the first book's name and date into the series result
            serieData[i].firstBook = firstBook.length > 0 ? firstBook[0] : null;
        }

        // Emit the newly added series data if Socket.IO is initialized
        if (req.io) {
            req.io.emit('serieAdded', serieData[0]);  // Emit the full series data
            console.log('Emitting added series:', serieData[0]);
        } else {
            console.log('Socket.IO is not initialized.');
        }

        res.status(201).json({ message: 'Series added successfully', seriesId: uniqueId });
    } catch (error) {
        console.error('Error adding series:', error);
        res.status(500).json({ error: 'Failed to add series' });
    }
};

module.exports = { addSeries };
