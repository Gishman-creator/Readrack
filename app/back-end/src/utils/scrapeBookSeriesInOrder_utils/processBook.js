const poolpg = require('../../config/dbpg3'); // Your PostgreSQL pool setup
const { insertNewBook } = require('./insertNewBook');

exports.processBook = async (bookName, amazonLink, currentAuthorId) => {
    // Query to check if the book exists
    const checkBookQuery = `SELECT id, author_id FROM books WHERE book_name = $1`;
    const bookResult = await poolpg.query(checkBookQuery, [bookName]);

    if (bookResult.rows.length > 0) {
        // Book exists, check if the author ID is already associated with it
        const book = bookResult.rows[0];
        const existingAuthorIds = book.author_id.split(',').map(id => id.trim());

        if (!existingAuthorIds.includes(currentAuthorId)) {
            // Add the new author ID
            existingAuthorIds.push(currentAuthorId);
            const updatedAuthorIds = existingAuthorIds.join(',');
            await poolpg.query(`UPDATE books SET author_id = $1 WHERE id = $2`, [updatedAuthorIds, book.id]);
        }
    } else {
        // Book doesn't exist, insert a new book
        await insertNewBook(bookName, amazonLink, currentAuthorId);
    }
}
