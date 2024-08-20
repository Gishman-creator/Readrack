// controllers/getSeriesController.js
const pool = require('../../config/db'); // Ensure your database connection pool is correctly imported

exports.getSeries = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM series
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).send('Error fetching series');
  }
};

exports.getSerieById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM series WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Serie not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching serie:', error);
    res.status(500).send('Error fetching serie');
  }
};
