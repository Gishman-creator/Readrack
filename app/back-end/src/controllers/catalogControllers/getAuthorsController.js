const pool = require('../../config/db');
const { getImageURL } = require('../../utils/imageUtils')

exports.getAuthors = async (req, res) => {

  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10)) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10)) : null;
  const genre = req.query.genre ? req.query.genre.trim() : null; // Get genre from query params

  console.log('The limitStart is:', limitStart);
  console.log('The limitEnd is:', limitEnd);
  console.log('The genre is:', genre);

  try {
    // Base queries for fetching authors and counting total
    let dataQuery = `
      SELECT a.*, 
        COUNT(DISTINCT s.id) AS numSeries, 
        COUNT(DISTINCT b.id) AS numBooks
      FROM authors a
      LEFT JOIN series s ON a.id = s.author_id
      LEFT JOIN books b ON a.id = b.author_id
    `;
    let countQuery = 'SELECT COUNT(*) AS totalCount FROM authors a';
    let queryParams = [];

    // Add genre filter to the queries if genre is provided and is not null or empty
    if (genre && genre !== 'null') {
      dataQuery += ' WHERE a.genres LIKE ?';
      countQuery += ' WHERE a.genres LIKE ?';
      queryParams.push(`%${genre}%`);
    }

    // Add GROUP BY after WHERE
    dataQuery += ' GROUP BY a.id';

    // Now add the ORDER BY clause after the WHERE clause
    dataQuery += ' order by searchCount desc';

    // Add limit clause to the data query
    if (typeof limitStart === 'number' && typeof limitEnd === 'number') {
      dataQuery += ' LIMIT ?, ?';
      queryParams.push(limitStart, limitEnd - limitStart);
    }

    // Execute both queries in parallel
    const [dataRows] = await pool.query(dataQuery, queryParams);
    const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

    let url = null;
    for (const dataRow of dataRows) {
      url = null;
      if (dataRow.image) {
        url = await getImageURL(dataRow.image);
      }
      dataRow.imageURL = url;
    }

    // Send both data and total count in the response
    res.json({ data: dataRows, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).send('Error fetching authors');
  }
};

exports.getAuthorById = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 100; // Get limit from query params, default to 100

  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
        COUNT(DISTINCT s.id) AS numSeries, 
        COUNT(DISTINCT b.id) AS numBooks
      FROM authors a
      LEFT JOIN series s ON a.id = s.author_id
      LEFT JOIN books b ON a.id = b.author_id
      WHERE a.id = ?
      GROUP BY a.id
      LIMIT ?
    `, [id, limit]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }

    let url = null;
    if (rows[0].image) {
      url = await getImageURL(rows[0].image);
    }
    rows[0].imageURL = url;

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).send('Error fetching author');
  }
};

exports.getAuthorsCount = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS count
      FROM authors
    `);

    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching authors count:', error);
    res.status(500).send('Error fetching authors count');
  }
};
