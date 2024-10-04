// src/controllers/catalogControllers/addCollectionsController.js

const poolpg = require('../../config/dbpg');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

// Function to generate a random ID
const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addCollections = async (req, res) => {
    const { collectionName, author_id, numBooks, genres, link } = req.body;
    
    const image = req.file ? await putImage('', req.file, 'collections') : null; // Await the function to resolve the promise

    try {
        let uniqueId;
        let isUnique = false;

        // Generate a unique ID
        while (!isUnique) {
            uniqueId = generateRandomId();

            // Check if the ID already exists in PostgreSQL
            const { rows } = await poolpg.query('SELECT id FROM collections WHERE id = $1', [uniqueId]);

            if (rows.length === 0) {
                isUnique = true;
            }
        }

        // Insert collections data into the database with the unique ID
        await poolpg.query(
            'INSERT INTO collections (id, collectionName, author_id, numBooks, genres, link, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [uniqueId, collectionName, author_id, numBooks, genres, link, image]
        );

        const { rows: collectionData } = await poolpg.query(`
            SELECT 
             collections.*,
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
                                           END))) AS last_book_year,
             COUNT(DISTINCT books.id) AS "numBooks"
            FROM collections
            LEFT JOIN books ON books.collection_id = collections.id
            WHERE collections.id = $1
            GROUP BY collections.id
            ORDER BY books.publishDate ASC;
        `, [uniqueId]);

        // Fetch authors for the collectionData
        const authors = await getAuthorsByIds(collectionData[0].author_id);
        collectionData[0].authors = authors;

        let url = null;
        if (collectionData[0].image && collectionData[0].image !== 'null') {
            url = await getImageURL(collectionData[0].image);
        }
        collectionData[0].imageURL = url;

        // Emit the newly added collections data if Socket.IO is initialized
        if (req.io) {
            req.io.emit('collectionAdded', collectionData[0]);  // Emit the full collections data
        }

        res.status(201).json({ message: 'Collections added successfully', collectionsId: uniqueId });
    } catch (error) {
        console.error('Error adding collections:', error);
        res.status(500).json({ error: 'Failed to add collections' });
    }
};

module.exports = { addCollections };
