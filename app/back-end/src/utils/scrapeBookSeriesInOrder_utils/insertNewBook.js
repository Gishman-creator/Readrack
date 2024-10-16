const poolpg = require('../../config/dbpg3');

exports.insertNewBook = async (bookName, amazonLink, authorId) => {
    let bookIdLength = 6; // Start with 6 digits
    let maxIdsForCurrentLength;
    let currentLengthIdsCount;
    let idExists, bookId;

    do {
        // Calculate the maximum number of IDs for the current length
        maxIdsForCurrentLength = getMaxIdsForLength(bookIdLength);

        // Count how many IDs of the current length exist in the database
        currentLengthIdsCount = await getIdsCountByLength(bookIdLength);

        if (currentLengthIdsCount < maxIdsForCurrentLength) {
            // If there are still available IDs of this length, generate a new one
            do {
                bookId = generateRandomId(bookIdLength);
                idExists = await checkIfIdExists(bookId);
            } while (idExists);
        } else {
            // If all IDs of this length are taken, increment the length and try again
            bookIdLength++;
        }
    } while (idExists || currentLengthIdsCount >= maxIdsForCurrentLength);

    // Insert the new book with the generated unique ID
    const insertBookQuery = `INSERT INTO books (id, book_name, amazon_link, author_id) VALUES ($1, $2, $3, $4)`;
    await poolpg.query(insertBookQuery, [bookId, bookName, amazonLink, authorId]);
}

// Helper function to calculate the maximum number of IDs for a given length
function getMaxIdsForLength(length) {
    return 9 * Math.pow(10, length - 1); // For length N, there are 9 * 10^(N-1) possible IDs (e.g., 6 digits = 900000)
}

// Helper function to generate a random ID of the given length
function generateRandomId(length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}

// Helper function to check if a given ID exists in the 'books' table
async function checkIfIdExists(bookId) {
    const result = await poolpg.query(`SELECT id FROM books WHERE id = $1`, [bookId]);
    return result.rows.length > 0;
}

// Helper function to count the number of IDs of a given length in the 'books' table
async function getIdsCountByLength(length) {
    const result = await poolpg.query(`SELECT COUNT(*) AS count FROM books WHERE LENGTH(id::text) = $1`, [length]);
    return parseInt(result.rows[0].count, 10);
}
