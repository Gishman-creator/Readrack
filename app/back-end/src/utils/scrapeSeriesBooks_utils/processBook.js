const poolpg = require('../../config/dbpg3'); // Your PostgreSQL pool setup
const { insertNewBook } = require('./insertNewBook');

exports.processBook = async (book_name, amazon_link, author_id, serie_id) => {
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

            // Insert the serie_id if it doesn't already exist
            const existingSeriesIds = book.serie_id ? book.serie_id.split(',') : [];
            if (!existingSeriesIds.includes(String(serie_id))) {
                const updatedSeriesIds = [...existingSeriesIds, String(serie_id)].join(',');
                await poolpg.query(
                    'UPDATE books SET serie_id = $1 WHERE book_name = $2',
                    [updatedSeriesIds, book_name]
                );
            }
        } else {
            // If the book does not exist, insert it with the author_id and serie_id
            await insertNewBook(book_name, amazon_link, author_id, serie_id);
        }
    } catch (error) {
        console.error('Error processing book:', error);
    }
};
