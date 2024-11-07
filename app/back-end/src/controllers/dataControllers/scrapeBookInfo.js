const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { getAuthorsByIds } = require('../../utils/scrapeBookInfo_utils/getUtils');
const { getImage } = require('../../utils/scrapeBookInfo_utils/getImage');
const { getBookGenres } = require('../../utils/scrapeBookInfo_utils/getBookGenres');
const { getBookYear } = require('../../utils/scrapeBookInfo_utils/getBookYear');

let isScraping = false; // Lock variable

const scrapeBookInfo = async (req, res) => {
    if (isScraping) {
        return;
    }

    isScraping = true; // Set lock to prevent multiple simultaneous runs

    try {
        const client = await poolpg.connect();

        // Fetch books with missing publish_date (where bookInfo_status is null)
        const { rows: books } = await client.query(`
            SELECT books.id, books.book_name, books.author_id, books.amazon_link, authors.bookseriesinorder_link, authors.author_name 
            FROM books
            JOIN authors ON books.author_id::text = authors.id::text
            WHERE books.bookInfo_status IS NULL;
        `);

        if (books.length === 0) {
            console.log("No books to validate.");
            if (req.io) {
                req.io.emit('scrapeBookInfoMessage', 'No books to validate.');
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
            const { id, book_name, amazon_link, author_name, bookseriesinorder_link } = book;
            const searchQuery = `${book_name} book by ${author_name}`;
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

            console.log(`Processing book: ${book_name} by ${author_name}`);

            await sleep(5000); // Delay to avoid overwhelming the server

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

                if (bookseriesinorder_link) {
                    const bookYear = await getBookYear(bookseriesinorder_link, book_name, userAgent);
                }

                // Fetch the Google search result page
                const response = await axios.get(googleSearchUrl, {
                    headers: {
                        'User-Agent': userAgent,
                    },
                });

                const $ = cheerio.load(response.data);
                const bookInfoDiv = $('.Z1hOCe'); // Select the div with class 'Z1hOCe'

                let publishDate = null;
                let genre = null;

                if (bookInfoDiv.length > 0) {
                    // Find the span with 'Originally published'
                    const originallyPublishedSpan = bookInfoDiv.find('span:contains("Originally published")');
                    const publishDateSpan = originallyPublishedSpan.next('span').find('.LrzXr');

                    if (publishDateSpan.length > 0) {
                        publishDate = publishDateSpan.text().trim();
                    }

                    // Find the span with 'Genre' and get the next content
                    const genreSpan = bookInfoDiv.find('span:contains("Genre")');
                    const genreContent = genreSpan.next('span');

                    if (genreContent.length > 0) {
                        genre = genreContent.text().trim();
                    } else {
                        genre = await getBookGenres(author_name, book_name);
                    }
                }

                // Update the database with publish date and genre
                await client.query(
                    `UPDATE books SET publish_date = $1, genre = $2, image_link = $3, bookinfo_status = 'done', publish_year = $4 WHERE id = $5`,
                    [publishDate, genre, image_link, bookYear, id]
                );

                console.log(`Publish Date: ${publishDate || 'null'}`);
                console.log(`Publish year: ${bookYear || 'null'}`);
                console.log(`Genre: ${genre || 'null'}`);
                console.log(`Image Link: ${image_link || 'null'} from ${amazon_link}`);

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
                req.io.emit('scrapeBookInfoProgress', progress);
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

module.exports = { scrapeBookInfo };
