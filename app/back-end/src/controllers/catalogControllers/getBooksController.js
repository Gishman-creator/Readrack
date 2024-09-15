const pool = require('../../config/db');
const { getImageURL } = require('../../utils/imageUtils');

// Helper function to fetch authors based on their IDs
const getAuthorsByIds = async (authorIds) => {
  if (!authorIds) return [];

  const idsArray = authorIds.split(',').map(id => id.trim()); // Split the string and trim any spaces
  const placeholders = idsArray.map(() => '?').join(','); // Prepare placeholders for SQL IN clause

  const query = `SELECT id AS author_id, authorName AS author_name, nickname FROM authors WHERE id IN (${placeholders})`;
  const [authors] = await pool.query(query, idsArray);
  
  return authors;
};

// Fetch all books with author details
exports.getBooks = async (req, res) => {
  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10)) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10)) : null;

  try {
    const [countResult] = await pool.query('SELECT COUNT(*) AS total FROM books');
    const totalCount = countResult[0].total;

    let dataQuery = `
      SELECT books.*, series.serieName AS serie_name, collections.collectionName AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
    `;
    const queryParams = [];

    if (typeof limitStart === 'number' && typeof limitEnd === 'number') {
      dataQuery += ' LIMIT ?, ?';
      queryParams.push(limitStart, limitEnd - limitStart);
    }

    const [books] = await pool.query(dataQuery, queryParams);

    for (const book of books) {
      // Fetch authors for each book
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;

      // Fetch image URL if available
      if (book.image) {
        book.imageURL = await getImageURL(book.image);
      } else {
        book.imageURL = null;
      }
    }

    res.json({ data: books, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Error fetching books');
  }
};

// Fetch a specific book by ID with author details
exports.getBookById = async (req, res) => {
  const { id } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

  try {
    let query = `
      SELECT books.*, series.serieName AS serie_name, collections.collectionName AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.id = ?
    `;
    const queryParams = [id];

    if (limit) {
      query += ' LIMIT ?';
      queryParams.push(limit);
    }

    const [books] = await pool.query(query, queryParams);

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[0];
    // Fetch authors for the book
    const authors = await getAuthorsByIds(book.author_id);
    book.authors = authors;

    // Fetch image URL if available
    if (book.image) {
      book.imageURL = await getImageURL(book.image);
    } else {
      book.imageURL = null;
    }

    res.json(book);
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
      SELECT books.*, series.serieName AS serie_name, collections.collectionName AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.serie_id = ?
      ORDER BY books.publishDate ASC
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

    let url = null;
    for (const book of books) {
      // Fetch authors for each book
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;

      // Fetch image URL if available
      url = null;
      if (book.image) {
        url = await getImageURL(book.image);
      }
      book.imageURL = url;
    }

    res.json({ books: books, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books by series:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBooksByCollectionId = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  let { collection_id } = req.params;
  console.log('The collection id:', collection_id);

  try {
    // Fetch books by collection_id and join with authors and collections to get their names
    let query = `
      SELECT books.*, series.serieName AS serie_name, collections.collectionName AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.collection_id = ?
      ORDER BY books.publishDate ASC
    `;
    let countQuery = `
      SELECT COUNT(*) AS totalCount 
      FROM books 
      WHERE collection_id = ?
    `;
    const queryParams = [collection_id];

    if (limit) {
      query += ' LIMIT ?';
      queryParams.push(limit);
    }

    const [books] = await pool.query(query, queryParams);
    const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

    let url = null;
    for (const book of books) {
      // Fetch authors for each book
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;

      // Fetch image URL if available
      url = null;
      if (book.image) {
        url = await getImageURL(book.image);
      }
      book.imageURL = url;
    }

    res.json({ books: books, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books by collections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBooksByAuthorId = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  let { author_id } = req.params;

  try {
    // Create the pattern for the LIKE query by concatenating the wildcards
    const likePattern = `%${author_id}%`;

    // Fetch books by author_id and join with authors and series to get their names
    let query = `
      SELECT books.*, series.serieName AS serie_name, collections.collectionName AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.author_id like ?
      AND books.serie_id is null
      AND books.collection_id is null
      ORDER BY books.publishDate ASC
    `;
    let countQuery = `
      SELECT COUNT(*) AS totalCount 
      FROM books 
      WHERE author_id like ?
      AND books.serie_id is null
      AND books.collection_id is null
    `;
    const queryParams = [likePattern];

    if (limit) {
      query += ' LIMIT ?';
      queryParams.push(limit);
    }

    const [books] = await pool.query(query, queryParams);
    const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

    let url = null;
    for (const book of books) {
      // Fetch authors for each book
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;

      // Fetch image URL if available
      url = null;
      if (book.image) {
        url = await getImageURL(book.image);
      }
      book.imageURL = url;
    }

    res.json({ books: books, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
