const puppeteer = require('puppeteer');
const poolpg = require('../../config/dbpg3');

const validateAuthor = async (req, res) => {
    try {

        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        const searchQuery = `author jk rowling`;
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

        await page.goto(googleSearchUrl, { waitUntil: 'domcontentloaded' });

        // Check if the author exists
        const authorDOB = await page.evaluate(() => {
            const sections = document.querySelectorAll('.Z1hOCe');

            for (const section of sections) {
                const bornLabel = section.querySelector('.w8qArf.FoJoyf');
                if (bornLabel && bornLabel.textContent.includes("Born")) {
                    // Find the span that contains the date of birth
                    const dobSpan = section.querySelector('span.LrzXr.kno-fv.wHYlTd.z8gr9e');
                    if (dobSpan) {
                        // Extract the text content and return just the date of birth
                        const dobText = dobSpan.textContent.trim();
                        // Use regex to extract the date portion
                        const dobMatch = dobText.match(/(\w+\s\d{1,2},\s\d{4})/);
                        return dobMatch ? dobMatch[0] : 'Date of birth not found';
                    }
                }
            }
            return 'No author found'; // Return if no author was found
        });

        console.log('Date of Birth:', authorDOB);
        await browser.close();

        return res.json({ authorDOB });

    } catch (error) {
        console.error('Error during author validation:', error.message);
        res.status(500).json({ message: 'Error during validation process.' });
    }
};

module.exports = { validateAuthor };
