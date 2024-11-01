const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { getImage } = require('../../utils/scrapeBookInfo_utils/getImage');

let isScraping = false; // Lock variable

const scrapeBookImage = async (req, res) => {
    if (isScraping) {
        return;
    }

    isScraping = true; // Set lock to prevent multiple simultaneous runs

    try {
        const client = await poolpg.connect();

        // Fetch books with missing publish_date (where bookInfo_status is null)
        const { rows: books } = await client.query(`
            SELECT books.id, books.book_name, books.author_id, books.amazon_link, authors.bookseriesinorder_link 
            FROM books
            JOIN authors ON books.author_id::text = authors.id::text
            WHERE books.image_link is null and books.amazon_link is not null;
        `);

        if (books.length === 0) {
            console.log("No books to validate.");
            if (req.io) {
                req.io.emit('scrapeBookImageMessage', 'No books to validate.');
            }
            client.release();
            return;
        }

        const userAgent = await generateRandomUserAgent();
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Total books to process
        const totalBooks = books.length;
        let processedBooks = 0;

        // Loop through books and attempt to scrape the publish date and genre
        for (const book of books) { // Combine author names
            const { id, book_name, amazon_link, bookseriesinorder_link } = book;

            console.log(`Processing book: ${book_name} from ${amazon_link}`);

            // await sleep(5000); // Delay to avoid overwhelming the server

            try {
                // Validate the Amazon link
                let image_link = null; 
                if (amazon_link) {
                    // Valid link, fetch image
                    image_link = await getImage(userAgent, amazon_link);
                } else {
                    // Invalid or no link, skip image fetch
                    image_link = null;
                }

                // Update the database with publish date and genre
                await client.query(
                    `UPDATE books SET  image_link = $1 WHERE id = $2`,
                    [image_link, id]
                );

                console.log(`Image Link: ${image_link || 'null'}`);

            } catch (error) {
                console.error(`Error fetching data for book: ${book_name}, Error: ${error.message}`);
            }

            // Increment processed books count
            processedBooks++;

            // Calculate progress percentage
            const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
            const progress = `${processedBooks}/${totalBooks} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('scrapeBookImageProgress', progress);
            }
        }

        client.release();
        console.log("Book validation process completed.");
        isScraping = false; // Release lock after finishing
    } catch (error) {
        console.error('Error during book validation:', error.message);
        isScraping = false; // Release lock in case of error
    }
};

module.exports = { scrapeBookImage };
