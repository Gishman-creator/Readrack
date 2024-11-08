const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { getSerieImage } = require('../../utils/scrapeSerieInfo_utils/getSerieImage');

let isScraping = false; // Lock variable

const scrapeSerieImage = async (req, res) => {
    if (isScraping) {
        return;
    }

    isScraping = true; // Set lock to prevent multiple simultaneous runs

    try { 
        const client = await poolpg.connect();

        // Fetch series with missing publish_date (where serieInfo_status is null)
        const { rows: series } = await client.query(`
            SELECT id, serie_name, author_id, amazon_link
            FROM series
            WHERE image_link is null;
        `);

        if (series.length === 0) {
            console.log("No series to validate.");
            if (req.io) {
                req.io.emit('scrapeSerieImageMessage', 'No series to validate.');
            }
            client.release();
            return;
        }

        const userAgent = await generateRandomUserAgent();
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Total series to process
        const totalSeries = series.length;
        let processedSeries = 0;

        // Loop through series and attempt to scrape the publish date and genre
        for (const serie of series) { // Combine author names
            const { id, serie_name, amazon_link } = serie;

            console.log(`Processing serie: ${serie_name} from ${amazon_link}`);

            // await sleep(5000); // Delay to avoid overwhelming the server

            try {
                // Validate the Amazon link
                let image_link = null;

                // Valid link, fetch image
                image_link = await getSerieImage(userAgent, amazon_link, id);

                // Update the database with publish date and genre
                await client.query(
                    `UPDATE series SET  image_link = $1 WHERE id = $2`,
                    [image_link, id]
                );

                console.log(`Image Link: ${image_link || 'null'}`);

            } catch (error) {
                console.error(`Error fetching data for serie: ${serie_name}, Error: ${error.message}`);
            }

            // Increment processed series count
            processedSeries++; 

            // Calculate progress percentage
            const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
            const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('scrapeSerieImageProgress', progress);
            }
        }

        client.release();
        console.log("Serie validation process completed.");
        isScraping = false; // Release lock after finishing
    } catch (error) {
        console.error('Error during serie validation:', error.message);
        isScraping = false; // Release lock in case of error
    }
};

module.exports = { scrapeSerieImage };
