const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { insertNewBook } = require('../../utils/scrapeSeriesBooks_utils/insertNewBook');

let isValidating = false;

const scrapeSeriesBooks = async (req, res) => {
    if (isValidating) {
        return;
    }
    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch series where book_status is null
        // const { rows: seriesList } = await client.query(`
        //     SELECT s.id, s.serie_name, s.author_id, s.goodreads_link 
        //     FROM series s 
        //     JOIN authors a ON s.author_id::text = a.id::text
        //     WHERE s.book_status IS NULL;
        // `);

        // Fetch series where book_status is null
        const { rows: seriesList } = await client.query(`
            SELECT series.id, series.serie_name, series.num_books, series.goodreads_link, series.author_id,
            COUNT(DISTINCT books.id) AS "current_books"
            FROM series
            LEFT JOIN books ON books.serie_id::text = series.id::text
            GROUP BY series.id
            HAVING COUNT(DISTINCT books.id) = 0 OR COUNT(DISTINCT books.book_name) < series.num_books;
        `);

        if (seriesList.length === 0) {
            console.log("No series to scrape.");
            if (req.io) req.io.emit('scrapeSeriesBooksMessage', "No series to scrape.");
            client.release();
            isValidating = false;
            return;
        }

        const userAgent = await generateRandomUserAgent();
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        let processedSeries = 0;
        const totalSeries = seriesList.length;

        // Process each series in seriesList
        for (const serie of seriesList) {

            const { id: serieId, serie_name, author_id, goodreads_link } = serie;

            // const serieId = 131406;
            // const serie_name = 'Thor (2007) (Single Issues)';
            // const author_id = 963957;
            // const goodreads_link = 'https://www.goodreads.com/series/260780-thor-2007-single-issues';

            console.log("Processing serie:", serie_name, "from:", goodreads_link);

            const axiosConfig = { headers: { 'User-Agent': userAgent } };
            const response = await axios.get(goodreads_link, axiosConfig);
            // const response = await axios.get('https://www.goodreads.com/series/45175-harry-potter', axiosConfig);

            const $ = cheerio.load(response.data);

            const subtitleText = $('.responsiveSeriesHeader__subtitle').text();
            console.log("Subtitle:", subtitleText);
            const numBooksMatch = subtitleText.match(/(\d+)\s+primary work/);
            const num_books = numBooksMatch ? parseInt(numBooksMatch[1]) : 0;
            console.log("Number of primary works:", num_books); 

            const bookElements = $('.listWithDividers__item');
            console.log(`Number of divs with class 'listWithDividers__item':`, bookElements.length);

            const bookNumTexts = bookElements.map((i, element) => {
                return $(element).find('h3').text().trim();
            }).get();

            const bookNumOne = bookNumTexts.find(text => /^Book 1Shelve/.test(text)) || null;

            let currentBookNum = 1;
            // console.log("Processing books by:", serieId);

            for (const element of bookElements.toArray()) {
                if (currentBookNum > num_books) break;
                // console.log("Current book number:", currentBookNum);

                const bookNumText = $(element).find('h3').text().trim();
                // console.log(bookNumText);
                const bookNumMatch = bookNumText.match(/^Book (\d+(\.\d+)?)Shelve/); // Match "Book" followed by a full number, including 0
                // console.log(bookNumMatch);
                 
                // If the bookNumText matches "Book <number>", extract the number; otherwise, set bookNum to null
                const bookNum = bookNumMatch ? parseFloat(bookNumMatch[1]) : null;
                // console.log(bookNum);
                
                if (
                    Number.isInteger(bookNum) || parseInt(num_books) === parseInt(bookElements.length) || !bookNumOne
                ) {

                    // Find book name
                    const book_name = $(element).find('a.gr-h3--serif span[itemprop="name"]').text().trim();
                    const bookGoodreads_link = `https://www.goodreads.com${$(element).find('a.gr-h3--serif').attr('href')}`;
                    // console.log("Processing book:", book_name);

                    // Prepare query-friendly book name
                    const safeBook_name = book_name.replace(/'/g, "''").replace(/’/g, "''").replace(/ /g, '%');
                    // console.log("Safe book name:", safeBook_name);

                    // Step 3: Database search
                    const findBookQuery = `
                        SELECT * FROM books
                        WHERE book_name ILIKE '%${safeBook_name}%' AND author_id = $1 and serie_id is null;
                        `;
                    // console.log(findBookQuery, author_id);
                    const result = await poolpg.query(findBookQuery, [author_id]);

                    if (result.rowCount > 0) {
                        // Book found: update serie_id_2
                        const bookId = result.rows[0].id;
                        const updateQuery = `
                            UPDATE books SET serie_id = $1, serie_index = $2, goodreads_link = $3 WHERE id = $4
                            `;
                        await poolpg.query(updateQuery, [serieId, currentBookNum, bookGoodreads_link, bookId]);
                        console.log(`Updated book: ${book_name} index`, currentBookNum, `from ${bookGoodreads_link}`);
                    } else {
                        // Book not found: call insertNewBook
                        await insertNewBook(book_name, author_id, serieId, currentBookNum, bookGoodreads_link);
                        console.log(`Inserted new book: ${book_name} index`, currentBookNum, `from ${bookGoodreads_link}`);
                    }
                } else continue;
                currentBookNum++;
            };

            console.log("Number of books:", num_books);

            await client.query(`UPDATE series SET book_status = 'done', num_books = $1 WHERE id = $2`, [num_books, serieId]);
            processedSeries++;
            const progressPercentage = ((processedSeries / totalSeries) * 100).toFixed(2);
            const progress = `${processedSeries}/${totalSeries} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);
            if (req.io) req.io.emit('scrapeSeriesBooksMessage', `Progress: ${progress}`);
        }

        client.release();
        isValidating = false;

        if (req.io) req.io.emit('scrapeSeriesBooksMessage', "Series scraping completed.");

    } catch (error) {
        console.error("Error in scrapeSeriesBooks:", error);
        isValidating = false;
    }
};

module.exports = { scrapeSeriesBooks };
