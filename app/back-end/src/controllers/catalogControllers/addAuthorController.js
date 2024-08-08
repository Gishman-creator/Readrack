// src/controllers/addAuthorController.js

const pool = require('../../config/db');

const addAuthor = async (req, res) => {
  try {
    const {
      authorName,
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

    // Insert author data into the database
    const query = `
      INSERT INTO authors (
        image, name, seriesNo, bookNo, date, nationality, bio, x, fb, ig, link, genre, awards
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      authorImageBlob,
      authorName,
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

    const [result] = await pool.execute(query, values);

    res.status(201).json({ message: 'Author added successfully', authorId: result.insertId });
    console.log('Author added successfully');
  } catch (error) {
    console.error('Error adding author:', error);
    res.status(500).json({ error: 'Failed to add author' });
  }
};

module.exports = {
  addAuthor,
};
