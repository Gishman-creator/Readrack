const poolpg = require('../../config/dbpg');
const { deleteImage } = require('../../utils/imageUtils');

/**
 * Deletes data from the specified table based on the type and ids provided.
 * @param {string} type - The type of data to delete ('authors', 'series' or 'books').
 * @param {Array<number>} ids - An array of ids to delete from the specified table.
 * @returns {Object} - Result of the deletion query.
 */


async function decrementNumBooks(authorId) {
    try {
        await poolpg.query('UPDATE authors SET num_books = num_books - 1 WHERE id = ANY($1::int[]) AND num_books > 0', [authorId]);
    } catch (error) {
        console.error(`Failed to decrement num_books for author with ID ${authorId}:`, error.message);
    }
}

exports.deleteData = async (req, res) => {
    const { type, ids } = req.body;

    if (!type || !ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "Invalid request. 'type' and 'ids' must be provided." });
    }

    const validTypes = ['authors', 'series', 'books'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid type. Valid types are 'authors', 'series' or 'books'." });
    }

    try {
        // Ensure IDs are integers to prevent SQL injection
        const idsArray = ids.map(id => parseInt(id, 10));

        if (type === 'series') {
            for (const serieId of idsArray) {
                // Fetch the imageKey for the series
                const { rows: series } = await poolpg.query('SELECT image FROM series WHERE id = $1', [serieId]);

                if (series.length > 0 && series[0].image) {
                    // Delete the image from S3 if exists
                    await deleteImage(series[0].image);
                }

                // Fetch books with the series ID
                const { rows: books } = await poolpg.query('SELECT id, serie_id, author_id, image FROM books WHERE serie_id::text LIKE $1', [`%${serieId}%`]);

                for (const book of books) {
                    // Delete the book's image from S3
                    if (book.image) {
                        await deleteImage(book.image);
                    }

                    const serieIds = book.serie_id.split(',');

                    if (serieIds.length === 1 && serieIds[0] === serieId.toString()) {
                        // Only one series in serie_id, delete the book
                        await poolpg.query('DELETE FROM books WHERE id = $1', [book.id]);
                    } else {
                        // Multiple series, remove this serieId from serie_id field
                        const updatedSerieIds = serieIds.filter(id => id !== serieId.toString()).join(',');
                        await poolpg.query('UPDATE books SET serie_id = $1 WHERE id = $2', [updatedSerieIds, book.id]);
                    }

                    const authorIds = book.author_id.split(',').map(id => id.trim());

                    // Decrement num_books of the remaining author
                    await decrementNumBooks(authorIds);
                }

                // Delete the series itself
                await poolpg.query('DELETE FROM series WHERE id = $1', [serieId]);
            }
        } else if (type === 'authors') {
            for (const authorId of idsArray) {
                // Fetch the imageKey for the author
                const { rows: authors } = await poolpg.query('SELECT image FROM authors WHERE id = $1', [authorId]);

                if (authors.length > 0 && authors[0].image) {
                    // Delete the image from S3 if exists
                    await deleteImage(authors[0].image);
                }

                // Delete the author from authors table
                await poolpg.query('DELETE FROM authors WHERE id = $1', [authorId]);

                // Handle books of this author
                const { rows: books } = await poolpg.query('SELECT id, author_id, image FROM books WHERE author_id::text LIKE $1', [`%${authorId}%`]);

                for (const book of books) {
                    // Delete the book's image from S3
                    if (book.image) {
                        await deleteImage(book.image);
                    }

                    const authorIds = book.author_id.split(',');

                    if (authorIds.length === 1 && authorIds[0] === authorId.toString()) {
                        // Only one author in author_id, delete the book
                        await poolpg.query('DELETE FROM books WHERE id = $1', [book.id]);
                    } else {
                        // Multiple authors, remove this authorId from author_id field
                        const updatedAuthorIds = authorIds.filter(id => id !== authorId.toString()).join(',');
                        await poolpg.query('UPDATE books SET author_id = $1 WHERE id = $2', [updatedAuthorIds, book.id]);
                    }
                }

                // Delete series associated with this author
                await poolpg.query('DELETE FROM series WHERE author_id::text = $1::text', [authorId]);
            }
        } else if (type === 'books') {
            for (const bookId of idsArray) {
                // Fetch the imageKey for the book
                const { rows: books } = await poolpg.query('SELECT image, author_id FROM books WHERE id = $1', [bookId]);

                if (books.length > 0 && books[0].image) {
                    // Delete the image from S3 if exists
                    await deleteImage(books[0].image);
                }

                if (rows.length) {
                    const authorIds = rows[0].author_id.split(',');

                    // Decrement num_books for each author associated with this book
                    for (const authorId of authorIds) {
                        await decrementNumBooks(authorId);
                    }

                    // Delete the book
                    await poolpg.query('DELETE FROM books WHERE id = $1', [bookId]);
                }
            }
        }

        // Emit a Socket.IO event if available
        if (req.io) {
            req.io.emit('dataDeleted', { ids, type });
        }

        return res.status(200).json({ message: `${idsArray.length} record(s) successfully deleted.` });

    } catch (error) {
        console.error('❌ Error deleting data:', error.message);
        return res.status(500).json({ error: 'An error occurred while deleting data.' });
    }
};
