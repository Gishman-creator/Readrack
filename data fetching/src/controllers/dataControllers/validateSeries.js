const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");

let isValidating = false;

const validateSeries = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch series with multiple author_ids (comma-separated)
        const { rows: seriesList } = await client.query(`
            SELECT id, serie_name, author_id FROM series
            WHERE author_id LIKE '%,%';
        `);

        if (seriesList.length === 0) {
            console.log("No series to validate.");
            if (req.io) {
                req.io.emit('validateSeriesMessage', "No series to validate.");
            }
            client.release();
            isValidating = false;
            return;
        }

        const totalSeries = seriesList.length;
        let processedSeries = 0;
        const userAgent = await generateRandomUserAgent();

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const series of seriesList) {

            const { id, serie_name, author_id } = series;
            console.log("Processing serie:", serie_name)
            const authorIds = author_id.split(','); // Get all author IDs

            const validAuthorIds = [];
            
            // Validate each author's link
            for (const authorId of authorIds) {
                const { rows: authorData } = await client.query(`
                    SELECT bookseriesinorder_link, author_name FROM authors
                    WHERE id = $1 AND bookseriesinorder_link IS NOT NULL;
                `, [authorId]);

                if (authorData.length === 0) continue; // Skip if no link found

                const bookSeriesUrl = authorData[0].bookseriesinorder_link;
                const author_name = authorData[0].author_name;
                
                // Fetch the author’s book series page
                const seriesResponse = await axios.get(bookSeriesUrl, {
                    headers: { 'User-Agent': userAgent }
                });
                const seriesPage = cheerio.load(seriesResponse.data);

                // Check for series name in h2 tags
                const h2Matches = seriesPage('h2').filter((i, el) => {
                    console.log(seriesPage(el).text());
                    return seriesPage(el).text().toLowerCase().includes(serie_name.toLowerCase());
                });

                if (h2Matches.length > 0) {
                    console.log(`${author_name}: true`);
                    validAuthorIds.push(authorId); // Keep author if match found
                } else {
                    console.log(`${author_name}: false`);
                }
            }

            if(validAuthorIds.length === 1) {
                console.log("Author id:", validAuthorIds);
                // Update the author_id field with valid authors
                const updatedAuthorIds = validAuthorIds.join(',') || null; // Null if no valid authors
                await client.query(`
                    UPDATE series SET author_id = $1 WHERE id = $2
                `, [updatedAuthorIds, id]);
            } else {
                console.error("Multiple ids:", validAuthorIds);
            }

            // Increment processed series count
            processedSeries++;

            // Calculate and log progress percentage
            const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
            const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('validateSeriesProgress', progress);
            }
        }

        client.release();
        isValidating = false;
        // res.status(200).json({ message: "Validation completed successfully." });

    } catch (error) {
        console.error('Error during validation:', error.message);
        isValidating = false;
        setTimeout(() => validateSeries(req, res), 5000); // Retry in case of error
    }
};

module.exports = { validateSeries };
