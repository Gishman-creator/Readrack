// src/controllers/catalogControllers/addSeriesController.js

const poolpg = require('../../config/dbpg');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

// Function to generate a random ID
const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addSeries = async (req, res) => {
    const { serieName, author_id, numBooks, genres, link } = req.body;

    const image = req.file ? await putImage('', req.file, 'series') : null; // Await the function to resolve the promise

    try {
        let uniqueId;
        let isUnique = false;

        // Generate a unique ID
        while (!isUnique) {
            uniqueId = generateRandomId();

            // Check if the ID already exists in PostgreSQL
            const { rows } = await poolpg.query('SELECT id FROM series WHERE id = $1', [uniqueId]);

            if (rows.length === 0) {
                isUnique = true;
            }
        }

        // Insert series data into the database with the unique ID
        await poolpg.query(
            'INSERT INTO series (id, serieName, author_id, numBooks, genres, link, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [uniqueId, serieName, author_id, numBooks, genres, link, image]
        );

        const { rows: serieData } = await poolpg.query(`
            SELECT 
                series.*,
                EXTRACT(YEAR FROM MIN(COALESCE(books."publishDate", 
                                              -- Try converting customDate to a full date format
                                              CASE 
                                                WHEN books."customDate" ~* '^[0-9]{4}$' 
                                                THEN to_date(books."customDate", 'YYYY')  -- If only a year
                                                WHEN books."customDate" ~* '^[A-Za-z]+ [0-9]{4}$' 
                                                THEN to_date(books."customDate", 'Month YYYY')  -- If month and year
                                                ELSE NULL
                                              END))) AS first_book_year,
                EXTRACT(YEAR FROM MAX(COALESCE(books."publishDate", 
                                              CASE 
                                                WHEN books."customDate" ~* '^[0-9]{4}$' 
                                                THEN to_date(books."customDate", 'YYYY')
                                                WHEN books."customDate" ~* '^[A-Za-z]+ [0-9]{4}$' 
                                                THEN to_date(books."customDate", 'Month YYYY')
                                                ELSE NULL
                                              END))) AS last_book_year
            FROM series
            LEFT JOIN books ON books.serie_id = series.id
            WHERE series.id = $1
            GROUP BY series.id
            ORDER BY books.publishDate ASC;
        `, [uniqueId]);

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
        }

        res.status(201).json({ message: 'Series added successfully', seriesId: uniqueId });
    } catch (error) {
        console.error('Error adding series:', error);
        res.status(500).json({ error: 'Failed to add series' });
    }
};

module.exports = { addSeries };
