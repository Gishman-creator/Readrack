const puppeteer = require('puppeteer');
const poolpg = require('../../config/dbpg3');

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

        const totalAuthors = authors.length;
        let processedAuthors = 0;

        // Launch Puppeteer browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        for (const author of authors) {
            const { id, author_name } = author;
            const searchQuery = `author ${author_name}`;
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

            // Go to the Google search results page
            await page.goto(googleSearchUrl, { waitUntil: 'networkidle2' });

            console.log(`Searching for author image for: ${author_name}`);

            // Try to get image from main search page
            let imgSrc = await page.evaluate(() => {
                const imageDiv = document.querySelector('.c8rBkc.uhHOwf.ez24Df');
                return imageDiv ? imageDiv.querySelector('img')?.src : null;
            });

            // If no image found, navigate to Images tab
            if (!imgSrc) {
                console.log(`No image found on main page for: ${author_name}. Trying Images tab.`);
                const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`;
                console.log('googleImagesUrl', googleImagesUrl)
                await page.goto(googleImagesUrl, { waitUntil: 'networkidle2' });
                
                imgSrc = await page.evaluate(() => {
                    const firstDivWithClass = document.querySelector('.H8Rx8c img');
                    return firstDivWithClass ? firstDivWithClass.src : null;
                });
            }

            // Update image link in the database or discard the author if no image is found
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

            // Calculate and emit progress
            const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
            const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            if (req.io) {
                req.io.emit('scrapeAuthorImageProgress', progress);
            }

            // Add a delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Close the browser and release the client connection
        await browser.close();
        client.release();
        isValidating = false; // Release lock after finishing
    } catch (error) {
        console.error('Error during author image scraping:', error.message);
        isValidating = false; // Release lock in case of error
        setTimeout(() => {
            scrapeAuthorImage(req, res); // Retry after 5 seconds
        }, 5000);
    }
};

module.exports = { scrapeAuthorImage };
