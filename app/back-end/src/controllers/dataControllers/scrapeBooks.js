const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { serieVerification } = require('../../utils/scrapeBooks_utils/serieVerification');

let isValidating = false;

const scrapeBooks = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch books with multiple series IDs
        const { rows: booksList } = await client.query(`
            SELECT id, book_name, serie_id, author_id 
            FROM books 
            WHERE serie_id ILIKE '%,%';
        `);

        if (booksList.length === 0) {
            console.log("No books with multiple series IDs to scrape.");
            if (req.io) {
                req.io.emit('scrapeBooksMessage', "No books with multiple series IDs to scrape.");
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
            const { id: bookId, book_name, serie_id, author_id } = book;

            // Skip if author_id contains a comma (i.e., multiple authors)
            if (author_id.includes(',')) {
                const authorIds = author_id.split(',').map(id => id.trim());

                // Fetch all author names from the database using the list of author IDs
                const { rows: authorNamesData } = await client.query(`
                    SELECT author_name 
                    FROM authors 
                    WHERE id = ANY($1::int[])
                `, [authorIds]);

                // Combine all author names into a single string
                const authorNames = authorNamesData.map(author => author.author_name).join(', ');

                // Log the book title and its authors
                console.log(`Skipping book with multiple authors: ${book_name} by ${authorNames}\n`);
                processedBooks++;
                continue;
            }

            // Fetch the author's book series link
            const { rows: authorData } = await client.query(`
                SELECT bookseriesinorder_link 
                FROM authors 
                WHERE id = $1
            `, [author_id]);

            if (authorData.length === 0 || !authorData[0].bookseriesinorder_link) {
                console.log(`No book series link found for author of book: ${book_name}\n`);
                processedBooks++;
                continue; // Skip to the next book if no link is found
            }

            const bookSeriesLink = authorData[0].bookseriesinorder_link;
            console.log(`Processing ${book_name} from ${bookSeriesLink}`);

            // Fetch the book series page
            const seriesResponse = await axios.get(bookSeriesLink, {
                headers: { 'User-Agent': userAgent }
            });
            const seriesPage = cheerio.load(seriesResponse.data);

            // Find the book book_name in the page
            const bookBook_nameElement = seriesPage(`td.booktitle:contains("${book_name}")`);

            if (bookBook_nameElement.length === 0) {
                console.log(`No matching book found for book_name: ${book_name}\n`);
                processedBooks++;
                continue; // Skip to the next book if no match is found
            }

            // Find the first <h2> above the book book_name
            const h2Tag = bookBook_nameElement.closest('div.list').prevAll('h2').first().text().trim();

            if (!h2Tag) {
                console.log(`No h2 tag found for book: ${book_name}\n`);
                processedBooks++;
                continue; // Skip to the next book if no h2 tag is found
            }

            console.log(`Found h2 tag: ${h2Tag}`);

            // Verify the series name using the h2Tag
            const verifiedSerieName = await serieVerification(h2Tag);

            console.log(`Series name verified: ${verifiedSerieName}`);

            if (!verifiedSerieName) {
                console.log(`Failed to verify series for h2 tag: ${h2Tag}\n`);
                processedBooks++;
                continue; // Skip if the series verification fails
            }

            // Check if the series exists in the database
            const { rows: matchingSeries } = await client.query(`
                SELECT id, serie_name 
                FROM series 
                WHERE serie_name ILIKE $1
            `, [verifiedSerieName]);

            // Update the serie_id for the book if a match is found, otherwise set it to NULL
            if (matchingSeries.length > 0) {
                const serieId = matchingSeries[0].id;
                const serie = matchingSeries[0].serie_name;
                // await client.query(`
                //     UPDATE books 
                //     SET serie_id = $1 
                //     WHERE id = $2
                // `, [serieId, bookId]);
                console.log(`Updated book ${book_name} with series serie: ${serie}`);
            } else {
                // await client.query(`
                //     UPDATE books 
                //     SET serie_id = NULL 
                //     WHERE id = $1
                // `, [bookId]);
                console.log(`Set serie_id to NULL for book: ${book_name}`);
            }

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
        setTimeout(() => scrapeBooks(req, res), 5000); // Retry after 5 seconds
    }
};

module.exports = { scrapeBooks };
