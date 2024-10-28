const puppeteer = require('puppeteer');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require('../../utils/userAgentGenerator');
const dotenv = require('dotenv');
dotenv.config();

const prod = process.env.NODE_ENV === "production";

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
        const browser = prod ?
         await puppeteer.launch({ headless: true })
         : await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome', // Replace with the correct path if different
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });;

        // Set a random User-Agent
        const userAgent = await generateRandomUserAgent();

        for (const book of books) {
            try {
                const { id, book_name, goodreads_link } = book;

                const page = await browser.newPage();
        
                await page.setUserAgent(userAgent);

                // Go to the Goodreads page for the book
                await page.goto(goodreads_link, { waitUntil: 'networkidle2', timeout: 60000 });
                console.log(`Navigating to Goodreads page for book: ${book_name}`);

                // Click the "buy" button
                const buyButtonSelector = 'button.Button--buy';
                await page.waitForSelector(buyButtonSelector);
                await page.click(buyButtonSelector);
                await page.keyboard.press('Enter');

                // Allow time for the new tab to open
                await new Promise(resolve => setTimeout(resolve, 20000));

                // Get the latest open page (Amazon page)
                const pages = await browser.pages();
                const amazonPage = pages[pages.length - 1];

                if (amazonPage) {
                    const pageUrl = await amazonPage.url();

                    if (pageUrl.includes("amazon.com")) {
                        console.log(`Amazon link: ${pageUrl}`);
                        await client.query(
                            `UPDATE books SET amazon_link = $1 WHERE id = $2`,
                            [pageUrl, id]
                        );
                    } else {
                        console.error(`Error: Expected Amazon page but got ${pageUrl}`);
                    }

                    // Close all extra tabs except the main Goodreads page
                    for (let i = pages.length - 1; i >= 1; i--) {
                        await pages[i].close();
                    }
                }

                processedBooks++;
                const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
                console.log(`Progress: ${processedBooks}/${totalBooks} (${progressPercentage}%)\n`);

                // Emit progress if using Socket.IO
                if (req.io) {
                    req.io.emit('scrapeBookLinkProgress', `${processedBooks}/${totalBooks}`);
                }

                // Delay to avoid rate limiting
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
