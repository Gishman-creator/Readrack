const pool = require('../../config/db');

exports.getBooks = async (req, res) => {

  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10)) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10)) : null;

  try {
    // Get the total count of books
    const [countResult] = await pool.query('SELECT COUNT(*) AS total FROM books');
    const totalCount = countResult[0].total;

    // Fetch books with pagination and join with authors and series to get their names
    let dataQuery = `
      SELECT books.*, authors.nickname, authors.authorName AS author_name, series.serieName AS serie_name
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN series ON books.serie_id = series.id
    `;
    const queryParams = [];

    // Add LIMIT clause if both limitStart and limitEnd are defined
    if (typeof limitStart === 'number' && typeof limitEnd === 'number') {
      dataQuery += ' LIMIT ?, ?';
      queryParams.push(limitStart, limitEnd - limitStart);
    }

    const [rows] = await pool.query(dataQuery, queryParams);

    // Return both the total count and the paginated books
    res.json({ data: rows, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Error fetching books');
  }
};


exports.getBookById = async (req, res) => {
  const { id } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

  try {
    // Fetch a specific book by ID and join with authors and series to get their names
    let query = `
      SELECT books.*, authors.nickname, authors.authorName AS author_name, series.serieName AS serie_name
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN series ON books.serie_id = series.id
      WHERE books.id = ?
    `;
    const queryParams = [id];

    if (limit) {
      query += ' LIMIT ?';
      queryParams.push(limit);
    }

    const [rows] = await pool.query(query, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).send('Error fetching book');
  }
};

exports.getBooksBySerieId = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  let { serie_id } = req.params;

  try {
    // Fetch books by serie_id and join with authors and series to get their names
    let query = `
      SELECT books.*, authors.nickname, authors.authorName AS author_name, series.serieName AS serie_name
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN series ON books.serie_id = series.id
      WHERE books.serie_id = ?
      ORDER BY books.date ASC
    `;
    let countQuery = `
      SELECT COUNT(*) AS totalCount 
      FROM books 
      WHERE serie_id = ?
    `;
    const queryParams = [serie_id];

    if (limit) {
      query += ' LIMIT ?';
      queryParams.push(limit);
    }

    const [books] = await pool.query(query, queryParams);
    const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

    res.json({ books: books, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books by series:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBooksByAuthorId = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  let { author_id } = req.params;

  try {
    // Fetch books by author_id and join with authors and series to get their names
    let query = `
      SELECT books.*, authors.nickname, authors.authorName AS author_name, series.serieName AS serie_name
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN series ON books.serie_id = series.id
      WHERE books.author_id = ?
      ORDER BY books.date ASC
    `;
    let countQuery = `
      SELECT COUNT(*) AS totalCount 
      FROM books 
      WHERE author_id = ?
    `;
    const queryParams = [author_id];

    if (limit) {
      query += ' LIMIT ?';
      queryParams.push(limit);
    }

    const [books] = await pool.query(query, queryParams);
    const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

    res.json({ books: books, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
