const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { getAuthorsByIds } = require('../../utils/scrapeBookInfo_utils/getUtils');
const { getImage } = require('../../utils/scrapeBookInfo_utils/getImage');
const { getBookGenres } = require('../../utils/scrapeBookInfo_utils/getBookGenres');
const { getBookYear } = require('../../utils/scrapeBookInfo_utils/getBookYear');
const { getAmazonLink } = require('../../utils/scrapeBookInfo_utils/getAmazonLink');

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
            SELECT *
            FROM books
            WHERE bookInfo_status IS NULL OR image_link is null;
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
            const { id, book_name, amazon_link, author_id, goodreads_link, image_link: book_image_link, genre: book_genre } = book;

            // Split author_id into an array
            const authorIds = author_id.split(',').map(id => id.trim());

            // Fetch author details
            const { rows: authors } = await client.query(
                `SELECT author_name, bookseriesinorder_link FROM authors WHERE id = ANY($1::int[])`,
                [authorIds]
            );

            // Concatenate author names and get the first bookseriesinorder_link
            const author_name = authors.map(author => author.author_name).join(', ');
            const bookseriesinorder_link = authors[0]?.bookseriesinorder_link || null;

            const searchQuery = `${book_name} book by ${author_name}`;
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

            console.log(`Processing book: ${book_name} by ${author_name}`);

            await sleep(20000); // Delay to avoid overwhelming the server

            try {
                // Initialize bookYear to null by default
                let bookYear = null;
                let book_amazon_link = amazon_link;

                // Validate the Amazon link
                let image_link = book_image_link;
                console.log("Book image link:", image_link)
                if (amazon_link && !book_image_link) {
                    // Valid link, fetch image
                    image_link = await getImage(userAgent, amazon_link);
                }
                
                if (!amazon_link || !image_link && !book_image_link) {
                    // Invalid or no link, skip image fetch
                    book_amazon_link = await getAmazonLink(userAgent, book_name, author_name);
                    console.log("Amazon link got from getAmazonLink:", book_amazon_link);
                    image_link = book_amazon_link ? await getImage(userAgent, book_amazon_link) : null;
                }
                
                if (bookseriesinorder_link) {
                    // console.log("Getting book year from:", bookseriesinorder_link);
                    bookYear = await getBookYear(bookseriesinorder_link, goodreads_link, book_name, userAgent);
                    // console.log("Book yaer:", bookYear); 
                }
                
                let genre = !book_genre && await getBookGenres(author_name, book_name);

                // Fetch the Google search result page
                const response = await axios.get(googleSearchUrl, {
                    headers: {
                        'User-Agent': userAgent,
                    },
                });

                const $ = cheerio.load(response.data);
                const bookInfoDiv = $('.Z1hOCe'); // Select the div with class 'Z1hOCe'

                let publishDate = null;

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
                    }
                }

                // Update the database with publish date and genre
                await client.query(
                    `UPDATE books SET publish_date = $1, genre = $2, image_link = $3, bookinfo_status = 'done', publish_year = $4, amazon_link = $5 WHERE id = $6`,
                    [publishDate, genre || book_genre, image_link || book_image_link, bookYear, book_amazon_link, id]
                );

                console.log(`Publish Date: ${publishDate || 'null'}`);
                console.log(`Publish year: ${bookYear || 'null'}`);
                console.log(`Genre: ${genre || 'null'}`);
                console.log(`Image Link: ${image_link || 'null'} from ${book_amazon_link}`);

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
