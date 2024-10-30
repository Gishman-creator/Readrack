const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3'); // Your PostgreSQL poolpg setup
const { insertNewBook } = require('./insertNewBook');

exports.processBook = async (userAgent, numBooks, author_id, serie_id, goodreadsLink) => {
    try {
        const axiosConfig = { headers: { 'User-Agent': userAgent } };
        const response = await axios.get(goodreadsLink, axiosConfig);

        const $ = cheerio.load(response.data);
        const bookElements = $('.listWithDividers__item');
        console.log(`Number of divs with class 'listWithDividers__item':`, bookElements.length);

        let currentBookNum = 1;
        // console.log("Processing books by:", serie_id);

        for (const element of bookElements.toArray()) {
            if (currentBookNum > numBooks) return;
            // console.log("Current book number:", currentBookNum);

            const bookNumText = $(element).find('h3').text().trim();
            const bookNum = parseInt(bookNumText.replace('Book ', ''));
            // console.log("Book number:", bookNum);
            if (bookNum === currentBookNum || parseInt(numBooks) === parseInt(bookElements.length)) {

                // Find book name
                const bookName = $(element).find('a.gr-h3--serif span[itemprop="name"]').text().trim();
                const bookGoodreadsLink = `https://www.goodreads.com${$(element).find('a.gr-h3--serif').attr('href')}`;
                // console.log("Processing book:", bookName);

                // Prepare query-friendly book name
                const safeBookName = bookName.replace(/'/g, "''").replace(/ /g, '%');

                // Step 3: Database search
                const findBookQuery = `
                SELECT * FROM books
                WHERE book_name ILIKE '%${safeBookName}%' AND author_id = $1;
                `;
                const result = await poolpg.query(findBookQuery, [author_id]);

                if (result.rowCount > 0) {
                    // Book found: update serie_id_2
                    const bookId = result.rows[0].id;
                    const updateQuery = `
                    UPDATE books SET serie_id_2 = $1, serie_index = $2, goodreads_link = $3 WHERE id = $4
                    `;
                    await poolpg.query(updateQuery, [serie_id, currentBookNum, bookGoodreadsLink, bookId]);
                    console.log(`Updated book: ${bookName} index`, currentBookNum, `from ${bookGoodreadsLink}`);
                } else {
                    // Book not found: call insertNewBook
                    await insertNewBook(bookName, author_id, serie_id, currentBookNum, bookGoodreadsLink);
                    console.log(`Inserted new book: ${bookName} index`,currentBookNum, `from ${bookGoodreadsLink}`);
                }
            }
            currentBookNum++;
        };
    } catch (error) {
        console.error("Error in processBook:", error);
    }
};
