const poolpg = require('../../config/dbpg3');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

let isValidating = false;

const validateBookName = async (req, res) => {
    if (isValidating) {
        return;
    }

    isValidating = true;

    try {
        const client = await poolpg.connect();

        // Fetch books with a slash in their name
        const { rows: books } = await client.query(`
            SELECT id, book_name, author_id 
            FROM books 
            WHERE book_name ILIKE '%/%';
        `);

        if (books.length === 0) {
            console.log("No books found with a slash in the name.");
            if (req.io) {
                req.io.emit('validateMessage', 'No books found with a slash in the name.');
            }
            client.release();
            isValidating = false;
            return;
        }

        const totalBooks = books.length;
        let processedBooks = 0;

        for (const book of books) {
            try {
                const { id, book_name, author_id } = book;

                let authorNames;
                if (author_id.includes(',')) {
                    const authorIds = author_id.split(',').map(id => parseInt(id.trim(), 10));
                    
                    // Fetch author names for multiple authors
                    const { rows: authorNamesData } = await client.query(`
                        SELECT author_name 
                        FROM authors 
                        WHERE id = ANY($1::int[])
                    `, [authorIds]);

                    authorNames = authorNamesData.map(author => author.author_name).join(', ');
                } else {
                    // Fetch author name for a single author_id
                    const { rows: singleAuthorData } = await client.query(`
                        SELECT author_name 
                        FROM authors 
                        WHERE id = $1
                    `, [parseInt(author_id, 10)]);
                    
                    authorNames = singleAuthorData[0]?.author_name || '';
                }

                console.log(`Processing book: ${book_name} by ${authorNames}`);

                // Prepare a chat session and format the prompt for the book name
                const chatSession = model.startChat({
                    generationConfig,
                    history: [
                        {
                          role: "user",
                          parts: [
                            {text: "write the name of this book \"Lord Harry's Folly/Lord Harry\" by Catherine Coulter without a slash. return the book name only, even at any circumstance"},
                          ],
                        },
                        {
                          role: "model",
                          parts: [
                            {text: "Lord Harry\n"},
                          ],
                        },
                        {
                          role: "user",
                          parts: [
                            {text: "write the name of this book \"Harry Potter and the Sorcerer's / Philosopher's Stone\" by jk Rowling without a slash. return the book name only, even at any circumstance"},
                          ],
                        },
                        {
                          role: "model",
                          parts: [
                            {text: "Harry Potter and the Sorcerer's Stone\n"},
                          ],
                        },
                    ],
                });

                const result = await chatSession.sendMessage(`write the name of this book "${book_name}" by ${authorNames} without a slash. return the book name only, even at any circumstance`);
                const updatedName = result.response.text().trim();

                // Update the book name in the database
                await client.query(
                    `UPDATE books SET book_name = $1 WHERE id = $2`,
                    [updatedName, id]
                );

                console.log(`Book name updated to: ${updatedName}`);

                processedBooks++;
                const progressPercentage = ((processedBooks / totalBooks) * 100).toFixed(2);
                console.log(`Progress: ${processedBooks}/${totalBooks} (${progressPercentage}%)\n`);

                // Emit progress if using Socket.IO
                if (req.io) {
                    req.io.emit('validateBookNameProgress', `${processedBooks}/${totalBooks}`);
                }

            } catch (bookError) {
                console.error(`Error processing book ID ${book.id}:`, bookError.message);
            }
        }

        // Release the client connection
        client.release();
        isValidating = false;

    } catch (error) {
        console.error('Error during book name validation:', error.message);
        isValidating = false;
        setTimeout(() => validateBookName(req, res), 5000);
    }
};

module.exports = { validateBookName };
