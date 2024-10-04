const poolpg = require('../../config/dbpg');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { getImageURL } = require('../../utils/imageUtils');

// Fetch all books with author details
exports.getBooks = async (req, res) => {
  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10)) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10)) : null;

  try {
    
    let dataQuery = `
    SELECT books.*, series."serieName" AS serie_name, collections."collectionName" AS collection_name
    FROM books
    LEFT JOIN series ON books.serie_id = series.id
    LEFT JOIN collections ON books.collection_id = collections.id
    `;
    const queryParams = [];
    
    if (typeof limitStart === 'number' && typeof limitEnd === 'number') {
      dataQuery += ' LIMIT $1 OFFSET $2';
      queryParams.push(limitEnd - limitStart, limitStart);
    }
    
    const booksResult = await poolpg.query(dataQuery, queryParams);
    const books = booksResult.rows;
    const totalCount = booksResult.rowCount;

    for (const book of books) {
      // Fetch authors for each book
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;

      // Fetch image URL if available
      if (book.image && book.image !== 'null') {
        book.imageURL = await getImageURL(book.image);
      } else {
        book.imageURL = null;
      }
    }

    res.json({ data: books, totalCount });
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
      SELECT books.*, series."serieName" AS serie_name, collections."collectionName" AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.id = $1
    `;
    const queryParams = [id];

    if (limit) {
      query += ' LIMIT $2';
      queryParams.push(limit);
    }

    const booksResult = await poolpg.query(query, queryParams);
    const books = booksResult.rows;

    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[0];
    // Fetch authors for the book
    const authors = await getAuthorsByIds(book.author_id);
    book.authors = authors;

    // Fetch image URL if available
    if (book.image && book.image !== 'null') {
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

// Fetch books by series ID
exports.getBooksBySerieId = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  let { serie_id } = req.params;

  try {
    // Fetch books by serie_id and join with authors and series to get their names
    let query = `
      SELECT books.*, series."serieName" AS serie_name, collections."collectionName" AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.serie_id = $1
      ORDER BY books."publishDate" ASC
    `;
    const queryParams = [serie_id];

    if (limit) {
      query += ' LIMIT $2';
      queryParams.push(limit);
    }

    const booksResult = await poolpg.query(query, queryParams);
    const books = booksResult.rows;
    const totalCount = booksResult.rowCount;

    let url = null;
    for (const book of books) {
      // Fetch authors for each book
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;

      // Fetch image URL if available
      if (book.image && book.image !== 'null') {
        url = await getImageURL(book.image);
      }
      book.imageURL = url;
    }

    res.json({ books, totalCount });
  } catch (error) {
    console.error('Error fetching books by series:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBooksByCollectionId = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  let { collection_id } = req.params;

  try {
    let query = `
      SELECT books.*, series."serieName" AS serie_name, collections."collectionName" AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.collection_id = $1
      ORDER BY books."publishDate" ASC
    `;
    const queryParams = [collection_id];

    if (limit) {
      query += ' LIMIT $2';
      queryParams.push(limit);
    }

    const booksResult = await poolpg.query(query, queryParams);
    const books = booksResult.rows;
    const totalCount = booksResult.rowCount;

    for (const book of books) {
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;

      // Fetch image URL if available
      book.imageURL = book.image && book.image !== 'null' ? await getImageURL(book.image) : null;
    }

    res.json({ books: books, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books by collection:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBooksByAuthorId = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  let { author_id } = req.params;

  try {
    const likePattern = `%${author_id}%`;

    let query = `
      SELECT books.*, series."serieName" AS serie_name, collections."collectionName" AS collection_name
      FROM books
      LEFT JOIN series ON books.serie_id = series.id
      LEFT JOIN collections ON books.collection_id = collections.id
      WHERE books.author_id ILIKE $1
      AND (books.serie_id IS NULL OR books.serie_id = 0)
      AND (books.collection_id IS NULL OR books.collection_id = 0)
      ORDER BY books."publishDate" ASC
    `;
    const queryParams = [likePattern];

    if (limit) {
      query += ' LIMIT $2';
      queryParams.push(limit);
    }

    const booksResult = await poolpg.query(query, queryParams);
    const books = booksResult.rows;
    const totalCount = booksResult.rowCount;

    for (const book of books) {
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;

      book.imageURL = book.image && book.image !== 'null' ? await getImageURL(book.image) : null;
    }

    res.json({ books: books, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBookNames = async (req, res) => {
  const bookName = req.query.bookName;

  try {
    const booksResult = await poolpg.query(
      'SELECT count(*) as bookNameCount FROM books WHERE "bookName" ILIKE $1',
      [`%${bookName}%`]
    );
    const books = booksResult.rows;

    if (books.length === 0) {
      return res.status(404).json({ message: 'No books found with that name' });
    }

    res.json(books[0]);
  } catch (error) {
    console.error('Error fetching books by name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
