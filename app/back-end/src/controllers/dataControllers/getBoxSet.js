const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");

let isValidating = false; // Lock variable

const getBoxSet = async (req, res) => {
    if (isValidating) return;

    isValidating = true; // Set lock

    try {
        const client = await poolpg.connect();

        const { rows: series } = await client.query(`
            SELECT id, serie_name, goodreads_link FROM series 
            WHERE amazon_link IS NULL AND boxset_link IS NULL; 
        `);

        if (series.length === 0) {
            console.log("No series to validate.");
            if (req.io) req.io.emit('validateMessage', 'No series to validate.');
            client.release();
            return;
        }

        const totalSeries = series.length;
        let processedSeries = 0;

        const user = await generateRandomUserAgent();
        console.log('User Agent:', user);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const serie of series) {
            const { id, serie_name, goodreads_link } = serie;
            console.log(`Processing serie: ${serie_name} from ${goodreads_link}`);

            let boxsetLink = 'none'; // Default value if no link is found or error occurs

            try {
                const response = await axios.get(goodreads_link, {
                    headers: { 'User-Agent': user },
                });

                const $ = cheerio.load(response.data);

                const boxSetElement = $('.listWithDividers__item a[href*="Box_Set"]');
                if (boxSetElement.length) {
                    const link = boxSetElement.attr('href');
                    boxsetLink = `https://www.goodreads.com${link}`;
                }

                console.log("Box set link:", boxsetLink);

            } catch (error) {
                console.error(`Failed to fetch or process ${serie_name}: ${error.message}`);
            }

            // Update the database with the boxset link
            await client.query(
                `UPDATE series SET boxset_link = $1 WHERE id = $2`,
                [boxsetLink, id]
            );

            // Increment progress
            processedSeries++;
            const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
            const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            if (req.io) req.io.emit('validateSerieProgress', progress);

            await sleep(1000); // Delay between requests to avoid rate-limiting
        }

        client.release();
    } catch (error) {
        console.error('Error during validation:', error.message);
    } finally {
        isValidating = false; // Always release lock
    }
};

module.exports = { getBoxSet };
