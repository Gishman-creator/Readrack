const axios = require('axios');
const cheerio = require('cheerio');
const poolpg = require('../../config/dbpg3');
const { generateRandomUserAgent } = require("../../utils/userAgentGenerator");
const { getBookGenres } = require('../../utils/scrapeBookInfo_utils/getBookGenres');

let isScraping = false; // Lock variable

const validateBookGenre = async (req, res) => {
    if (isScraping) {
        return; 
    }

    isScraping = true; // Set lock to prevent multiple simultaneous runs

    try {
        const client = await poolpg.connect();

        // Fetch books with missing publish_date (where bookInfo_status is null)
        const { rows: books } = await client.query(`
            select id, book_name, author_id, genre from books 
            where genre ilike '%unknown%' 
            or genre ilike '%do%not%' 
            or genre ilike '%unfortunately%' 
            or genre ilike '%don''t%' 
            or genre is null;
        `);

        if (books.length === 0) { 
            console.log("No books to validate.");
            if (req.io) {
                req.io.emit('validateBookGenreMessage', 'No books to validate.');
            }
            client.release();
            return;
        }

        const userAgent = await generateRandomUserAgent();

        // Total books to process
        const totalBooks = books.length;
        let processedBooks = 0;

        // Loop through books and attempt to scrape the publish date and genre
        for (const book of books) { // Combine author names
            const { id, book_name, amazon_link, author_id, goodreads_link, image_link: book_image_link, genre: book_genre, publish_date, publish_year } = book;

            // Split author_id into an array
            const authorIds = author_id.split(',').map(id => id.trim());

            // Fetch author details
            const { rows: authors } = await client.query(
                `SELECT author_name, bookseriesinorder_link FROM authors WHERE id = ANY($1::int[])`,
                [authorIds]
            );

            // Concatenate author names and get the first bookseriesinorder_link
            const author_name = authors.map(author => author.author_name).join(', ');

            console.log(`Processing book: ${book_name} by ${author_name}: ${id}`);

            try {
                
                let genre = await getBookGenres(author_name, book_name);

                // Update the database with publish date and genre
                await client.query(
                    `UPDATE books SET genre = $1 WHERE id = $2`,
                    [genre ,id]
                );

                console.log(`Genre: ${genre || 'null'}`);

            } catch (error) {
                console.error(`Error fetching data for book: ${book_name}, Error: ${error.message}`);
            }

            // Increment processed books count
            processedBooks++;

            // Calculate progress percentage
            const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
            const progress = `${processedBooks}/${totalBooks} (${progressPercentage}%)`;
            console.log(`Progress: ${progress}\n`);

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('validateBookGenreProgress', progress);
            }
        }

        client.release();
        console.log("Book validation process completed.");
        isScraping = false; // Release lock after finishing
    } catch (error) {
        console.error('Error during book validation:', error.message);
        isScraping = false; // Release lock in case of error
        setTimeout(() => validateBookGenre(req, res), 5000);
    }
};

module.exports = { validateBookGenre };
