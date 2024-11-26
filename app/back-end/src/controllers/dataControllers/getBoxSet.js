const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const getWebsite = require('../../utils/scrapeAuthorMedia/getWebsite');
const { link } = require('../../routes/apiRoutes');

let isValidating = false; // Lock variable

const getBoxSet = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true; // Set lock

    try {
        // Connect to the database
        const client = await poolpg.connect();

        // Fetch series with missing status
        const { rows: series } = await client.query(`
            SELECT id, serie_name, goodreads_link FROM series 
            WHERE amazon_link is null; 
        `);

        // Check if there are any series to validate
        if (series.length === 0) {
            console.log("No series to validate.");
            if (req.io) {
                req.io.emit('validateMessage', 'No series to validate.');
            }
            client.release();
            return;
        }

        // Total series to process
        const totalSeries = series.length;
        let processedSeries = 0;

        const user = await generateRandomUserAgent();
        console.log('User Agent:', user);
 
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Loop through series and validate their information
        for (const serie of series) {

            const { id, serie_name, goodreads_link } = serie; // Extract id and serie_name

            console.log(`Processing serie: ${serie_name} from ${goodreads_link}`);
            // Fetch the Goodreads page
            const response = await axios.get(goodreads_link, {
                headers: {
                    'User-Agent': user,
                },
            });

            // Load the page into cheerio
            const $ = cheerio.load(response.data);
            let boxsetLink = null; 
    
            // Find the div containing the box set link
            const boxSetElement = $('.listWithDividers__item a[href*="Box_Set"]');
            if (boxSetElement.length) {
                // Extract the href link
                const link = boxSetElement.attr('href');
                boxsetLink = `https://www.goodreads.com${link}`;
            }
            console.log("Box set link:", boxsetLink)

            // Update the database with the categorized links
            await client.query(
                `UPDATE series 
                     SET boxset_link = $1
                     WHERE id = $2`,
                [boxsetLink, id]
            );

            // Increment processed series count
            processedSeries++;

            // Calculate progress percentage
            const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
            const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('validateSerieProgress', progress);
            }
        }

        client.release();
        isValidating = false; // Release lock after finishing the validation
    } catch (error) {
        console.error('Error during serie validation:', error.message);
        isValidating = false; // Release lock in case of error
        // Retry after a delay
        setTimeout(() => {
            getBoxSet(req, res); // Call the function again with the same request and response
        }, 5000); // Retry after 5 seconds
    }
};

module.exports = { getBoxSet };
