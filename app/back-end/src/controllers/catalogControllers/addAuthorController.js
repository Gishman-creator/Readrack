// src/controllers/addAuthorController.js

const poolpg = require('../../config/dbpg');
const { putImage, getImageURL } = require('../../utils/imageUtils');

const generateRandomId = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addAuthor = async (req, res) => {
  try {
    const {
      author_name,
      dob,
      dod,
      nationality,
      biography,
      awards,
      x,
      instagram,
      facebook,
      website,
      genre,
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
        id, image, author_name, dob, dod, nationality, biography, x, facebook, instagram, website, genre, awards
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

    const insertValues = [
      uniqueId,
      image,
      author_name,
      dob || null,
      dod || null,
      nationality || null,
      biography || null,
      x || null,
      facebook || null,
      instagram || null,
      website || null,
      genre || null,
      awards || null,
    ];

    // Execute the insert query in PostgreSQL
    await poolpg.query(insertQuery, insertValues);

    // Fetch the newly added author data with the number of series and books
    const fetchQuery = `
      SELECT a.*, 
        COUNT(DISTINCT s.id) AS num_series, 
        COUNT(DISTINCT b.id) AS num_books
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
