const axios = require("axios");
const cheerio = require("cheerio");
const poolpg = require("../../config/dbpg3");

let isFetching = false;

const validateBookPublishDate = async (req, res) => {
    if (isFetching) {
        return;
    }

    isFetching = true;

    try {
        const client = await poolpg.connect();

        // Fetch books with missing `publish_date` but valid `goodreads_link`
        const { rows: books } = await client.query(`
            SELECT id, book_name, goodreads_link 
            FROM books 
            WHERE publish_date IS NULL 
            AND goodreads_link IS NOT NULL;
        `);

        if (books.length === 0) {
            console.log("No books found with missing publish_date and valid Goodreads link.");
            if (req.io) {
                req.io.emit('fetchMessage', 'No books found with missing publish_date and valid Goodreads link.');
            }
            client.release();
            isFetching = false;
            return;
        }

        const totalBooks = books.length;
        let processedBooks = 0;

        for (const book of books) {
            try {
                const { id, book_name, goodreads_link } = book;
                console.log(`Fetching publish date for: ${book_name}`);

                // Fetch the Goodreads page
                const response = await axios.get(goodreads_link);
                const $ = cheerio.load(response.data);

                // Extract the publication date
                const publicationInfo = $('p[data-testid="publicationInfo"]').text();
                const publishDate = publicationInfo.replace(/.*\b\w*publi\w*\b\s*/, "").trim();

                if (publishDate) {
                    // Update the publish_date in the database
                    await client.query(
                        `UPDATE books SET publish_date = $1 WHERE id = $2`,
                        [publishDate, id]
                    );

                    console.log(`Updated publish_date for book ID ${id}: ${publishDate}`);
                } else {
                    console.log(`No valid publish date found for book ID ${id}`);
                }

                processedBooks++;
                const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
                console.log(`Progress: ${processedBooks}/${totalBooks} (${progressPercentage}%)\n`);

                // Emit progress if using Socket.IO
                if (req.io) {
                    req.io.emit('fetchPublishDateProgress', `${processedBooks}/${totalBooks}`);
                }
            } catch (bookError) {
                console.error(`Error processing book ID ${book.id}:`, bookError.message);
            }
        }

        // Release the client connection
        client.release();
        isFetching = false;

        console.log("Publish date fetching and updating completed.");
        if (req.io) {
            req.io.emit('fetchMessage', 'Publish date fetching and updating completed.');
        }

    } catch (error) {
        console.error("Error during publish date fetching:", error.message);
        isFetching = false;
        setTimeout(() => validateBookPublishDate(req, res), 5000);
    }
};

module.exports = { validateBookPublishDate };
