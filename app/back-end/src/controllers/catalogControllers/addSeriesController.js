// src/controllers/catalogControllers/addSeriesController.js

const pool = require('../../config/db');

const addSeries = async (req, res) => {
    const { serieName, authorName, numBooks, genres, link } = req.body;
    const image = req.file ? req.file.buffer : null; // Get image from request

    try {
        const [result] = await pool.query(
            'INSERT INTO series (name, author_name, booksNo, genres, link, image) VALUES (?, ?, ?, ?, ?, ?)',
            [serieName, authorName, numBooks, genres, link, image]
        );
        res.status(201).json({ message: 'Series added successfully', seriesId: result.insertId });
    } catch (error) {
        console.error('Error adding series:', error);
        res.status(500).json({ error: 'Failed to add series' });
    }
};

module.exports = { addSeries };
