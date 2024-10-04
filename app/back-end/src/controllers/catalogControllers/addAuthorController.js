// src/controllers/addAuthorController.js

const poolpg = require('../../config/dbpg');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const generateRandomId = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addAuthor = async (req, res) => {
  try {
    const {
      authorName,
      nickname,
      dob,
      dod,
      customDob,
      nationality,
      biography,
      awards,
      x,
      instagram,
      facebook,
      website,
      genres,
    } = req.body;

    const image = req.file ? await putImage('', req.file, 'authors') : null;

    let uniqueId;
    let isUnique = false;

    // Generate a unique ID if necessary
    while (!isUnique) {
      uniqueId = generateRandomId();

      // Check if the ID already exists in PostgreSQL
      const { rows } = await poolpg.query('SELECT id FROM authors WHERE id = $1', [uniqueId]);

      if (rows.length === 0) {
        isUnique = true;
      }
    }

    // Insert author data into the PostgreSQL database
    const insertQuery = `
      INSERT INTO authors (
        id, image, authorName, nickname, dob, dod, customDob, nationality, biography, x, facebook, instagram, website, genres, awards
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    const insertValues = [
      uniqueId,
      image,
      authorName,
      nickname || null,
      dob || null,
      dod || null,
      customDob || null,
      nationality || null,
      biography || null,
      x || null,
      facebook || null,
      instagram || null,
      website || null,
      genres || null,
      awards || null,
    ];

    // Execute the insert query in PostgreSQL
    await poolpg.query(insertQuery, insertValues);

    // Fetch the newly added author data with the number of series and books
    const fetchQuery = `
      SELECT a.*, 
        COUNT(DISTINCT s.id) AS "numSeries", 
        COUNT(DISTINCT b.id) AS "numBooks"
      FROM authors a
      LEFT JOIN series s ON s.author_id LIKE '%' || a.id || '%'
      LEFT JOIN books b ON b.author_id LIKE '%' || a.id || '%'
      WHERE a.id = $1
      GROUP BY a.id
    `;
    const { rows: authorData } = await poolpg.query(fetchQuery, [uniqueId]);

    let url = null;
    if (authorData[0].image && authorData[0].image !== 'null') {
      url = await getImageURL(authorData[0].image);
    }
    authorData[0].imageURL = url;

    // Emit the newly added author data if Socket.IO is initialized
    if (req.io) {
      req.io.emit('authorAdded', authorData[0]);
    }

    // Respond with success message and the inserted author ID
    res.status(201).json({ message: 'Author added successfully', authorId: uniqueId });
  } catch (error) {
    console.error('Error adding author:', error);
    res.status(500).json({ error: 'Failed to add author' });
  }
};

module.exports = {
  addAuthor,
};
