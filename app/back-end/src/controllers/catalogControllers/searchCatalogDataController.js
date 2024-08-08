// src/controllers/catalogControllers/getCatalogDataController.js

const pool = require('../../config/db');

// Fetch available authors with optional search query
const searchAuthors = async (req, res) => {
  const search = req.query.search || '';
  try {
    const [rows] = await pool.execute('SELECT name FROM authors WHERE name LIKE ?', [`%${search}%`]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Failed to fetch authors' });
  }
};

// Fetch available series with optional search query
const searchSeries = async (req, res) => {
  const search = req.query.search || '';
  try {
    const [rows] = await pool.execute('SELECT name FROM series WHERE name LIKE ?', [`%${search}%`]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
};

module.exports = {
  searchAuthors,
  searchSeries,
};
