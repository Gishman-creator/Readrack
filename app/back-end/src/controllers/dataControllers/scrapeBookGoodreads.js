const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { bookVerification } = require('../../utils/scrapeBookInfo_utils/bookVerification');
const getAuthorName = require('../../utils/scrapeAuthorMedia/getAuthorName');

let isScraping = false; // Lock variable

const scrapeBookGoodreads = async (req, res) => {
    if (isScraping) {
        return;
    }

    isScraping = true; // Set lock to prevent multiple simultaneous runs

    try {
        const client = await poolpg.connect();

        // Fetch books with missing goodreads_link
        const { rows: books } = await client.query(`
            SELECT id, book_name, author_id
            FROM books
            WHERE publish_date is null and goodreads_link IS NULL;
        `);

        if (books.length === 0) {
            console.log("No books to validate.");
            if (req.io) {
                req.io.emit('scrapeBookGoodreadsMessage', 'No books to validate.');
            }
            client.release();
            return;
        }

        const userAgent = await generateRandomUserAgent();
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const totalBooks = books.length;
        let processedBooks = 0;
        let count = 0;

        for (const book of books) {
            const { id, book_name, author_id } = book;

            // Fetch author details
            const { rows: authors } = await client.query(
                `SELECT author_name FROM authors WHERE id = ANY($1::int[])`,
                [author_id.split(',').map(id => id.trim())]
            );

            const author_name = authors.map(author => author.author_name).join(', ');
            const searchQuery = `${book_name} book by ${author_name} on Goodreads`;
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

            console.log(`Processing book: ${book_name} by ${author_name}`);

            await sleep(20000);

            let found = false;
            let href = null;

            try {
                const response = await axios.get(googleSearchUrl, {
                    headers: {
                        'User-Agent': userAgent,
                    },
                });

                const $ = cheerio.load(response.data);

                // const allLinks = $('a[jsname="UWckNb"]')
                // for (let i = 0; i < allLinks.length; i++) {
                // console.log('links:', allLinks.find('h3').text())
                // }

                const links = $('a[jsname="UWckNb"]').filter((_, el) => {
                    const href = $(el).attr('href');
                    return href && href.includes('goodreads.com/book/show');
                });

                for (let i = 0; i < links.length; i++) {
                    const link = $(links[i]);
                    href = link.attr('href');
                    const title = link.find('h3').text();

                    console.log('title:', title);

                    if ((href && title && title.includes(book_name)) || (href && await bookVerification(title, book_name))) {
                        const authorName = await getAuthorName(href, userAgent);

                        if (authorName.includes(author_name) || author_name.includes(authorName)) {
                            console.log(`Search title: ${title}`);
                            found = true;
                            count++;
                        }

                        break; // Stop processing other links for this book
                    }
                }
            } catch (error) {
                console.error(`Error fetching data for book: ${book_name}, Error: ${error.message}`);
                if (error.response && error.response.status === 429) {
                    console.error("Rate limit exceeded. Stopping the scraping process.");
                    break; // Exit the loop if rate limit is exceeded
                } else {
                    console.error("Stopping due to an unexpected error.");
                    break; // Exit the loop on any other critical error
                }
            }

            // Ensure the goodreads_link is updated even if no valid link is found
            await client.query(
                `UPDATE books SET goodreads_link = $1 WHERE id = $2`,
                [found ? href : 'none', id]
            );

            console.log(`Goodreads link: ${found ? href : 'none'}`);
            processedBooks++;
            const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
            const countPercentage = ((count / processedBooks) * 100).toFixed(2);
            const progress = `${processedBooks}/${totalBooks} (${progressPercentage}%)`;
            const countProgress = `${count}/${processedBooks} (${countPercentage}%)`;
            console.log(`Progress: ${progress} | Count: ${countProgress}\n`);

            if (req.io) {
                req.io.emit('scrapeBookGoodreadsProgress', progress);
            }
        }

        client.release();
        console.log("Goodreads link validation process completed.");
        isScraping = false; // Release lock after finishing
    } catch (error) {
        console.error('Error during Goodreads link validation:', error.message);
        isScraping = false; // Release lock in case of error
    }
};

module.exports = { scrapeBookGoodreads };
