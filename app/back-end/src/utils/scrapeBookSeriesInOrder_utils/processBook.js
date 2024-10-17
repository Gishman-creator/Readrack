const poolpg = require('../../config/dbpg3'); // Your PostgreSQL pool setup
const { insertNewBook } = require('./insertNewBook');

exports.processBook = async (book_name, amazon_link, author_id, pen_name) => {
    try {
        // Check if the book already exists in the database by book_name
        const existingBook = await poolpg.query(
            'SELECT * FROM books WHERE book_name = $1',
            [book_name]
        );

        if (existingBook.rows.length > 0) {
            const book = existingBook.rows[0];

            // Update author_id if it's not already associated with the book
            const existingAuthorIds = book.author_id ? book.author_id.split(',') : [];
            if (!existingAuthorIds.includes(String(author_id))) {
                const updatedAuthorIds = [...existingAuthorIds, String(author_id)].join(',');
                await poolpg.query(
                    'UPDATE books SET author_id = $1 WHERE book_name = $2',
                    [updatedAuthorIds, book_name]
                );
            }

            // If pen_name already exists, don't add it again. Otherwise, append it.
            const existingPenNames = book.pen_name ? book.pen_name.split(',') : [];
            if (pen_name && !existingPenNames.includes(pen_name)) {
                const updatedPenNames = [...existingPenNames, pen_name].join(',');
                await poolpg.query(
                    'UPDATE books SET pen_name = $1 WHERE book_name = $2',
                    [updatedPenNames, book_name]
                );
            }
        } else {
            // If the book does not exist, insert it with the author_id and pen_name
            await insertNewBook(book_name, amazon_link, author_id, pen_name);
        }
    } catch (error) {
        console.error('Error processing book:', error);
    }
}
