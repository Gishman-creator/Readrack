const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { areAuthorsSame } = require('../../utils/scrapeSeries/authorVerification');
const { processSerie } = require('../../utils/scrapeSeries/processSerie');
const { serieVerification } = require('../../utils/scrapeSeries/serieVerification');

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
            SELECT id, author_name FROM authors
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
            await sleep(2000);

            const { id, author_name } = author;
            // const author_name = 'Jk rowling';
            const searchQuery = `${author_name} site:goodreads.com`;
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

            // Fetch the Google search results page
            const response = await axios.get(googleSearchUrl, {
                headers: { 'User-Agent': userAgent }
            });

            const $ = cheerio.load(response.data);

            // Find all links that point to Goodreads author pages
            const goodreadsLinks = $('a').filter((i, el) => {
                const href = $(el).attr('href');
                return href && href.includes("www.goodreads.com/author/show");
            });

            // console.log('goodreadsLinks:', goodreadsLinks);

            if (goodreadsLinks.length === 0) {
                console.log(`No Goodreads author link found for: ${author_name}`);
                await client.query(`UPDATE authors SET series_status = 'done' WHERE id = $1`, [id]);
                processedAuthors++;
                continue;
            }

            const authorCheckPromises = Array.from(goodreadsLinks).map(async (el) => {
                const href = $(el).attr('href');
                const h3Text = $(el).find('h3').text();
                console.log(`Checking author: ${h3Text}`);

                // Check if the author name matches
                const isSameAuthor = await areAuthorsSame(h3Text, author_name);
                return isSameAuthor ? href : null; // Return the link if the authors match
            });
            
            // Wait for all promises to resolve
            const authorCheckResults = await Promise.all(authorCheckPromises);

            // Filter out the valid links
            const validLinks = authorCheckResults.filter(link => link !== null);

            if (validLinks.length < 0) {
                console.log(`No valid Goodreads author link found for: ${author_name}`);
                await client.query(`UPDATE authors SET series_status = 'done' WHERE id = $1`, [id]);
                processedAuthors++;
                continue;
            }

            console.log('validLinks:', validLinks[0]);

            // Fetch the Goodreads author page
            const authorResponse = await axios.get(validLinks[0], {
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

            // Navigate to the series list page
            const seriesUrl = `https://www.goodreads.com${seriesLink}`;
            const seriesResponse = await axios.get(seriesUrl, {
                headers: { 'User-Agent': userAgent }
            });
            const seriesPage = cheerio.load(seriesResponse.data);

            // Scrape the series names from the series page
            const seriesTitles = seriesPage('a.bookTitle').map((i, el) => {
                return seriesPage(el).text().trim();
            }).get();

            if (seriesTitles.length === 0) {
                console.log(`No series titles found for author: ${author_name}`);
                await client.query(`UPDATE authors SET series_status = 'done' WHERE id = $1`, [id]);
                processedAuthors++;
                continue;
            }

            // Verify each series title
            const verifiedSeries = await serieVerification(seriesTitles.join(', '));
            console.log(`Verified series: ${verifiedSeries}`);
            const verifiedSeriesList = verifiedSeries.split(',').map(serie => serie.trim());

            if (verifiedSeriesList.length === 0) {
                console.log(`No valid series after verification for author: ${author_name}`);
                await client.query(`UPDATE authors SET series_status = 'done' WHERE id = $1`, [id]);
                processedAuthors++;
                continue;
            }

            // Process each verified series title
            for (const seriesTitle of verifiedSeriesList) {
                await processSerie(seriesTitle, id);
            }

            // Mark series scraping as done 
            await client.query(`UPDATE authors SET series_status = 'done' WHERE id = $1`, [id]);

            // Increment processed authors count
            processedAuthors++;

            // Calculate progress percentage
            const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
            const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}`);

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
