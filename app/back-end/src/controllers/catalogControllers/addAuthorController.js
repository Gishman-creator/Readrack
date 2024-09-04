// src/controllers/addAuthorController.js

const pool = require('../../config/db');

const generateRandomId = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit integer
};

const addAuthor = async (req, res) => {
  try {
    const {
      authorName,
      nickname,
      numSeries,
      numBooks,
      dob,
      nationality,
      biography,
      awards,
      x,
      instagram,
      facebook,
      website,
      genres,
    } = req.body;

    // Check if the file is attached and read the buffer
    const authorImageBlob = req.file ? req.file.buffer : null;
    console.log("The image is:", authorImageBlob);

    let uniqueId;
    let isUnique = false;

    // Generate a unique ID
    while (!isUnique) {
      uniqueId = generateRandomId();

      // Check if the ID already exists
      const [rows] = await pool.execute('SELECT id FROM authors WHERE id = ?', [uniqueId]);

      if (rows.length === 0) {
        isUnique = true;
      }
    }

    // Insert author data into the database with the unique ID
    const insertQuery = `
      INSERT INTO authors (
        id, image, authorName, nickname, numSeries, numBooks, dob, nationality, biography, x, facebook, instagram, website, genres, awards
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      uniqueId,
      authorImageBlob,
      authorName,
      nickname || null,
      numSeries || 0,
      numBooks || 0,
      dob || null,
      nationality || null,
      biography || null,
      x || null,
      facebook || null,
      instagram || null,
      website || null,
      genres || null,
      awards || null,
    ];

    // Execute the insert query
    await pool.execute(insertQuery, insertValues);

    // Fetch the newly added author data
    const fetchQuery = `
      SELECT * FROM authors WHERE id = ?
    `;
    const [authorData] = await pool.execute(fetchQuery, [uniqueId]);

    // Emit the newly added author data if Socket.IO is initialized
    if (req.io) {
      req.io.emit('authorAdded', authorData[0]);  // Emit the full author data
      console.log('Emitting added author:', authorData[0]);
    } else {
      console.log('Socket.IO is not initialized.');
    }

    // Respond with success message and the inserted author ID
    res.status(201).json({ message: 'Author added successfully', authorId: uniqueId });
    console.log('Author added successfully');
  } catch (error) {
    console.error('Error adding author:', error);
    res.status(500).json({ error: 'Failed to add author' });
  }
};

module.exports = {
  addAuthor,
};
