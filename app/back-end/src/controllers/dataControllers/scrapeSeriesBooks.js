const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { processBook } = require("../../utils/scrapeSeriesBooks_utils/processBook");
const { serieVerification } = require('../../utils/scrapeSeriesBooks_utils/serieVerification');

let isValidating = false;

const scrapeSeriesBooks = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch series where book_status is null
        const { rows: seriesList } = await client.query(`
            SELECT s.id, s.serie_name, s.author_id, a.bookseriesinorder_link, a.author_name 
            FROM series s 
            JOIN authors a ON s.author_id::text = a.id::text
            WHERE s.book_status IS NULL;
        `);

        if (seriesList.length === 0) {
            console.log("No series to scrape.");
            if (req.io) {
                req.io.emit('scrapeSeriesBooksMessage', "No series to scrape.");
            }
            client.release();
            isValidating = false;
            return;
        }

        const userAgent = await generateRandomUserAgent();
        console.log('User Agent:', userAgent);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        let processedSeries = 0; // Counter for processed series
        const totalSeries = seriesList.length; // Total number of series to process

        // Process each series in seriesList
        for (const serie of seriesList) {
            const { id: seriesId, serie_name, author_id, bookseriesinorder_link, author_name } = serie;
            // await sleep(2000); // To avoid spamming the server

            console.log(`Processing serie ${serie_name}: ${seriesId} by ${author_name} on ${bookseriesinorder_link}`);

            if (!bookseriesinorder_link) {
                console.log(`No link found for series: ${serie_name}`);
                continue; // Skip to the next series if no link is found
            }

            // Fetch the book series page
            const seriesResponse = await axios.get(bookseriesinorder_link, {
                headers: { 'User-Agent': userAgent }
            });
            const seriesPage = cheerio.load(seriesResponse.data);

            const booksDivs = seriesPage('div.list'); // The divs containing the book data
            const books = [];

            // Gather h2 tags for verification
            const h2Tags = seriesPage('h2').map((_, el) => seriesPage(el).text().trim().toLowerCase()).get();
            let matchedTag = null;

            // Match h2 tags with the current series name
            for (const h2Tag of h2Tags) {
                if (await serieVerification(h2Tag, serie_name)) { // Ensure correct async function call
                    matchedTag = h2Tag;
                    break;
                }
            }

            if (!matchedTag) {
                console.log(`No matching series for h2 tags for series: ${serie_name}`);
                // Update the processed series counter
                await client.query(`UPDATE series SET book_status = 'done' WHERE id = $1`, [seriesId]);
                processedSeries++;

                // Calculate progress percentage
                const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
                const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
                console.log(`Progress: ${progress}\n`);

                // Emit progress to the client if connected
                if (req.io) {
                    req.io.emit('scrapeSeriesBooksProgress', progress);
                }

                continue; // Skip to the next series if no match is found
            }

            // Loop over each div with class 'list' and find books associated with the matched h2 tag
            booksDivs.each((index, bookDiv) => {
                const currentH2Tag = seriesPage(bookDiv).prevAll('h2').first().text().trim().toLowerCase();
                const booksTables = seriesPage(bookDiv).find('table[id^="books"]');

                if (currentH2Tag !== matchedTag) {
                    return; // Skip this div if the h2 tag doesn't match
                }

                booksTables.each((_, table) => {
                    const rows = seriesPage(table).find('tr').not('.hiderow');
                    rows.each((i, row) => {
                        const bookTitle = seriesPage(row).find('td.booktitle').text().trim();
                        const amazonLink = seriesPage(row).find('td a').attr('href');
                        if (bookTitle && amazonLink) {
                            books.push({ title: bookTitle, amazon: amazonLink, author_id, seriesId: seriesId });
                        }
                    });
                });
            });

            // Process books by series
            for (const book of books) {
                console.log(`Processing book: ${book.title}`);
                await processBook(book.title, book.amazon, author_id, seriesId);
            }

            // Update the status of processed series
            console.log(`Processed serie: ${serie_name}`);
            await client.query(`UPDATE series SET book_status = 'done' WHERE id = $1`, [seriesId]);

            // Update the processed series counter
            processedSeries++;

            // Calculate progress percentage
            const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
            const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            // Emit progress to the client if connected
            if (req.io) {
                req.io.emit('scrapeSeriesBooksProgress', progress);
            }
        }

        client.release();
        isValidating = false;

    } catch (error) {
        console.error('Error during scraping:', error.message);
        isValidating = false;
        setTimeout(() => scrapeSeriesBooks(req, res), 5000); // Retry after 5 seconds
    }
};

module.exports = { scrapeSeriesBooks };
