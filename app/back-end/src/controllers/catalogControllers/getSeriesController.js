const poolpg = require('../../config/dbpg'); // Ensure this is the PostgreSQL poolpg configuration
const { fetchPublishYearsUtil } = require('../../utils/fetchPublishYearsUtil');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { getImageURL } = require('../../utils/imageUtils');

exports.getSeries = async (req, res) => {
  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10)) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10)) : null;
  const genre = req.query.genre ? req.query.genre.trim() : null;

  try {
    let dataQuery = `
      SELECT series.* ,
      COUNT(DISTINCT books.id) AS "currentBooks"
      FROM series
      LEFT JOIN books ON books.serie_id::text = series.id::text
    `;

    // Query to count total books
    let countQuery = `
    SELECT COUNT(*) AS "totalCount" 
    FROM series
    `;

    const queryParams = [];
    const countQueryParams = [];

    if (genre && genre !== 'null') {
      dataQuery += ' WHERE series.genre ILIKE $1';
      countQuery += ' WHERE series.genre ILIKE $1';
      queryParams.push(`%${genre}%`);
      countQueryParams.push(`%${genre}%`);
    }

    dataQuery += ' GROUP BY series.id ORDER BY series.search_count DESC';

    if (typeof limitStart === 'number' && typeof limitEnd === 'number') {
      dataQuery += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limitEnd - limitStart); // For LIMIT
      queryParams.push(limitStart); // For OFFSET
    }

    const results = await poolpg.query(dataQuery, queryParams);
    const dataRows = results.rows;

    const countResult = await poolpg.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].totalCount, 10);

    for (const dataRow of dataRows) {
      const authors = await getAuthorsByIds(dataRow.author_id);
      dataRow.authors = authors;

      dataRow.imageURL = dataRow.image && dataRow.image !== 'null' ? await getImageURL(dataRow.image) : null;
    }

    res.json({ data: dataRows, totalCount });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).send('Error fetching series');
  }
};

exports.getSerieById = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 100;

  try {
    const { rows: seriesRows } = await poolpg.query(`
      SELECT series.*
      FROM series
      WHERE series.id = $1
      LIMIT $2
    `, [id, limit]);

    if (seriesRows.length === 0) {
      return res.status(404).json({ message: 'Serie not found' });
    }

    const authors = await getAuthorsByIds(seriesRows[0].author_id);
    seriesRows[0].authors = authors;
    seriesRows[0].imageURL = seriesRows[0].image && seriesRows[0].image !== 'null' ? await getImageURL(seriesRows[0].image) : null;

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
    const likePattern = `%${author_id}%`;

    // Step 1: Get the series for the specified author
    let seriesQuery = `
      SELECT series.*,
      COUNT(DISTINCT books.id) AS "currentBooks"
      FROM series
      LEFT JOIN books ON books.serie_id::text = series.id::text
      WHERE series.author_id::text ILIKE '%' || $1::text || '%'
      GROUP BY series.id
    `;

    const queryParams = [likePattern];

    if (limit) {
      seriesQuery += ` LIMIT $2`;
      queryParams.push(limit);
    }

    const results = await poolpg.query(seriesQuery, queryParams);
    const series = results.rows;

    // Step 2: Loop through each series to get publication years
    for (const serie of series) {
      // Use the utility function to fetch publish years
      const publishYears = await fetchPublishYearsUtil(serie.id, 'serie');

      // Step 3: Find the first and last book years
      serie.first_book_year = publishYears.length > 0 ? Math.min(...publishYears) : null;
      serie.last_book_year = publishYears.length > 0 ? Math.max(...publishYears) : null;

      // Step 4: Add authors and image URL to each series
      const authors = await getAuthorsByIds(serie.author_id);
      serie.authors = authors;
      serie.imageURL = serie.image && serie.image !== 'null' ? await getImageURL(serie.image) : null;
    }

    res.json({ series });
  } catch (error) {
    console.error('Error fetching series by author ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSeriesCount = async (req, res) => {
  try {
    const { rows } = await poolpg.query('SELECT COUNT(*) AS count FROM series');
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching series count:', error);
    res.status(500).send('Error fetching series count');
  }
};
