// src/controllers/catalogControllers/addSeriesController.js

const pool = require('../../config/db');
const { putImage, getImageURL } = require('../../utils/imageUtils');

// Function to generate a random ID
const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addSeries = async (req, res) => {
    const { serieName, author_id, numBooks, genres, link } = req.body;

    const image = req.file ? await putImage('', req.file, 'series') : null; // Await the function to resolve the promise
    // console.log('The image key for Amazon is:', image);

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
            SELECT 
                series.*,
                YEAR(MIN(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS first_book_year,
                YEAR(MAX(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS last_book_year
            FROM series
            LEFT JOIN books ON books.serie_id = series.id
            WHERE series.id = ?
            GROUP BY series.id
            ORDER BY books.publishDate ASC;
            `, [uniqueId]
        );

        // Fetch authors for the serieData
        const authors = await getAuthorsByIds(serieData[0].author_id);
        serieData[0].authors = authors;

        let url = null;
        if (serieData[0].image && serieData[0].image !== 'null') {
          url = await getImageURL(serieData[0].image);
        }
        serieData[0].imageURL = url;

        // Emit the newly added series data if Socket.IO is initialized
        if (req.io) {
            req.io.emit('serieAdded', serieData[0]);  // Emit the full series data
            // console.log('Emitting added series:', serieData[0]);
        } else {
            // console.log('Socket.IO is not initialized.');
        }

        res.status(201).json({ message: 'Series added successfully', seriesId: uniqueId });
    } catch (error) {
        console.error('Error adding series:', error);
        res.status(500).json({ error: 'Failed to add series' });
    }
};

module.exports = { addSeries };
