const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { areAuthorsSame } = require('../../utils/scrapeSeries/authorVerification');
const { processSerie } = require('../../utils/scrapeSeries/processSerie');
const { serieVerification } = require('../../utils/scrapeSeries/serieVerification');
const { insertNewSerie } = require('../../utils/scrapeSeries/insertNewSerie');

let isValidating = false;

const scrapeSeries = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch authors with series_status as null
        const { rows: authors } = await client.query(`
            SELECT id, author_name, goodreads_link FROM authors
            WHERE series_status IS NULL;
        `);

        if (authors.length === 0) {
            console.log("No authors to scrape.");
            if (req.io) {
                req.io.emit('scrapeSeriesMessage', "No authors to scrape.");
            } 
            client.release();
            isValidating = false;
            return; 
        }

        const totalAuthors = authors.length;
        let processedAuthors = 0;
        const userAgent = await generateRandomUserAgent();
        console.log('User Agent:', userAgent);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const author of authors) {

            const { id, author_name, goodreads_link } = author;
            console.log("Processing author:", author_name)

            // Fetch the Goodreads author page
            const authorResponse = await axios.get(goodreads_link, {
                headers: { 'User-Agent': userAgent }
            });
            const authorPage = cheerio.load(authorResponse.data);

            // Look for a series link on the author's Goodreads page
            const seriesLink = authorPage('a').filter((i, el) => {
                const href = authorPage(el).attr('href');
                return href && href.startsWith("/series/list");
            }).attr('href');

            if (!seriesLink) {
                console.log(`No series found for author: ${author_name}`);
                await client.query(`UPDATE authors SET series_status = 'done' WHERE id = $1`, [id]);
                processedAuthors++;
                continue;
            }

            let page = 1;  // Start with page 1

            while (true) {
                const pagedSeriesUrl = `https://www.goodreads.com${seriesLink}&page=${page}`;
                // const pagedSeriesUrl = `https://www.goodreads.com/series/list?id=1221698.Neil_Gaiman&page=${page}`;
                console.log(`Fetching series page: ${pagedSeriesUrl}`);
            
                const seriesResponse = await axios.get(pagedSeriesUrl, {
                    headers: { 'User-Agent': userAgent }
                });
            
                const seriesPage = cheerio.load(seriesResponse.data);
            
                // Scrape the series names from the current page
                const bookTitleElements = seriesPage('a.bookTitle').toArray();
            
                if (bookTitleElements.length === 0) {
                    console.log(`No more series found on page ${page}. Ending pagination.`);
                    break;  // Exit the loop if there are no book titles on this page
                }
            
                for (const el of bookTitleElements) {
                    const serie_name = seriesPage(el).text().trim();
                    const href = seriesPage(el).attr('href');
                    const link = `https://www.goodreads.com${href}`;
                    console.log(`Serie: ${serie_name} from: ${link}`);
                    await insertNewSerie(serie_name, id, link);
                }
            
                page++;  // Go to the next page
            }
            

            // Mark series scraping as done 
            await client.query(`UPDATE authors SET series_status = 'done' WHERE id = $1`, [id]);

            // Increment processed authors count
            processedAuthors++;

            // Calculate progress percentage
            const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
            const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            if (req.io) {
                req.io.emit('scrapeSeriesProgress', progress);
            }
        }

        client.release();
        isValidating = false;

    } catch (error) {
        console.error('Error during scraping:', error.message);
        isValidating = false;
        setTimeout(() => scrapeSeries(req, res), 5000); // Retry on error after 5 seconds
    }
};

module.exports = { scrapeSeries };
