const pool = require('../../config/db');
const { getImageURL } = require('../../utils/imageUtils');

// Function to build the SQL for any-order search
const buildAnyOrderQuery = (query, columnName) => {
  const characters = query.split('');
  let conditions = characters.map(char => `${columnName} LIKE ?`).join(' AND ');
  let queryParams = characters.map(char => `%${char}%`);
  return { conditions, queryParams };
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

  console.log('The query is:', query);
  console.log('The type is:', type);

  try {
    // Initialize queries
    let seriesQuery = 'SELECT series.*, authors.nickname, authors.authorName AS author_name FROM series LEFT JOIN authors ON series.author_id = authors.id';
    let collectionsQuery = 'SELECT collections.*, authors.nickname, authors.authorName AS author_name FROM collections LEFT JOIN authors ON collections.author_id = authors.id';
    let authorsQuery = 'SELECT * FROM authors';
    let booksQuery = 'SELECT * FROM books';
    let seriesCountQuery = 'SELECT COUNT(*) AS totalCount FROM series';
    let collectionsCountQuery = 'SELECT COUNT(*) AS totalCount FROM collections';
    let authorsCountQuery = 'SELECT COUNT(*) AS totalCount FROM authors';
    let booksCountQuery = 'SELECT COUNT(*) AS totalCount FROM books';
    
    let seriesQueryParams = [];
    let collectionsQueryParams = [];
    let authorsQueryParams = [];
    let booksQueryParams = [];
    let countQueryParams = [];

    // Apply query filter if available (for any order search)
    if (query) {
      const { conditions: seriesConditions, queryParams: seriesParams } = buildAnyOrderQuery(query, 'serieName');
      const { conditions: collectionsConditions, queryParams: collectionsParams } = buildAnyOrderQuery(query, 'collectionName');
      const { conditions: authorsConditions, queryParams: authorsParams } = buildAnyOrderQuery(query, 'authorName');
      const { conditions: authorsNicknameConditions, queryParams: authorsNicknameParams } = buildAnyOrderQuery(query, 'nickname');
      const { conditions: booksConditions, queryParams: booksParams } = buildAnyOrderQuery(query, 'bookName');
      
      // Append WHERE clauses
      seriesQuery += ` WHERE ${seriesConditions} order by searchCount desc`;
      collectionsQuery += ` WHERE ${collectionsConditions} order by searchCount desc`;
      authorsQuery += ` WHERE ${authorsConditions} OR ${authorsNicknameConditions} order by searchCount desc`;
      booksQuery += ` WHERE ${booksConditions} order by searchCount desc`;
      
      seriesCountQuery += ` WHERE ${seriesConditions}`;
      collectionsCountQuery += ` WHERE ${collectionsConditions}`;
      authorsCountQuery += ` WHERE ${authorsConditions} OR ${authorsNicknameConditions}`;
      booksCountQuery += ` WHERE ${booksConditions}`;
      
      // Append params
      seriesQueryParams.push(...seriesParams);
      collectionsQueryParams.push(...collectionsParams);
      authorsQueryParams.push(...authorsParams, ...authorsNicknameParams); // for nickname search
      booksQueryParams.push(...booksParams);

      countQueryParams.push(...seriesParams, ...seriesParams);
    }

    // Apply limits and offsets
    if (typeof seriePageLimitStart === 'number' && typeof seriePageLimitEnd === 'number') {
      seriesQuery += ' LIMIT ?, ?';
      seriesQueryParams.push(seriePageLimitStart, seriePageLimitEnd - seriePageLimitStart);
    }
    if (typeof collectionPageLimitStart === 'number' && typeof collectionPageLimitEnd === 'number') {
      collectionsQuery += ' LIMIT ?, ?';
      collectionsQueryParams.push(collectionPageLimitStart, collectionPageLimitEnd - collectionPageLimitStart);
    }
    if (typeof authorPageLimitStart === 'number' && typeof authorPageLimitEnd === 'number') {
      authorsQuery += ' LIMIT ?, ?';
      authorsQueryParams.push(authorPageLimitStart, authorPageLimitEnd - authorPageLimitStart);
    }
    if (typeof bookPageLimitStart === 'number' && typeof bookPageLimitEnd === 'number') {
      booksQuery += ' LIMIT ?, ?';
      booksQueryParams.push(bookPageLimitStart, bookPageLimitEnd - bookPageLimitStart);
    }

    // Execute queries
    const [seriesRows] = await pool.query(seriesQuery, seriesQueryParams);
    const [collectionsRows] = await pool.query(collectionsQuery, collectionsQueryParams);
    const [authorsRows] = await pool.query(authorsQuery, authorsQueryParams);
    const [booksRows] = await pool.query(booksQuery, booksQueryParams);

    // Log queries for debugging
    console.log(seriesQuery, seriesQueryParams);
    console.log(collectionsQuery, collectionsQueryParams);
    console.log(authorsQuery, authorsQueryParams);
    console.log(booksQuery, booksQueryParams);

    // Execute count queries
    const [[{ totalCount: totalSeries }]] = await pool.query(seriesCountQuery, countQueryParams);
    const [[{ totalCount: totalCollections }]] = await pool.query(collectionsCountQuery, countQueryParams);
    const [[{ totalCount: totalAuthors }]] = await pool.query(authorsCountQuery, countQueryParams);
    const [[{ totalCount: totalBooks }]] = await pool.query(booksCountQuery, countQueryParams);

    // Log the total counts before sending the response
    console.log('Total series count:', totalSeries);
    console.log('Total collections count:', totalCollections);
    console.log('Total authors count:', totalAuthors);
    console.log('Total books count:', totalBooks);

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
      if (result.image) {
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
    console.error('Error fetching search results:', error);
    res.status(500).send('Error fetching search results');
  }
};
