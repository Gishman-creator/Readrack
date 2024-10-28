const puppeteer = require('puppeteer');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require('../../utils/userAgentGenerator');

let isValidating = false; // Lock variable

const scrapeBookLink = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true; // Set lock

    try {
        const client = await poolpg.connect();

        // Fetch books with a null amazon_link and non-null goodreads_link
        const { rows: books } = await client.query(`
            SELECT id, book_name, goodreads_link 
            FROM books
            WHERE amazon_link IS NULL AND goodreads_link IS NOT NULL;
        `);

        if (books.length === 0) {
            console.log("No books to validate.");
            if (req.io) {
                req.io.emit('validateMessage', 'No books to validate.');
            }
            client.release();
            isValidating = false;
            return;
        }

        const totalBooks = books.length;
        let processedBooks = 0;

        // Launch Puppeteer browser
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
    
        // Set a random User-Agent
        const userAgent = await generateRandomUserAgent();
        await page.setUserAgent(userAgent);

        for (const book of books) {
            try {
                const { id, book_name, goodreads_link } = book;

                // Go to the Goodreads page for the book
                await page.goto(goodreads_link, { waitUntil: 'networkidle2' });
                console.log(`Navigating to Goodreads page for book: ${book.book_name}`);

                // Click the "buy" button to reveal the dropdown
                const buyButtonSelector = 'button.Button--buy';
                await page.waitForSelector(buyButtonSelector);
                await page.click(buyButtonSelector);
                await page.keyboard.press('Enter');

                await new Promise(resolve => setTimeout(resolve, 30000));

                // Wait for navigation to Amazon
                // await page.waitForNavigation({ waitUntil: 'networkidle2' });

                // Get all open tabs
                const pages = await browser.pages();
                console.log("Number of open tabs:", pages.length);
                // The last page is usually the newly opened Amazon page
                const amazonPage = pages[pages.length - 1];

                const pageUrl = await amazonPage.url();
                console.log(`Navigated to Amazon page: ${pageUrl}`);

                if (pageUrl) {
                    // await client.query(
                    //     `UPDATE books SET amazon_link = $1 WHERE id = $2`,
                    //     [pageUrl, id]
                    // );
                } else {
                    console.error(`No amazon_link found for book: ${book_name}.`);
                }

                processedBooks++;

                // Emit progress
                const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
                const progress = `${processedBooks}/${totalBooks} (${progressPercentage}%)`;
                console.log(`Progress: ${progress}\n`);
                if (req.io) {
                    req.io.emit('scrapeBookLinkProgress', progress);
                }

                // Delay to avoid being rate-limited
                await new Promise(resolve => setTimeout(resolve, 5000));

            } catch (bookError) {
                console.error(`Error processing book ID ${book.id}:`, bookError.message);
            }
        }

        // Close the browser and release the client connection
        await browser.close();
        client.release();
        isValidating = false;

    } catch (error) {
        console.error('Error during Amazon link scraping:', error.message);
        isValidating = false; 
        setTimeout(() => scrapeBookLink(req, res), 5000);
    }
};

module.exports = { scrapeBookLink };
