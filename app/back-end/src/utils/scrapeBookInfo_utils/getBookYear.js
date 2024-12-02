const cheerio = require('cheerio');
const axios = require("axios");

exports.getBookYear = async (bookseriesinorder_link, goodreads_link, book_name, author_name, userAgent) => {
    try {
        // Attempt to get year from bookseriesinorder_link
        const response = await axios.get(bookseriesinorder_link, {
            headers: { 'User-Agent': userAgent }
        });
        const $ = cheerio.load(response.data);

        // Find the row with the matching book title
        const bookTitleElement = $(`td.booktitle:contains("${book_name}")`);

        if (bookTitleElement.length > 0) {
            // Get the corresponding year from the same row (bookyear)
            const bookYearElement = bookTitleElement.closest('tr').find('td.bookyear');
            if (bookYearElement.length > 0) {
                // Extract and clean the year (remove parentheses)
                const bookYear = bookYearElement.text().replace(/[()]/g, '').trim();
                return bookYear;
            }
        }

        console.log(`No year found for book "${book_name}" on bookseriesinorder_link. Checking Goodreads...`);

        // If no year found, attempt to get it from Goodreads
        if (goodreads_link) {
            const goodreadsResponse = await axios.get(goodreads_link, {
                headers: { 'User-Agent': userAgent }
            });
            const $$ = cheerio.load(goodreadsResponse.data);

            // Extract the date from the Goodreads publication info
            const publicationInfo = $$('p[data-testid="publicationInfo"]').text();
            const dateMatch = publicationInfo.match(/First published\s+(.+)/i);
            if (dateMatch && dateMatch[1]) {
                const fullDate = dateMatch[1].trim();  // Full date text
                console.log(`Publication date found on Goodreads: ${fullDate}`);
                return fullDate;  // Return full date or extract just the year if needed
            }
        }

        console.log(`No publication date found for "${book_name}" on either source using Gemini....................`);
        return await generatePublishDate(author_name, book_name);

    } catch (error) {
        console.error(`Error fetching book year for ${book_name}:`, error.message);
        return null;
    }
};
