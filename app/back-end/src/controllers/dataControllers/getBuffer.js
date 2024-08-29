const fs = require('fs');
const path = require('path');

// Load blobs from JSON file
const blobs = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data/blobs.json'), 'utf8'));

// General function to get the first buffer based on type ('authors', 'series', 'books')
exports.getRandomBuffer = (type) => {
  try {
    // Validate the type and ensure the corresponding array exists in the blobs
    if (!blobs[type] || blobs[type].length === 0) {
      throw new Error(`No ${type} found in the blob data.`);
    }

    // Get the first buffer from the specified type
    return blobs[type][0];
  } catch (error) {
    console.error(`Error retrieving first ${type} buffer:`, error);
    throw error; // Re-throw the error to handle it at a higher level
  }
};
