const poolpg = require('../../config/dbpg');
const { getAuthorsByIds } = require('../../utils/getUtils');
const { getImageURL } = require('../../utils/imageUtils');

// Simplified version of the buildExactOrderQuery function
const buildExactOrderQuery = (query, columnName) => {
  // Remove special characters and spaces from the query
  const sanitizedQuery = query.replace(/[^a-zA-Z0-9]/g, ''); // Sanitized query without special characters

  // Create a SQL pattern by joining each character with a wildcard ('%')
  const sqlPattern = sanitizedQuery.split('').join('%'); // Creates pattern: "h%e%l%l%o" for "hello"

  // Construct SQL condition using ILIKE (for case-insensitive matching)
  let condition;

  condition = `"${columnName}" ILIKE $1`;

  // Return the condition and parameters
  return { condition, queryParams: [`%${sqlPattern}%`] };
};

exports.search = async (req, res) => {

  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const query = req.query.query ? req.query.query.trim().replace(/%/g, '\\%').replace(/_/g, '\\_') : null;
  // console.log("Query:", req.query);
  const type = req.query.type;
  const seriePageLimitStart = validatePagination(parseInt(req.query.seriePageLimitStart, 10));
  const seriePageLimitEnd = validatePagination(parseInt(req.query.seriePageLimitEnd, 10));
  const authorPageLimitStart = validatePagination(parseInt(req.query.authorPageLimitStart, 10));
  const authorPageLimitEnd = validatePagination(parseInt(req.query.authorPageLimitEnd, 10));
  const bookPageLimitStart = validatePagination(parseInt(req.query.bookPageLimitStart, 10));
  const bookPageLimitEnd = validatePagination(parseInt(req.query.bookPageLimitEnd, 10));

  try {
    // Initialize queries
    let seriesQuery = 'SELECT * FROM series';
    let authorsQuery = `SELECT * FROM authors`;
    let booksQuery = 'SELECT books.*, series.serie_name FROM books LEFT JOIN series ON books.serie_id::text = series.id::text';
    let seriesCountQuery = 'SELECT COUNT(*) AS "totalCount" FROM series';
    let authorsCountQuery = 'SELECT COUNT(*) AS "totalCount" FROM authors';
    let booksCountQuery = 'SELECT COUNT(*) AS "totalCount" FROM books';

    let seriesQueryParams = [];
    let authorsQueryParams = [];
    let booksQueryParams = [];
    let countQueryParams = [];
    let authorsCountQueryParams = [];

    // Apply query filter if available (for any order search)
    if (query) {
      // Use the new buildExactOrderQuery function
      const { condition: seriesCondition, queryParams: seriesParams } = buildExactOrderQuery(query, "serie_name");
      const { condition: authorsCondition, queryParams: authorsParams } = buildExactOrderQuery(query, "author_name");
      const { condition: booksCondition, queryParams: booksParams } = buildExactOrderQuery(query, "book_name");

      // Append WHERE clauses
      seriesQuery += ` WHERE ${seriesCondition} ORDER BY search_count DESC`;
      authorsQuery += ` WHERE ${authorsCondition} ORDER BY search_count DESC`;
      booksQuery += ` WHERE ${booksCondition} ORDER BY search_count DESC`;

      seriesCountQuery += ` WHERE ${seriesCondition}`;
      authorsCountQuery += ` WHERE ${authorsCondition}`;
      booksCountQuery += ` WHERE ${booksCondition}`;

      // Append params
      seriesQueryParams.push(...seriesParams);
      authorsQueryParams.push(...authorsParams);
      booksQueryParams.push(...booksParams);

      countQueryParams.push(...seriesParams);
      authorsCountQueryParams.push(...seriesParams);
    }

    // Apply limits and offsets
    if (typeof seriePageLimitStart === 'number' && typeof seriePageLimitEnd === 'number') {
      seriesQuery += ` LIMIT $${seriesQueryParams.length + 1} OFFSET $${seriesQueryParams.length + 2}`;
      seriesQueryParams.push(seriePageLimitEnd - seriePageLimitStart, seriePageLimitStart);
    }
    if (typeof authorPageLimitStart === 'number' && typeof authorPageLimitEnd === 'number') {
      authorsQuery += ` LIMIT $${authorsQueryParams.length + 1} OFFSET $${authorsQueryParams.length + 2}`;
      authorsQueryParams.push(authorPageLimitEnd - authorPageLimitStart, authorPageLimitStart);
    }
    if (typeof bookPageLimitStart === 'number' && typeof bookPageLimitEnd === 'number') {
      booksQuery += ` LIMIT $${booksQueryParams.length + 1} OFFSET $${booksQueryParams.length + 2}`;
      booksQueryParams.push(bookPageLimitEnd - bookPageLimitStart, bookPageLimitStart);
    }

    // Execute queries
    const seriesResult = await poolpg.query(seriesQuery, seriesQueryParams);
    // console.log('authorsQueryParams', authorsQueryParams)
    // console.log("Author query:", authorsQuery)
    const authorsResult = await poolpg.query(authorsQuery, authorsQueryParams);
    const booksResult = await poolpg.query(booksQuery, booksQueryParams);

    const seriesRows = seriesResult.rows;
    const authorsRows = authorsResult.rows;
    const booksRows = booksResult.rows;

    for (const serie of seriesRows) {
      // Fetch authors for each serie
      const authors = await getAuthorsByIds(serie.author_id);
      serie.authors = authors;
    }

    for (const book of booksRows) {
      // Fetch authors for each book
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;
    }

    // Execute count queries
    const totalSeriesResult = await poolpg.query(seriesCountQuery, countQueryParams);
    const totalSeries = totalSeriesResult.rows[0]?.totalCount || 0;

    console.log('authorsCountQuery', authorsCountQuery)
    console.log('authorsCountQueryParams', authorsCountQueryParams)
    const totalAuthorsResult = await poolpg.query(authorsCountQuery, authorsCountQueryParams);
    const totalAuthors = totalAuthorsResult.rows[0]?.totalCount || 0;

    const totalBooksResult = await poolpg.query(booksCountQuery, countQueryParams);
    const totalBooks = totalBooksResult.rows[0]?.totalCount || 0;


    // Combine results
    let results = [];
    if (type === 'all') {
      results = [
        ...seriesRows.map((series) => ({ ...series, type: 'serie' })),
        ...authorsRows.map((author) => ({ ...author, type: 'author' })),
      ];
    } else if (type === 'series') {
      results = seriesRows.map((series) => ({ ...series, type: 'serie' }));
    } else if (type === 'author' || type === 'authors') {
      results = authorsRows.map((author) => ({ ...author, type: 'author' }));
    } else if (type === 'book' || type === 'books') {
      results = booksRows.map((book) => ({ ...book, type: 'book' }));
    }

    let url = null;
    for (const result of results) {
      url = null;
      if (result.image && result.image !== 'null') {
        url = await getImageURL(result.image);
      }
      result.imageURL = url;
    }

    // Send results and counts
    res.json({
      results,
      totalSeriesCount: totalSeries,
      totalAuthorsCount: totalAuthors,
      totalBooksCount: totalBooks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
