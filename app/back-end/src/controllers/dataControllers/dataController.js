const pool = require('../../config/db');
const { faker } = require('@faker-js/faker');
const awards = require('../../data/awards.json'); // Load awards from JSON file
const genres = require('../../data/genres.json'); // Load genres from JSON file
const { getRandomBuffer } = require('../dataControllers/getBuffer');

// Helper function to shuffle an array
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

// Function to generate authors and insert into database
const generateAuthors = async () => {
  const authors = [];

  for (let i = 0; i < 200; i++) {
    const authorData = {
      image: getRandomBuffer('authors'), // Get random buffer from authors
      name: faker.person.fullName(),
      seriesNo: faker.number.int({ min: 0, max: 10 }),
      booksNo: 0, // Initialize to 0, will update later
      date: faker.date.past(),
      nationality: faker.address.country(),
      bio: faker.lorem.paragraph(),
      x: 'https://www.x.com',
      fb: 'https://www.facebook.com',
      ig: 'https://www.instagram.com',
      link: 'https://www.google.com',
      genres: faker.helpers.arrayElement(genres).join(', '), // Convert to comma-separated string
      awards: faker.helpers.arrayElement(awards).join(', '), // Convert to comma-separated string
      searchCount: faker.number.int({ min: 0, max: 1000 })
    };

    authors.push(authorData);

    // Insert author data into database
    await pool.query("INSERT INTO authors SET ?", authorData);
  }

  return authors;
};

// Function to generate series and insert into database
const generateSeries = async (authors) => {
  const series = [];
  const shuffledAuthors = shuffleArray(authors);

  for (let i = 0; i < 300; i++) {
    const author = faker.helpers.arrayElement(shuffledAuthors);
    const seriesData = {
      image: getRandomBuffer('series'), // Get random buffer from series
      name: faker.lorem.words(),
      author_name: author.name,
      booksNo: faker.number.int({ min: 0, max: 10 }),
      genres: faker.helpers.arrayElements(genres, { min: 1, max: 3 }).join(', '), // Convert to comma-separated string
      link: 'https://www.amazon.com',
      searchCount: faker.number.int({ min: 0, max: 1000 })
    };

    series.push(seriesData);
    // Update the author's seriesNo
    await pool.query("UPDATE authors SET seriesNo = seriesNo + 1 WHERE name = ?", [author.name]);

    // Insert series data into database
    await pool.query("INSERT INTO series SET ?", seriesData);
  }

  return series;
};

// Function to generate books and insert into database
const generateBooks = async (authors, series) => {
  const books = [];
  const shuffledSeries = shuffleArray(series);

  // Function to get the current book count of an author
  const getAuthorBookCount = async (authorName) => {
    const [rows] = await pool.query("SELECT COUNT(*) AS count FROM books WHERE author_name = ?", [authorName]);
    return rows[0].count;
  };

  // Function to get available series for an author
  const getAuthorSeries = async (authorName) => {
    const [rows] = await pool.query("SELECT * FROM series WHERE author_name = ?", [authorName]);
    return rows;
  };

  // Function to get all authors with less than 10 books
  const getEligibleAuthors = async () => {
    const [rows] = await pool.query("SELECT * FROM authors WHERE booksNo < 10");
    return rows;
  };

  // Generate 3000 books
  for (let i = 0; i < 3000; i++) {
    let author;
    let authorBooksCount;

    // Pick authors who have less than 10 books
    const eligibleAuthors = await getEligibleAuthors();
    
    if (eligibleAuthors.length > 0) {
      author = faker.helpers.arrayElement(eligibleAuthors);
      authorBooksCount = author.booksNo;
    } else {
      // If all authors have 10 books, pick randomly from all authors
      author = faker.helpers.arrayElement(authors);
      authorBooksCount = await getAuthorBookCount(author.name);
    }

    // Select series for the book if applicable
    let serie = null;
    if (Math.random() > 0.5) { // 50% chance to assign a series
      const authorSeries = await getAuthorSeries(author.name);
      if (authorSeries.length > 0) {
        serie = faker.helpers.arrayElement(authorSeries);
      }
    }

    const bookData = {
      image: getRandomBuffer('books'), // Get random buffer from books
      name: faker.lorem.words(),
      serie_name: serie ? serie.name : null,
      serieNo: serie ? serie.booksNo + 1 : null,
      author_name: author.name,
      genres: faker.helpers.arrayElements(genres, { min: 1, max: 3 }).join(', '), // Convert to comma-separated string
      authorNo: author ? author.booksNo + 1 : null,
      date: faker.date.past(),
      link: 'https://www.amazon.com',
      searchCount: faker.number.int({ min: 0, max: 1000 })
    };

    books.push(bookData);

    // Update the author's booksNo
    await pool.query("UPDATE authors SET booksNo = booksNo + 1 WHERE name = ?", [author.name]);

    // Update the series booksNo if applicable
    if (serie) {
      await pool.query("UPDATE series SET booksNo = booksNo + 1 WHERE name = ?", [serie.name]);
    }

    // Insert book data into database
    await pool.query('INSERT INTO books SET ?', bookData);
  }
};

// Function to orchestrate data generation
exports.generateRandomDataWithBlobs = async (req, res) => {
  try {
    const authors = await generateAuthors();
    const series = await generateSeries(authors);
    await generateBooks(authors, series);

    res.json({ message: 'Random data generated and saved to the database' });
  } catch (error) {
    console.error('Error generating random data:', error);
    res.status(500).json({ error: 'An error occurred while generating random data' });
  }
};
