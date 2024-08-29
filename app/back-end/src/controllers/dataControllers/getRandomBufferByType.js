const express = require('express');
const pool = require('../../config/db');
const { getRandomBuffer } = require('./getBuffer'); // Adjust path as needed
const sharp = require('sharp'); // Import sharp for image processing

// Controller to handle HTTP requests for random buffers
exports.getRandomBufferByType = async (req, res) => {
  const type = req.params.type; // Extract type from request parameters

  try {
    // Call the helper function to get a random buffer
    const buffer = getRandomBuffer(type);
    console.log(buffer)
    res.send(buffer);
  } catch (error) {
    // Handle errors and send a proper response with an error message
    res.status(500).json({
      message: `Failed to insert a random buffer for type: ${type}`,
      error: error.message,
    });
  }
};
