// src/controllers/catalogControllers/addCollectionsController.js

const pool = require('../../config/db');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { putImage, getImageURL } = require('../../utils/imageUtils');

// Function to generate a random ID
const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addCollections = async (req, res) => {
    const { collectionName, author_id, numBooks, genres, link } = req.body;
    
    const image = req.file ? await putImage('', req.file, 'collections') : null; // Await the function to resolve the promise
    // console.log('The image key for Amazon is:', image);

    try {
        let uniqueId;
        let isUnique = false;

        // Generate a unique ID
        while (!isUnique) {
            uniqueId = generateRandomId();

            // Check if the ID already exists
            const [rows] = await pool.query('SELECT id FROM collections WHERE id = ?', [uniqueId]);

            if (rows.length === 0) {
                isUnique = true;
            }
        }

        // Insert collections data into the database with the unique ID
        const [result] = await pool.query(
            'INSERT INTO collections (id, collectionName, author_id, numBooks, genres, link, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uniqueId, collectionName, author_id, numBooks, genres, link, image]
        );

        const [collectionData] = await pool.query(`
            SELECT 
                collections.*,
                YEAR(MIN(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS first_book_year,
                YEAR(MAX(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS last_book_year
            FROM collections
            LEFT JOIN books ON books.collection_id = collections.id
            WHERE collections.id = ?
            GROUP BY collections.id
            ORDER BY books.publishDate ASC;
            `, [uniqueId]
        );
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
            // console.log('Emitting added collections:', collectionData[0]);
        } else {
            // console.log('Socket.IO is not initialized.');
        }

        res.status(201).json({ message: 'Collections added successfully', collectionsId: uniqueId });
    } catch (error) {
        console.error('Error adding collections:', error);
        res.status(500).json({ error: 'Failed to add collections' });
    }
};

module.exports = { addCollections };
