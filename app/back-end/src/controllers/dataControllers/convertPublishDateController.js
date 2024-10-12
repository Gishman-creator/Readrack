// src/controllers/catalogControllers/convertPublishDateController.js

const poolpg = require('../../config/dbpg');

const convertPublishDateController = async (req, res) => {
    try {
        // Fetch all books with their date of birth (publishDate) from the database
        const { rows } = await poolpg.query('SELECT id, "publishDate" FROM books WHERE "publishDate" IS NOT NULL');

        // Check if there are any books
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No books found with a valid publishDate.' });
        }

        // Array to hold the results of updated books
        const updatedBooks = [];

        // Loop through each book and convert publishDate to words
        for (const book of rows) {
            const publishDate = new Date(book.publishDate);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedPublishDate = publishDate.toLocaleDateString('en-US', options); // e.g., "July 21, 1965"

            // Update the customDate column in the books table
            await poolpg.query('UPDATE books SET "customDate" = $1 WHERE id = $2', [formattedPublishDate, book.id]);

            // Add to updated books array
            updatedBooks.push({ id: book.id, customDate: formattedPublishDate });
        }

        return res.status(200).json({ message: 'Date of publish converted and saved successfully.', updatedBooks });
    } catch (error) {
        console.error('Error in convertPublishDateController:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = convertPublishDateController;
