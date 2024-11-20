const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const getWebsite = require('../../utils/scrapeAuthorMedia/getWebsite');

let isValidating = false; // Lock variable

const scrapeAuthorMedia = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true; // Set lock

    try {
        // Connect to the database
        const client = await poolpg.connect();

        // Fetch authors with missing status
        const { rows: authors } = await client.query(`
            SELECT id, author_name, goodreads_link FROM authors 
            WHERE x is null or instagram is null or facebook is null or website is null;
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

        const user = await generateRandomUserAgent();
        console.log('User Agent:', user);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Loop through authors and validate their information
        for (const author of authors) {

            await sleep(20000);

            const { id, author_name, goodreads_link } = author; // Extract id and author_name
            const searchQuery = `author ${author_name}`; // Use the author's name in the search query
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

            const website = await getWebsite(goodreads_link, user);

            // Fetch the Google search results page
            const response = await axios.get(googleSearchUrl, {
                headers: {
                    'User-Agent': user,
                }
            });

            const $ = cheerio.load(response.data);
            // console.log('Google Search Results Page:', $.html());

            // Check if the author exists by searching for the specific div with class 'Z1hOCe'
            const authorExists = $('.kno-vrt-t').length > 0;

            console.log('Processing Author:', author_name);
            console.log('Author Exists:', authorExists);

            if (!authorExists) {
                console.log(`No authors found, discarding: ${author_name}`);
                await client.query(
                    `UPDATE authors SET x = 'none', instagram = 'none', facebook = 'none', website = 'none' WHERE id = $1`,
                    [id]
                );
                processedAuthors++;

                // Calculate progress percentage
                const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
                const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;
                console.log(`Progress: ${progress}\n`);
                continue;
            }

            // Initialize all media to 'none'
            let x = 'none';
            let instagram = 'none';
            let facebook = 'none';

            $('.kno-vrt-t').each(async (index, section) => {
                // Extract the link from the 'a' tag inside the div
                const linkElement = $(section).find('a');
                const link = linkElement.attr('href') || ''; // Get the href attribute or empty string if not present

                // Categorize the link based on its domain
                if (link.includes('x.com') || link.includes('twitter.com')) {
                    x = link;
                } else if (link.includes('instagram.com')) {
                    instagram = link;
                } else if (link.includes('facebook.com')) {
                    facebook = link;
                }
            });

            // Update the database with the categorized links
            await client.query(
                `UPDATE authors 
                     SET x = $1, instagram = $2, facebook = $3, website = $4
                     WHERE id = $5`,
                [x, instagram, facebook, website, id]
            );

            console.log(`x: ${x}`);
            console.log(`instagram: ${instagram}`);
            console.log(`facebook: ${facebook}`);
            console.log(`website: ${website}`);

            // Increment processed authors count
            processedAuthors++;

            // Calculate progress percentage
            const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
            const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

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
            scrapeAuthorMedia(req, res); // Call the function again with the same request and response
        }, 5000); // Retry after 5 seconds
    }
};

module.exports = { scrapeAuthorMedia };
