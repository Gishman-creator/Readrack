const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { bookNameVerification } = require('../../utils/validateDuplicateLinks/bookNameVerification');

let isValidating = false; // Lock variable

const validateDuplicateLinks = async (req, res) => {
    if (isValidating) {
        return;
    }
    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch duplicate Amazon links with count
        const { rows: duplicates } = await client.query(`
            SELECT amazon_link, COUNT(*) AS duplicate_count
            FROM books
            WHERE amazon_link ILIKE '%series?%'
            GROUP BY amazon_link
            HAVING COUNT(*) > 1;
        `);

        if (duplicates.length === 0) {
            console.log("No duplicates found.");
            if (req.io) {
                req.io.emit('validateDuplicateLinksMessage', "No duplicates found.");
            }
            client.release();
            isValidating = false;
            return;
        }

        const totalDuplicates = duplicates.length;
        let processedLinks = 0;
        const userAgent = await generateRandomUserAgent();
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const duplicate of duplicates) {
            const { amazon_link } = duplicate;
            console.log(`Validating link: ${amazon_link}`);

            // Fetch book names for this duplicate link
            const { rows: books } = await client.query(`
                SELECT id, book_name, serie_id FROM books
                WHERE amazon_link = $1;
            `, [amazon_link]);

            if (books.length === 0) continue;

            const serie_id = books[0].serie_id;
            const response = await axios.get(amazon_link, { headers: { 'User-Agent': userAgent } });
            const $ = cheerio.load(response.data);

            for (const book of books) {
                const maxRetries = 5;
                let attempts = 0;
                let validatedLink = null;
                const { id, book_name } = book;

                while (attempts < maxRetries) {
                    try { 
                        // Collect all text elements separated by ';'
                        const elements = $(`a[id*="itemBookTitle"]`);
                        const elementTexts = elements.map((i, el) => `[${i}]: ${$(el).text()}`).get().join(';');
                        
                        // Use bookNameVerification to check for matching book name index
                        const matchIndex = await bookNameVerification(elementTexts, book_name.toLowerCase().replace(/&/g, "and"));
                        // console.log("Match Index:", matchIndex);

                        if (matchIndex !== 'none') {
                            const matchedElement = elements[parseInt(matchIndex)];
                            validatedLink = `https://www.amazon.com${$(matchedElement).attr('href')}`;
                        }

                        // Check for match and set validatedLink accordingly
                        // validatedLink = match !== 'none' ? `https://www.amazon.com${$(elements).filter((i, el) => {$(el).text().toLowerCase() === match; console.log($(el).text().toLowerCase())}).attr('href')}` : null;

                        console.log(`Validated link for ${book_name}: ${validatedLink ? validatedLink : 'none'}`);
                        break;

                    } catch (error) {
                        if (error.response && error.response.status === 503) {
                            attempts++;
                            console.error(`503 error for ${amazon_link}, retrying ${attempts}/${maxRetries}...`);
                            await sleep(3000 * attempts);
                        } else {
                            console.error(`Error fetching Amazon link: ${amazon_link}, Error: ${error.message}`);
                            return null;
                        }
                    }
                }

                // Update the amazon_link based on validation result
                await client.query(`UPDATE books SET amazon_link = $1 WHERE id = $2`, [validatedLink, id]);
            }

            await client.query(`UPDATE series SET amazon_link = $1 WHERE id = $2`, [validatedLink, serie_id]);
            processedLinks++;
            const progressPercentage = ((processedLinks / totalDuplicates) * 100).toFixed(2);
            const progress = `${processedLinks}/${totalDuplicates} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            if (req.io) {
                req.io.emit('validateDuplicateLinksProgress', progress);
            }
        }

        client.release();
        console.log("Duplicate link validation completed.");
        isValidating = false;

    } catch (error) {
        console.error('Error during validation:', error.message);
        isValidating = false;
        setTimeout(() => validateDuplicateLinks(req, res), 5000);
    }
};

module.exports = { validateDuplicateLinks };
