const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");

let isValidating = false; // Lock variable

const validateAuthor = async (req, res) => {
    if (isValidating) {
        return res.status(200).json({ message: "Validate process already running." });
    }

    isValidating = true; // Set lock

    try {
        // Connect to the database
        const client = await poolpg.connect();

        // Fetch authors with missing status
        const { rows: authors } = await client.query(`
            SELECT id, author_name FROM authors 
            WHERE status IS NULL;
        `);

        // Check if there are any authors to validate
        if (authors.length === 0) {
            console.log("No authors to validate.");
            res.status(400).json({ message: "No authors to validate." });
            if (req.io) {
                req.io.emit('validateMessage', 'No authors to validate.');
            }
            client.release();
            return;
        }

        // Total authors to process
        const totalAuthors = authors.length;
        let processedAuthors = 0;

        const user = await generateRandomUserAgent();
        console.log('User Agent:', user);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const author of authors) {
            // Existing code...
            await sleep(2000); // Wait for 2 seconds before making the next request
            // Existing code...
        }

        // Loop through authors and validate their information
        for (const author of authors) {

            await sleep(1000);

            const { id, author_name } = author; // Extract id and author_name
            const searchQuery = `author ${author_name}`; // Use the author's name in the search query
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

            // Fetch the Google search results page
            const response = await axios.get(googleSearchUrl, {
                headers: {
                    'User-Agent': user,
                }
            });

            const $ = cheerio.load(response.data);

            // Check if the author exists by searching for the specific div with class 'Z1hOCe'
            const authorExists = $('.Z1hOCe').length > 0;

            console.log('Validating Author:', author_name);
            console.log('Author Exists:', authorExists);

            if (!authorExists) {
                // console.log(`No authors found, discarding: ${author_name}`);
                await client.query(
                    `UPDATE authors SET status = $1 WHERE id = $2`,
                    ['discard', id]
                );
                processedAuthors++;
                continue;
            }

            // Extract DOB and DOD if available
            let dob = null;
            let dod = null;

            $('.Z1hOCe').each((index, section) => {
                const labels = $(section).find('.w8qArf.FoJoyf').map((i, el) => $(el).text()).get();

                if (labels.some(label => label.includes('Born'))) {
                    dob = $(section).find('.LrzXr.kno-fv.wHYlTd.z8gr9e').text().trim();
                    dob = formatDate(dob); // Format the date
                    // console.log(`Extracted DOB: ${dob}`);
                }

                if (labels.some(label => label.includes('Died'))) {
                    dod = $(section).find('.LrzXr.kno-fv.wHYlTd.z8gr9e').text().trim();
                    dod = formatDate(dod); // Format the date
                    // console.log(`Extracted DOD: ${dod}`);
                }
            });

            // Update the database with the extracted DOB and DOD
            await client.query(`UPDATE authors SET status = $1, dob = $2, dod = $3 WHERE id = $4;`, ['keep', dob, dod, id]);

            // console.log(`Updated author ID ${id} with DOB: ${dob} and DOD: ${dod}`);

            // Increment processed authors count
            processedAuthors++;

            // Calculate progress percentage
            const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
            const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}`);

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('validateAuthorProgress', progress);
            }
        }

        client.release();
        isValidating = false; // Release lock after finishing the validation
    } catch (error) {
        console.error('Error during author validation:', error.message);
        isValidating = false; // Release lock in case of error
        // Retry after a delay
        setTimeout(() => {
            validateAuthor(req, res); // Call the function again with the same request and response
        }, 5000); // Retry after 5 seconds
    }
};

// Helper function to format the date to 'Month D, YYYY'
const formatDate = (dobText) => {
    const dobMatch = dobText.match(/(\w+\s\d{1,2},\s\d{4})/);
    return dobMatch ? dobMatch[0] : 'Date of birth not found';
};

module.exports = { validateAuthor };
