const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { processBook } = require("../../utils/scrapeBookSeriesInOrder_utils/processBook");
const { areAuthorsSame } = require('../../utils/scrapeBookSeriesInOrder_utils/authorVerification');

let isValidating = false;

const scrapeBookSeriesInOrder = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch authors with bookseriesinorder_status as null
        const { rows: authors } = await client.query(`
            SELECT id, author_name, bookseriesinorder_link, pen_name FROM authors
            WHERE bookseriesinorder_status IS NULL;
        `);

        if (authors.length === 0) {
            console.log("No authors to scrape.");
            if (req.io) {
                req.io.emit('scrapeBookSeriesMessage', "No authors to scrape.");
            }
            client.release();
            isValidating = false;
            return;
        }

        const totalAuthors = authors.length;
        let processedAuthors = 0; // Track processed authors
        const userAgent = await generateRandomUserAgent();
        console.log('User Agent:', userAgent);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const author of authors) {
            await sleep(2000); // To avoid spamming the server

            const { id, author_name, bookseriesinorder_link, pen_name: existingPenNames } = author;
            const bookSeriesUrl = bookseriesinorder_link;

            // Scrape the books from the book series page
            const seriesResponse = await axios.get(bookSeriesUrl, {
                headers: { 'User-Agent': userAgent }
            });
            const seriesPage = cheerio.load(seriesResponse.data);

            // Find all divs with class 'list'
            const booksDivs = seriesPage('div.list');
            const books = [];
            let penNamesSet = new Set(existingPenNames ? existingPenNames.split(',') : []); // Store unique pen names

            booksDivs.each((index, bookDiv) => {
                let penName = null;

                // Get the h2 tag preceding the current bookDiv
                const h2Tag = seriesPage(bookDiv).prevAll('h2').first();

                // Find the span tag related to this h2 tag but only if it's before another div with class 'list'
                const spanTag = h2Tag.nextUntil('div.list', 'span.authors').first();
                
                if (spanTag.length > 0) { // If a valid span tag is found
                    const spanText = spanTag.text().trim().toLowerCase();
            
                    if (spanText.startsWith('as') && !spanText.startsWith('with')) {
                        penName = spanText.replace(/^as\s+/, '').trim(); // Remove 'as' and clean up
                        penNamesSet.add(penName); // Add the pen name to the set
                    }
                } else {
                    penName = null; // Explicitly set to null if no valid span is found
                }

                // Find all tables with id starting with "books" and exclude rows with class "hiderow"
                const booksTables = seriesPage(bookDiv).find('table[id^="books"]');

                // Loop through each valid table and extract book titles and Amazon links
                booksTables.each((index, table) => {
                    const rows = seriesPage(table).find('tr').not('.hiderow'); // Exclude rows with the class "hiderow"
                    rows.each((i, row) => {
                        const bookTitle = seriesPage(row).find('td.booktitle').text().trim();
                        const amazonLink = seriesPage(row).find('td a').attr('href');

                        if (bookTitle && amazonLink) {
                            books.push({ title: bookTitle, amazon: amazonLink, penName });
                            console.log(`Book: ${bookTitle}, Pen Name: ${penName}`);
                        }
                    });
                });
                penName = null;
            });

            if (books.length > 0) {
                console.log(`Books found for ${author_name} and link: ${bookSeriesUrl}`);
                for (const book of books) {
                    // console.log('Book:', book)
                    // Process each book (insert if new, update if exists), passing penName
                    await processBook(book.title, book.amazon, id, book.penName);
                }
            } else {
                console.log(`No books found for ${author_name}`);
                // await client.query(`UPDATE authors SET bookseriesinorder_status = 'updated' WHERE id = $1`, [id]);
            }

            // Update the author's pen names in the authors table
            const uniquePenNames = Array.from(penNamesSet).join(',');
            await client.query(`UPDATE authors SET pen_name = $1, bookseriesinorder_status = 'updated' WHERE id = $2`, [uniquePenNames, id]);

            // Increment processed authors count
            processedAuthors++;

            // Calculate progress percentage
            const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
            const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}`);

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('scrapeBookSeriesProgress', progress);
            }
        }

        client.release();
        isValidating = false;
        // res.status(200).json({ message: "Scraping completed successfully." });

    } catch (error) {
        console.error('Error during scraping:', error.message);
        isValidating = false;
        setTimeout(() => scrapeBookSeriesInOrder(req, res), 5000);
    }
};

module.exports = { scrapeBookSeriesInOrder };
