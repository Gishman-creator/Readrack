const poolpg = require('../../config/dbpg');
const { getImageURL } = require('../../utils/imageUtils');

exports.getAuthors = async (req, res) => {

  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10), 0) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10), 10) : null;
  const genre = req.query.genre ? req.query.genre.trim() : null; // Get genre from query params

  try {
    let dataQuery = `
      SELECT *
      FROM authors
    `;

    // Query to count total books
    let countQuery = `
    SELECT COUNT(*) AS "totalCount" 
    FROM authors
    `;

    let queryParams = [];
    let countQueryParams = [];

    if (genre && genre !== 'null') {
      dataQuery += ' WHERE genre ILIKE $1';
      countQuery += ' WHERE genre ILIKE $1';
      queryParams.push(`%${genre}%`);
      countQueryParams.push(`%${genre}%`);
    }
    
    dataQuery += ' ORDER BY search_count DESC';
    
    if (typeof limitStart === 'number' && typeof limitEnd === 'number') {
      dataQuery += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limitEnd - limitStart, limitStart);
    }
    
    const [dataRows] = await Promise.all([
      poolpg.query(dataQuery, queryParams)
    ]);
    
    const countResult = await poolpg.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].totalCount, 10);

    let url = null;

    for (const dataRow of dataRows.rows) {
      url = null;
      if (dataRow.image && dataRow.image !== 'null') {
        url = await getImageURL(dataRow.image);
      }
      dataRow.imageURL = url;
    }

    res.json({ data: dataRows.rows, totalCount });

  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).send('Error fetching authors');
  }
};

exports.getAuthorById = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 100;

  try {
    const result = await poolpg.query(`
      SELECT *
      FROM authors
      WHERE id = $1
      LIMIT $2
    `, [id, limit]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }

    let url = null;
    if (result.rows[0].image && result.rows[0].image !== 'null') {
      url = await getImageURL(result.rows[0].image);
    }
    result.rows[0].imageURL = url;

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).send('Error fetching author');
  }
};

exports.getAuthorsCount = async (req, res) => {
  try {
    const result = await poolpg.query(`
      SELECT COUNT(*) AS count
      FROM authors
    `);

    res.json({ count: result.rows[0].count });
  } catch (error) {
    console.error('Error fetching authors count:', error);
    res.status(500).send('Error fetching authors count');
  }
};
