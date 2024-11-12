// src/controllers/catalogControllers/convertPublishDateController.js

const poolpg = require('../../config/dbpg');

const convertPublishDateController = async (req, res) => {
    try {
        // Fetch all books with their date of birth (publish_date) from the database
        const { rows } = await poolpg.query('SELECT id, publish_date FROM books WHERE publish_date IS NOT NULL');

        // Check if there are any books
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No books found with a valid publish_date.' });
        }

        // Array to hold the results of updated books
        const updatedBooks = [];

        // Loop through each book and convert publish_date to words
        for (const book of rows) {
            const publish_date = new Date(book.publish_date);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedPublishDate = publish_date.toLocaleDateString('en-US', options); // e.g., "July 21, 1965"

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
