// src/controllers/catalogControllers/addCollectionsController.js

const pool = require('../../config/db');

// Function to generate a random ID
const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addCollections = async (req, res) => {
    const { collectionName, author_id, numBooks, genres, link } = req.body;
    const image = req.file ? req.file.buffer : null; // Get image from request

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
            SELECT collections.*, authors.nickname, authors.authorName AS author_name
            FROM collections
            LEFT JOIN authors ON collections.author_id = authors.id
            WHERE collections.id = ?
            `, [uniqueId]
        );

        // Fetch the first book's name and date for each collections
        for (let i = 0; i < collectionData.length; i++) {
            const [firstBook] = await pool.query(`
                SELECT bookName, publishDate
                FROM books
                WHERE collection_id = ?
                ORDER BY publishDate ASC
                LIMIT 1
            `, [collectionData[i].id]);

            // Embed the first book's name and date into the collections result
            collectionData[i].firstBook = firstBook.length > 0 ? firstBook[0] : null;
        }

        // Emit the newly added collections data if Socket.IO is initialized
        if (req.io) {
            req.io.emit('collectionAdded', collectionData[0]);  // Emit the full collections data
            console.log('Emitting added collections:', collectionData[0]);
        } else {
            console.log('Socket.IO is not initialized.');
        }

        res.status(201).json({ message: 'Collections added successfully', collectionsId: uniqueId });
    } catch (error) {
        console.error('Error adding collections:', error);
        res.status(500).json({ error: 'Failed to add collections' });
    }
};

module.exports = { addCollections };
