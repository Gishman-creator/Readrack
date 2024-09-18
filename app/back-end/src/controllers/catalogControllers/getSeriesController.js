const pool = require('../../config/db');
const { getImageURL } = require('../../utils/imageUtils');

exports.getSeries = async (req, res) => {

  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10)) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10)) : null;
  const genre = req.query.genre ? req.query.genre.trim() : null; // Get genre from query params

  try {
    // Base query for fetching series with genre filter if applicable
    let dataQuery = `
      SELECT series.*, authors.nickname, authors.authorName AS author_name
      FROM series
      LEFT JOIN authors ON series.author_id = authors.id
    `;
    let countQuery = 'SELECT COUNT(*) AS totalCount FROM series';
    let queryParams = [];

    // Add genre filter to the queries if genre is provided and is not null or empty
    if (genre && genre !== 'null') {
      dataQuery += ' WHERE series.genres LIKE ?';
      countQuery += ' WHERE genres LIKE ?';
      queryParams.push(`%${genre}%`);
    }

    // Now add the ORDER BY clause after the WHERE clause
    dataQuery += ' ORDER BY series.searchCount DESC';

    // Add limit clause to the data query
    if (typeof limitStart === 'number' && typeof limitEnd === 'number') {
      dataQuery += ' LIMIT ?, ?';
      queryParams.push(limitStart, limitEnd - limitStart);
    }

    // Execute the queries in parallel
    const [dataRows] = await pool.query(dataQuery, queryParams);
    const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

    let url = null;
    for (const dataRow of dataRows) {
      url = null;
      if (dataRow.image && dataRow.image !== 'null') {
        url = await getImageURL(dataRow.image);
      }
      dataRow.imageURL = url;
    }

    // Send both data and total count in the response
    res.json({ data: dataRows, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).send('Error fetching series');
  }
};

exports.getSerieById = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 100; // Get limit from query params, default to 100

  try {
    // Query to retrieve the series information with author name
    const [seriesRows] = await pool.query(`
      SELECT series.*, authors.nickname, authors.authorName AS author_name
      FROM series
      LEFT JOIN authors ON series.author_id = authors.id
      WHERE series.id = ?
      LIMIT ?
    `, [id, limit]);

    if (seriesRows.length === 0) {
      return res.status(404).json({ message: 'Serie not found' });
    }

    let url = null;
    if (seriesRows[0].image && seriesRows[0].image !== 'null') {
      url = await getImageURL(seriesRows[0].image);
    }
    seriesRows[0].imageURL = url;

    res.json(seriesRows[0]);
  } catch (error) {
    console.error('Error fetching serie:', error);
    res.status(500).send('Error fetching serie');
  }
};

exports.getSeriesByAuthorId = async (req, res) => {
  const { author_id } = req.params;
  const limit = parseInt(req.query.limit, 10) || null;

  try {
    // Query for fetching series by author_id with author_name, first and last book dates
    let seriesQuery = `
      SELECT series.*, 
             authors.nickname, 
             authors.authorName AS author_name,
             YEAR(MIN(books.publishDate)) AS first_book_year,
             YEAR(MAX(books.publishDate)) AS last_book_year
      FROM series
      LEFT JOIN authors ON series.author_id = authors.id
      LEFT JOIN books ON books.serie_id = series.id
      WHERE series.author_id = ?
      GROUP BY series.id, authors.nickname, authors.authorName
    `;
    let countQuery = 'SELECT COUNT(*) AS totalCount FROM series WHERE author_id = ?';

    // Append LIMIT clause if a limit is provided
    const queryParams = [author_id];
    if (limit) {
      seriesQuery += ` LIMIT ?`;
      queryParams.push(limit);
    }

    // Execute the series query
    const [series] = await pool.query(seriesQuery, queryParams);
    const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

    let url = null;
    for (const serie of series) {
      url = null;
      if (serie.image && serie.image !== 'null') {
        url = await getImageURL(serie.image);
      }
      serie.imageURL = url;
    }

    res.json({ series: series, totalCount: totalCount });
  } catch (error) {
    console.error("Error fetching series by author ID:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getSeriesCount = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS count
      FROM series
    `);

    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching series count:', error);
    res.status(500).send('Error fetching series count');
  }
};
