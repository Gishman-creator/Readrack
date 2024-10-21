const cheerio = require('cheerio');
const axios = require("axios");

exports.getBookYear = async (bookseriesinorder_link, book_name, userAgent) => {
    try {
        const response = await axios.get(bookseriesinorder_link, {
            headers: { 'User-Agent': userAgent }
        });
        const $ = cheerio.load(response.data);

        // Find the row with the matching book title
        const bookTitleElement = $(`td.booktitle:contains("${book_name}")`);

        if (bookTitleElement.length === 0) {
            console.log(`Book title "${book_name}" not found on page.`);
            return null;
        }

        // Get the corresponding year from the same row (bookyear)
        const bookYearElement = bookTitleElement.closest('tr').find('td.bookyear');
        if (bookYearElement.length === 0) {
            console.log(`No year found for book: ${book_name}`);
            return null;
        }

        // Extract and clean the year (remove parentheses)
        const bookYear = bookYearElement.text().replace(/[()]/g, '').trim();
        return bookYear;

    } catch (error) {
        console.error(`Error fetching book year for ${book_name}:`, error.message);
        return null;
    }
};