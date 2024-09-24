const pool = require('../../config/db'); 
const { getAuthorsByIds } = require('../../utils/getUtils');
const { getImageURL } = require('../../utils/imageUtils');

exports.getCollections = async (req, res) => {

  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10)) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10)) : null;
  const genre = req.query.genre ? req.query.genre.trim() : null; // Get genre from query params

  try {
    // Base query for fetching collections with genre filter if applicable
    let dataQuery = `
      SELECT collections.*
      FROM collections
      ORDER BY collections.searchCount DESC
    `;
    let countQuery = 'SELECT COUNT(*) AS totalCount FROM collections';
    let queryParams = [];

    // Add genre filter to the queries if genre is provided and is not null or empty
    if (genre && genre !== 'null') {
      dataQuery += ' WHERE collections.genres LIKE ?';
      countQuery += ' WHERE genres LIKE ?';
      queryParams.push(`%${genre}%`);
    }

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
      // Fetch authors for each dataRow
      const authors = await getAuthorsByIds(dataRow.author_id);
      dataRow.authors = authors;

      url = null;
      if (dataRow.image && dataRow.image !== 'null') {
        url = await getImageURL(dataRow.image);
      }
      dataRow.imageURL = url;
    }

    // Send both data and total count in the response
    res.json({ data: dataRows, totalCount: totalCount });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).send('Error fetching collections');
  }
};

exports.getCollectionById = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 100; // Get limit from query params, default to 100

  try {
    // Query to retrieve the collections information with author name
    const [collectionsRows] = await pool.query(`
      SELECT collections.*
      FROM collections
      WHERE collections.id = ?
      LIMIT ?
    `, [id, limit]);

    if (collectionsRows.length === 0) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Fetch authors for the collectionsRows
    const authors = await getAuthorsByIds(collectionsRows[0].author_id);
    collectionsRows[0].authors = authors;

    let url = null;
    if (collectionsRows[0].image && collectionsRows[0].image !== 'null') {
      url = await getImageURL(collectionsRows[0].image);
    }
    collectionsRows[0].imageURL = url;

    res.json(collectionsRows[0]);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).send('Error fetching collection');
  }
};

exports.getCollectionsByAuthorId = async (req, res) => {
  const { author_id } = req.params;
  const limit = parseInt(req.query.limit, 10) || null;

  try {
    // Create the pattern for the LIKE query by concatenating the wildcards
    const likePattern = `%${author_id}%`;

    // Query for fetching collections by author_id with author_name, first and last book dates
    let collectionsQuery = `
      SELECT collections.*,
             YEAR(MIN(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS first_book_year,
             YEAR(MAX(IFNULL(books.publishDate, STR_TO_DATE(books.customDate, '%Y')))) AS last_book_year
      FROM collections
      LEFT JOIN books ON books.collection_id = collections.id
      WHERE collections.author_id like ?
      GROUP BY collections.id
    `;
    let countQuery = 'SELECT COUNT(*) AS totalCount FROM collections WHERE author_id like ?';

    // Append LIMIT clause if a limit is provided
    const queryParams = [likePattern];

    if (limit) {
      collectionsQuery += ` LIMIT ?`;
      queryParams.push(limit);
    }

    // Execute the collections query
    const [collections] = await pool.query(collectionsQuery, queryParams);
    const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

    let url = null;
    for (const collection of collections) {
      // Fetch authors for each collection
      const authors = await getAuthorsByIds(collection.author_id);
      collection.authors = authors;

      url = null;
      if (collection.image && collection.image !== 'null') {
        url = await getImageURL(collection.image);
      }
      collection.imageURL = url;
    }

    res.json({ collections: collections, totalCount: totalCount });
  } catch (error) {
    console.error("Error fetching collections by author ID:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getCollectionsCount = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS count
      FROM collections
    `);

    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching collections count:', error);
    res.status(500).send('Error fetching collections count');
  }
};
