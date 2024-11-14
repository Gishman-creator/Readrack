// src/utils/idUtils.js

const poolpg = require('../config/dbpg'); // Adjust path as necessary

// Function to generate a random ID of the specified length
function generateRandomId(length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}

// Helper function to calculate the maximum number of IDs for a given length
function getMaxIdsForLength(length) {
    return 9 * Math.pow(10, length - 1); // For length N, there are 9 * 10^(N-1) possible IDs (e.g., 6 digits = 900000)
}

// Helper function to count the number of IDs of a given length in the specified table
async function getIdsCountByLength(table, length) {
    const result = await poolpg.query(
        `SELECT COUNT(*) AS count FROM ${table} WHERE LENGTH(id::text) = $1`,
        [length]
    );
    return parseInt(result.rows[0].count, 10);
}

// Function to generate a unique ID with dynamic length if needed
async function generateUniqueId(table, idLength = 6) {
    let uniqueId;
    let isUnique = false;

    while (!isUnique) {
        const maxIdsForCurrentLength = getMaxIdsForLength(idLength);
        const currentLengthIdsCount = await getIdsCountByLength(table, idLength);

        // Check if IDs for the current length are still available
        if (currentLengthIdsCount < maxIdsForCurrentLength) {
            // Generate a random ID of the current length and check for uniqueness
            do {
                uniqueId = generateRandomId(idLength);

                const { rows } = await poolpg.query(
                    `SELECT id FROM ${table} WHERE id = $1`,
                    [uniqueId]
                );

                isUnique = rows.length === 0;
            } while (!isUnique); // Repeat if ID exists
        } else {
            // If IDs for the current length are exhausted, increase ID length
            idLength++;
        }
    }

    return uniqueId;
}

module.exports = {
    generateUniqueId,
};
