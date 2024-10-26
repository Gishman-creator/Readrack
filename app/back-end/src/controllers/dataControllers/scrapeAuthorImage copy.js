const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");

let isValidating = false; // Lock variable

const scrapeAuthorImage = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true; // Set lock

    try {
        // Connect to the database
        const client = await poolpg.connect();

        // Fetch authors with missing images
        const { rows: authors } = await client.query(`
            SELECT id, author_name FROM authors 
            WHERE image_link IS NULL;
        `);

        // Check if there are any authors to validate
        if (authors.length === 0) {
            console.log("No authors to validate.");
            if (req.io) {
                req.io.emit('validateMessage', 'No authors to validate.');
            }
            client.release();
            return;
        }

        // Total authors to process
        const totalAuthors = authors.length;
        let processedAuthors = 0;

        const userAgent = await generateRandomUserAgent();
        console.log('User Agent:', userAgent);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Loop through authors and validate their information
        for (const author of authors) {
            await sleep(5000);

            const { id, author_name } = author;
            // const searchQuery = `author ${author_name}`;
            const searchQuery = `author Sidney Sheldon`;
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

            // Fetch the Google search results page
            const response = await axios.get(googleSearchUrl, {
                headers: {
                    'User-Agent': userAgent,
                }
            });

            const $ = cheerio.load(response.data);
            console.log(`Searching for author image for: ${author_name}`);

            // Find the div with the author image
            const imageDiv = $('.c8rBkc.uhHOwf.ez24Df');

            // Log the HTML content of imageDiv
            console.log("HTML content of imageDiv:", imageDiv.html());

            const imgSrc = imageDiv.find('img').attr('src');

            
            console.log(`Image Src: ${imgSrc}`);

            if (imgSrc) {
                await client.query(
                    `UPDATE authors SET image_link = $1, status = $2 WHERE id = $3`,
                    [imgSrc, 'keep', id]
                );
                console.log(`Image URL: ${imgSrc.substring(0, 60)}`);
            } else {
                await client.query(
                    `UPDATE authors SET status = $1 WHERE id = $2`,
                    ['discard', id]
                );
                console.log(`No image found, discarding: ${author_name}`);
            }

            processedAuthors++;

            // Calculate progress percentage
            const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
            const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('scrapeAuthorImageProgress', progress);
            }
        }

        client.release();
        isValidating = false; // Release lock after finishing the validation
    } catch (error) {
        console.error('Error during author image scraping:', error.message);
        isValidating = false; // Release lock in case of error
        // Retry after a delay
        setTimeout(() => {
            scrapeAuthorImage(req, res); // Retry with the same request and response
        }, 5000); // Retry after 5 seconds
    }
};

module.exports = { scrapeAuthorImage };
