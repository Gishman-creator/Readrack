const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { processBook } = require('../../utils/scrapeSeriesBooks_utils/processBook');

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
            SELECT s.id, s.serie_name, s.author_id, a.good_reads_profile 
            FROM series s 
            JOIN authors a ON s.author_id::text = a.id::text
            WHERE s.book_status IS NULL;
        `);

        if (seriesList.length === 0) {
            console.log("No series to scrape.");
            if (req.io) req.io.emit('scrapeSeriesBooksMessage', "No series to scrape.");
            client.release();
            isValidating = false;
            return;
        }

        const userAgent = await generateRandomUserAgent();
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        let processedSeries = 0;
        const totalSeries = seriesList.length;

        // Process each series in seriesList
        for (const serie of seriesList) {
            const { id: seriesId, serie_name, author_id, good_reads_profile } = serie;

            let authorNames = '';
            // Skip if author_id contains a comma (i.e., multiple authors)
            const authorIds = author_id.includes(',')
                ? author_id.split(',').map(id => parseInt(id.trim(), 10))
                : [parseInt(author_id.trim(), 10)]; // Make sure author_id is also an array

            // console.log("AuthorIds:", authorIds);

            // Fetch all author names from the database using the list of author IDs
            const { rows: authorNamesData } = await client.query(`
            SELECT author_name 
            FROM authors
            WHERE id = ANY($1::int[])
            `, [authorIds]);

            // Combine all author names into a single string
            authorNames = authorNamesData.map(author => author.author_name).join(', ');

            console.log(`Processing series: ${serie_name} by ${authorNames}`);

            if (!good_reads_profile || author_id.includes(',')) {
                console.log(`No Goodreads profile link found for author: ${authorNames}`);
                processedSeries++;
                continue;
            }

            // Fetch the Goodreads profile page
            const profileResponse = await axios.get(good_reads_profile, {
                headers: { 'User-Agent': userAgent }
            });
            const profilePage = cheerio.load(profileResponse.data);

            // Find the 'Series by' link
            const seriesLink = profilePage('div.clearFloats.bigBox a').filter((_, el) => {
                return profilePage(el).text().startsWith('Series by');
            }).attr('href');

            if (!seriesLink) {
                console.log(`No 'Series by' link found for author: ${authorNames}`);
                processedSeries++;
                continue;
            }

            // Navigate to the series list page
            const fullSeriesLink = `https://www.goodreads.com${seriesLink}`;
            const seriesResponse = await axios.get(fullSeriesLink, {
                headers: { 'User-Agent': userAgent }
            });
            const seriesPage = cheerio.load(seriesResponse.data);

            // Select the book rows
            const booksDivs = seriesPage('div.bookRow.seriesBookRow');
            const books = [];

            let matchedTag = null;
            let numBooks = 0;
            let goodreadsLink = '';

            // Iterate through each bookRow
            booksDivs.each((_, row) => {
                const bookTitle = seriesPage(row).find('a.bookTitle').text().trim().toLowerCase();
                const serieNameLower = serie_name.toLowerCase();

                // Verify if the book title matches the series name
                if (serieNameLower.includes(bookTitle) || bookTitle.includes(serieNameLower)) {
                    matchedTag = seriesPage(row).find('a.bookTitle');
                    const bookMetaText = seriesPage(row).find('.bookMeta').text();
                    const numBooksMatch = bookMetaText.match(/\((\d+) books?\)/);

                    // If the match is found, extract the number of books; otherwise, default to 0
                    numBooks = numBooksMatch ? numBooksMatch[1] : 0;
                    goodreadsLink = `https://www.goodreads.com${matchedTag.attr('href')}`;
                    return false; // Break out of the loop
                }
            });

            if (!matchedTag) {
                console.log(`No matching series found for series: ${serie_name}`);
                await client.query(`UPDATE series SET book_status = 'done' WHERE id = $1`, [seriesId]);
                processedSeries++;
                const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
                const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
                console.log(`Progress: ${progress}\n`);
                if (req.io) req.io.emit('scrapeSeriesBooksMessage', `Progress: ${progress}`);
                continue;
            }

            console.log("Number of books:", numBooks);
            console.log("Goodreads link:", goodreadsLink);


            await processBook(userAgent, numBooks, author_id, seriesId, goodreadsLink);

            await client.query(`UPDATE series SET book_status = 'done', goodreads_link = $1, num_books = $2 WHERE id = $3`, [goodreadsLink, numBooks, seriesId]);
            processedSeries++;
            const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
            const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);
            if (req.io) req.io.emit('scrapeSeriesBooksMessage', `Progress: ${progress}`);
        }

        client.release();
        isValidating = false;

        if (req.io) req.io.emit('scrapeSeriesBooksMessage', "Series scraping completed.");

    } catch (error) {
        console.error("Error in scrapeSeriesBooks:", error);
        isValidating = false;
    }
};

module.exports = { scrapeSeriesBooks };
