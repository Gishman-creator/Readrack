// src/controllers/catalogControllers/addSeriesController.js

const poolpg = require('../../config/dbpg');
const { fetchPublishYearsUtil } = require('../../utils/fetchPublishYearsUtil');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { generateUniqueId } = require('../../utils/idUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const addSeries = async (req, res) => {
    const { serie_name, author_id, num_books, genre, amazon_link } = req.body;

    const image = req.file ? await putImage('', req.file, 'series') : null; // Await the function to resolve the promise

    try {
        const uniqueId = await generateUniqueId('series', 6);

        // Insert series data into the database with the unique ID
        await poolpg.query(
            'INSERT INTO series (id, "serie_name", author_id, num_books, genre, amazon_link, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [uniqueId, serie_name, author_id, num_books, genre, amazon_link, image]
        );

        const { rows: serieData } = await poolpg.query(`
            SELECT 
            series.*,
            COUNT(DISTINCT books.id) AS "currentBooks"
            FROM series
            LEFT JOIN books ON books.serie_id::text = series.id::text
            WHERE series.id = $1
            GROUP BY series.id
            ORDER BY books.publish_date ASC;
        `, [uniqueId]);

        // Fetch authors for the serieData
        const authors = await getAuthorsByIds(serieData[0].author_id);
        serieData[0].authors = authors;

        // Use the utility function to fetch publish years
        const publishYears = await fetchPublishYearsUtil(serieData[0].id, 'serie');
    
        // Step 3: Find the first and last book years
        serieData[0].first_book_year = publishYears.length > 0 ? Math.min(...publishYears) : null;
        serieData[0].last_book_year = publishYears.length > 0 ? Math.max(...publishYears) : null;

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
