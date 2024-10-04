const poolpg = require('../../config/dbpg'); // PostgreSQL poolpg
const { getAuthorsByIds } = require('../../utils/getUtils');
const { getImageURL } = require('../../utils/imageUtils');

exports.getCollections = async (req, res) => {
  const validatePagination = (value, defaultValue) => {
    return isNaN(value) ? defaultValue : value;
  };

  const limitStart = req.query.limitStart ? validatePagination(parseInt(req.query.limitStart, 10)) : null;
  const limitEnd = req.query.limitEnd ? validatePagination(parseInt(req.query.limitEnd, 10)) : null;
  const genre = req.query.genre ? req.query.genre.trim() : null;

  try {
    let dataQuery = `
      SELECT collections.*,
       COUNT(DISTINCT books.id) AS "numBooks"
      FROM collections
      LEFT JOIN books ON books.collection_id = collections.id
    `;
    let queryParams = [];

    if (genre && genre !== 'null') {
      dataQuery += ' WHERE collections.genres ILIKE $1';
      queryParams.push(`%${genre}%`);
    }

    dataQuery += ' GROUP BY collections.id ORDER BY collections."searchCount" DESC';

    if (typeof limitStart === 'number' && typeof limitEnd === 'number') {
      dataQuery += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limitEnd - limitStart, limitStart);
    }

    const results = await poolpg.query(dataQuery, queryParams);
    const dataRows = results.rows;
    const totalCount = results.rowCount;

    for (const dataRow of dataRows) {
      const authors = await getAuthorsByIds(dataRow.author_id);
      dataRow.authors = authors;

      if (dataRow.image && dataRow.image !== 'null') {
        dataRow.imageURL = await getImageURL(dataRow.image);
      }
    }

    res.json({ data: dataRows, totalCount });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).send('Error fetching collections');
  }
};

exports.getCollectionById = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 100;

  try {
    const { rows: collectionsRows } = await poolpg.query(`
      SELECT collections.*,
       COUNT(DISTINCT books.id) AS "numBooks"
      FROM collections
      LEFT JOIN books ON books.collection_id = collections.id
      WHERE collections.id = $1
      GROUP BY collections.id
      LIMIT $2
    `, [id, limit]);

    if (collectionsRows.length === 0) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const authors = await getAuthorsByIds(collectionsRows[0].author_id);
    collectionsRows[0].authors = authors;

    if (collectionsRows[0].image && collectionsRows[0].image !== 'null') {
      collectionsRows[0].imageURL = await getImageURL(collectionsRows[0].image);
    }

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
    const likePattern = `%${author_id}%`;

    let collectionsQuery = `
      SELECT collections.*,
      EXTRACT(YEAR FROM MIN(COALESCE(books."publishDate", 
                                    -- Try converting customDate to a full date format
                                    CASE 
                                      WHEN books."customDate" ~* '^[0-9]{4}$' 
                                      THEN to_date(books."customDate", 'YYYY')  -- If only a year
                                      WHEN books."customDate" ~* '^[A-Za-z]+ [0-9]{4}$' 
                                      THEN to_date(books."customDate", 'Month YYYY')  -- If month and year
                                      ELSE NULL
                                    END))) AS first_book_year,
      EXTRACT(YEAR FROM MAX(COALESCE(books."publishDate", 
                                    CASE 
                                      WHEN books."customDate" ~* '^[0-9]{4}$' 
                                      THEN to_date(books."customDate", 'YYYY')
                                      WHEN books."customDate" ~* '^[A-Za-z]+ [0-9]{4}$' 
                                      THEN to_date(books."customDate", 'Month YYYY')
                                      ELSE NULL
                                    END))) AS last_book_year,
      COUNT(DISTINCT books.id) AS "numBooks"
      FROM collections
      LEFT JOIN books ON books.collection_id = collections.id
      WHERE collections.author_id::TEXT ILIKE $1
      GROUP BY collections.id
    `;

    const queryParams = [likePattern];
    if (limit) {
      collectionsQuery += ` LIMIT $2`;
      queryParams.push(limit);
    }

    const results = await poolpg.query(collectionsQuery, queryParams);
    const collections = results.rows;
    const totalCount = results.rowCount;

    for (const collection of collections) {
      const authors = await getAuthorsByIds(collection.author_id);
      collection.authors = authors;

      if (collection.image && collection.image !== 'null') {
        collection.imageURL = await getImageURL(collection.image);
      }
    }

    res.json({ collections, totalCount });
  } catch (error) {
    console.error('Error fetching collections by author ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getCollectionsCount = async (req, res) => {
  try {
    const { rows } = await poolpg.query(`
      SELECT COUNT(*) AS count
      FROM collections
    `);

    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching collections count:', error);
    res.status(500).send('Error fetching collections count');
  }
};
