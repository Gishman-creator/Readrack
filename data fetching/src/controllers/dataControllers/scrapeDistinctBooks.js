const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { insertNewBook } = require('../../utils/scrapeDistinctBooks_utils/insertNewBook');

let isValidating = false;

const scrapeDistinctBooks = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch books with author_id containing commas
        const { rows: booksList } = await client.query(`
            SELECT DISTINCT id, author_id, book_name 
            FROM books 
            WHERE author_id ILIKE '%,%';
        `);

        if (booksList.length === 0) {
            console.log("No books with multiple author IDs to scrape.");
            if (req.io) {
                req.io.emit('scrapeBooksMessage', "No books with multiple author IDs to scrape.");
            }
            client.release();
            isValidating = false;
            return;
        }

        const userAgent = await generateRandomUserAgent();
        console.log('User Agent:', userAgent);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        let processedBooks = 0; // Counter for processed books
        const totalBooks = booksList.length; // Total number of books to process

        // Process each book in booksList
        for (const book of booksList) {
            const { id, book_name, author_id } = book;

            const authorIds = author_id.split(',').map(id => id.trim());

            // Fetch the author's book series link and name
            const { rows: authorData } = await client.query(`
                SELECT id, bookseriesinorder_link, author_name 
                FROM authors 
                WHERE id = ANY($1::int[])
            `, [authorIds]);

            if (authorData.length === 0) {
                console.log(`No author data found for book: ${book_name}\n`);
                processedBooks++;
                continue; // Skip to the next book if no author data is found
            }

            // Combine all author names into a single string
            const authorNames = authorData.map(author => author.author_name).join(', ');

            console.log(`Processing ${book_name} by ${authorNames}`);

            // Loop through each author to scrape the Amazon link for the book
            for (const author of authorData) {
                const { id: authorId, bookseriesinorder_link, author_name } = author;

                if (!bookseriesinorder_link) {
                    console.log(`No book series link found for author of book: ${book_name}\n`);
                    continue; // Skip if no link is found
                }

                // Fetch the book series page
                const seriesResponse = await axios.get(bookseriesinorder_link, {
                    headers: { 'User-Agent': userAgent }
                });
                const seriesPage = cheerio.load(seriesResponse.data);

                // Find the book_name in the page
                const bookBook_nameElement = seriesPage(`td.booktitle:contains("${book_name}")`);

                // Find the parent div that contains the table (class 'list')
                const listDiv = bookBook_nameElement.closest('div.list');
                
                // Now find the first h2 outside of this div
                const h2Tag = listDiv.prevAll('h2').first();
                let penName = null;

                // Check if the span with 'as' is found
                const spanTag = h2Tag.nextUntil('div.list', 'span.authors').first();
                
                if (spanTag.length > 0) { // If a valid span tag is found
                    const spanText = spanTag.text().trim().toLowerCase();
            
                    if (spanText.startsWith('as') && !spanText.startsWith('with')) {
                        penName = spanText.replace(/^as\s+/, '').split(',')[0].trim(); // Remove 'as' and clean up
                    }
                } else {
                    penName = null; // Explicitly set to null if no valid span is found
                }

                if (bookBook_nameElement.length === 0) {
                    console.log(`No matching book found for book_name: ${book_name}\n`);
                    continue; // Skip to the next book if no match is found
                }

                // Find the Amazon link in the same row as the book title
                const amazonLinkElement = bookBook_nameElement.closest('tr').find('a[href*="amazon.com"]');
                const amazonLink = amazonLinkElement.attr('href');

                if (!amazonLink) {
                    console.log(`No Amazon link found for book: ${book_name}\n`);
                    continue; // Skip if no Amazon link is found
                }

                // Insert the new book into the database
                await insertNewBook(book_name, amazonLink, authorId, penName);

                console.log(`Inserted book: ${book_name} on ${penName} by ${author_name}`);
            }

            // const { rows: deleteBook } = await client.query(`
            //     delete 
            //     FROM books 
            //     WHERE id = $1
            // `, [id]);

            processedBooks++;

            // Emit progress to the client if connected
            const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
            const progress = `${processedBooks}/${totalBooks} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);
            if (req.io) {
                req.io.emit('scrapeBooksProgress', progress);
            }
        }

        client.release();
        isValidating = false;

    } catch (error) {
        console.error('Error during scraping:', error.message);
        isValidating = false;
        setTimeout(() => scrapeDistinctBooks(req, res), 5000); // Retry after 5 seconds
    }
};

module.exports = { scrapeDistinctBooks };
