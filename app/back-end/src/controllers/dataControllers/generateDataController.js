const fs = require('fs');
const pool = require('../../config/db');
const { faker } = require('@faker-js/faker');
const blobs = require('../../data/blobs.json'); // Load blobs from JSON file

// Define possible genres and awards
const genres = [
  'Fantasy', 'Romance', 'Action', 'Science Fiction', 'Horror', 'Thriller', 
  'Mystery', 'Historical', 'Biography', 'Self-Help', 'Non-Fiction', 'Children', 'Young Adult'
];

const awards = [
  'Best Fiction', 'Top 10 Books', 'Reader\'s Choice', 'Best Mystery', 
  'Outstanding Novel', 'Best Fantasy', 'Best Romance', 'Best Science Fiction', 
  'Top Bestseller', 'Critics\' Choice', 'Best Young Adult', 'Best Historical Fiction'
];

// Generate random genres
const generateRandomGenres = () => {
  const randomGenres = [];
  const numGenres = faker.number.int({ min: 1, max: 7 }); // Updated method
  for (let i = 0; i < numGenres; i++) {
    const genre = faker.helpers.arrayElement(genres);
    if (!randomGenres.includes(genre)) {
      randomGenres.push(genre);
    }
  }
  return randomGenres;
};

// Generate random awards
const generateRandomAwards = () => {
  const randomAwards = [];
  const numAwards = faker.number.int({ min: 1, max: 5 }); // Updated method
  for (let i = 0; i < numAwards; i++) {
    const award = faker.helpers.arrayElement(awards);
    if (!randomAwards.includes(award)) {
      randomAwards.push(award);
    }
  }
  return randomAwards;
};

// Generate random data and save to JSON files
exports.generateDataArrays = (req, res) => {
  try {
    const genreArrays = [];
    const awardArrays = [];

    // Generate 100 arrays of random genres
    for (let i = 0; i < 100; i++) {
      genreArrays.push(generateRandomGenres());
    }

    // Generate 100 arrays of random awards
    for (let i = 0; i < 100; i++) {
      awardArrays.push(generateRandomAwards());
    }

    // Ensure data folder exists
    if (!fs.existsSync('./src/data')) {
      fs.mkdirSync('./src/data', { recursive: true });
    }

    // Save arrays to JSON files
    fs.writeFileSync('./src/data/genres.json', JSON.stringify(genreArrays, null, 2));
    fs.writeFileSync('./src/data/awards.json', JSON.stringify(awardArrays, null, 2));

    res.json({ message: 'Random genres and awards data generated and saved to JSON files' });
  } catch (error) {
    console.error('Error generating data arrays:', error);
    res.status(500).json({ error: 'An error occurred while generating data arrays' });
  }
};
