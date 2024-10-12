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

  if (columnName === 'nickname') {
    condition = `"${columnName}" ILIKE $2`;
  } else {
    condition = `"${columnName}" ILIKE $1`;
  }

  // Return the condition and parameters
  return { condition, queryParams: [`%${sqlPattern}%`] };
};

exports.search = async (req, res) => {

  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const query = req.query.query ? req.query.query.trim().replace(/%/g, '\\%').replace(/_/g, '\\_') : null;
  const type = req.query.type;
  const seriePageLimitStart = validatePagination(parseInt(req.query.seriePageLimitStart, 10));
  const seriePageLimitEnd = validatePagination(parseInt(req.query.seriePageLimitEnd, 10));
  const collectionPageLimitStart = validatePagination(parseInt(req.query.collectionPageLimitStart, 10));
  const collectionPageLimitEnd = validatePagination(parseInt(req.query.collectionPageLimitEnd, 10));
  const authorPageLimitStart = validatePagination(parseInt(req.query.authorPageLimitStart, 10));
  const authorPageLimitEnd = validatePagination(parseInt(req.query.authorPageLimitEnd, 10));
  const bookPageLimitStart = validatePagination(parseInt(req.query.bookPageLimitStart, 10));
  const bookPageLimitEnd = validatePagination(parseInt(req.query.bookPageLimitEnd, 10));

  try {
    // Initialize queries
    let seriesQuery = 'SELECT * FROM series';
    let collectionsQuery = 'SELECT * FROM collections';
    let authorsQuery = `SELECT a.*, COUNT(DISTINCT s.id) AS "numSeries", COUNT(DISTINCT b.id) AS "numBooks" FROM authors a LEFT JOIN series s ON s.author_id::text LIKE '%' || a.id::text || '%' LEFT JOIN books b ON b.author_id::text LIKE '%' || a.id::text || '%' `;
    let booksQuery = 'SELECT books.*, series."serieName" AS serie_name, collections."collectionName" AS collection_name FROM books LEFT JOIN series ON books.serie_id = series.id LEFT JOIN collections ON books.collection_id = collections.id';
    let seriesCountQuery = 'SELECT COUNT(*) AS "totalCount" FROM series';
    let collectionsCountQuery = 'SELECT COUNT(*) AS "totalCount" FROM collections';
    let authorsCountQuery = 'SELECT COUNT(*) AS "totalCount" FROM authors';
    let booksCountQuery = 'SELECT COUNT(*) AS "totalCount" FROM books';

    let seriesQueryParams = [];
    let collectionsQueryParams = [];
    let authorsQueryParams = [];
    let booksQueryParams = [];
    let countQueryParams = [];
    let authorsCountQueryParams = [];

    // Apply query filter if available (for any order search)
    if (query) {
      // Use the new buildExactOrderQuery function
      const { condition: seriesCondition, queryParams: seriesParams } = buildExactOrderQuery(query, "serieName");
      const { condition: collectionsCondition, queryParams: collectionsParams } = buildExactOrderQuery(query, "collectionName");
      const { condition: authorsCondition, queryParams: authorsParams } = buildExactOrderQuery(query, "authorName");
      const { condition: authorsNicknameCondition, queryParams: authorsNicknameParams } = buildExactOrderQuery(query, "nickname");
      const { condition: booksCondition, queryParams: booksParams } = buildExactOrderQuery(query, "bookName");

      // Append WHERE clauses
      seriesQuery += ` WHERE ${seriesCondition} ORDER BY "searchCount" DESC`;
      collectionsQuery += ` WHERE ${collectionsCondition} ORDER BY "searchCount" DESC`;
      authorsQuery += ` WHERE ${authorsCondition} OR ${authorsNicknameCondition} GROUP BY a.id ORDER BY "searchCount" DESC`;
      booksQuery += ` WHERE ${booksCondition} ORDER BY "searchCount" DESC`;

      seriesCountQuery += ` WHERE ${seriesCondition}`;
      collectionsCountQuery += ` WHERE ${collectionsCondition}`;
      authorsCountQuery += ` WHERE ${authorsCondition} OR ${authorsNicknameCondition}`;
      booksCountQuery += ` WHERE ${booksCondition}`;

      // Append params
      seriesQueryParams.push(...seriesParams);
      collectionsQueryParams.push(...collectionsParams);
      authorsQueryParams.push(...authorsParams, ...authorsNicknameParams);
      booksQueryParams.push(...booksParams);

      countQueryParams.push(...seriesParams);
      authorsCountQueryParams.push(...seriesParams, ...authorsNicknameParams);
    }

    // Apply limits and offsets
    if (typeof seriePageLimitStart === 'number' && typeof seriePageLimitEnd === 'number') {
      seriesQuery += ` LIMIT $${seriesQueryParams.length + 1} OFFSET $${seriesQueryParams.length + 2}`;
      seriesQueryParams.push(seriePageLimitEnd - seriePageLimitStart, seriePageLimitStart);
    }
    if (typeof collectionPageLimitStart === 'number' && typeof collectionPageLimitEnd === 'number') {
      collectionsQuery += ` LIMIT $${collectionsQueryParams.length + 1} OFFSET $${collectionsQueryParams.length + 2}`;
      collectionsQueryParams.push(collectionPageLimitEnd - collectionPageLimitStart, collectionPageLimitStart);
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
    const collectionsResult = await poolpg.query(collectionsQuery, collectionsQueryParams);
    console.log('authorsQueryParams', authorsQueryParams)
    const authorsResult = await poolpg.query(authorsQuery, authorsQueryParams);
    const booksResult = await poolpg.query(booksQuery, booksQueryParams);

    const seriesRows = seriesResult.rows;
    const collectionsRows = collectionsResult.rows;
    const authorsRows = authorsResult.rows;
    const booksRows = booksResult.rows;

    for (const serie of seriesRows) {
      // Fetch authors for each serie
      const authors = await getAuthorsByIds(serie.author_id);
      serie.authors = authors;
    }

    for (const collection of collectionsRows) {
      // Fetch authors for each collection
      const authors = await getAuthorsByIds(collection.author_id);
      collection.authors = authors;
    }

    for (const book of booksRows) {
      // Fetch authors for each book
      const authors = await getAuthorsByIds(book.author_id);
      book.authors = authors;
    }

    // Execute count queries
    const totalSeriesResult = await poolpg.query(seriesCountQuery, countQueryParams);
    const totalSeries = totalSeriesResult.rows[0]?.totalCount || 0;

    const totalCollectionsResult = await poolpg.query(collectionsCountQuery, countQueryParams);
    const totalCollections = totalCollectionsResult.rows[0]?.totalCount || 0;

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
        ...collectionsRows.map((collections) => ({ ...collections, type: 'collection' })),
        ...authorsRows.map((author) => ({ ...author, type: 'author' })),
      ];
    } else if (type === 'series') {
      results = seriesRows.map((series) => ({ ...series, type: 'serie' }));
    } else if (type === 'collections') {
      results = collectionsRows.map((collections) => ({ ...collections, type: 'collection' }));
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
      totalCollectionsCount: totalCollections,
      totalAuthorsCount: totalAuthors,
      totalBooksCount: totalBooks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
