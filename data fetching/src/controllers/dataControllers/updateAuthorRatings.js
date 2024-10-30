const poolpg = require('../../config/dbpg3');
const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY; // Ensure your API key is securely stored in env variables
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize the Gemini model
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

// Function to get the rating of an author from the Gemini API
const getAuthorRating = async (author_name) => {
    try {
        // Use Gemini API to fetch rating information
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                  role: "user",
                  parts: [
                    {text: "From what you know, rate the author Jean Devanny according to popularity from 1 to 10. Regardless of where you have data just base on your corrent knowledge and you must return the rating as integer only."},
                  ],
                },
                {
                  role: "model",
                  parts: [
                    {text: "3\n"},
                  ],
                },
              ], // No history is retained
        });

        const response = await chatSession.sendMessage(`
            From what you know, rate the author ${author_name} according to popularity from 1 to 10. Regardless of where you have data just base on your corrent knowledge and you must return the rating as integer only.
        `);

        // Extract the response text and return the rating
        return response.response.text().trim(); // Ensure we only get the rating as text
    } catch (error) {
        console.error(`Error fetching rating for ${author_name}:`, error.message);
        return null;
    }
};

// Function to update author ratings in the database

let isValidating = false; // Lock variable

const updateAuthorRatings = async (req, res) => {
    if (isValidating) {
        return res.status(200).json({ message: "Validate process already running." });
    }

    isValidating = true; // Set lock

    let client;
    try {
        // Connect to the database
        client = await poolpg.connect();

        // Fetch authors with missing ratings
        const { rows: authors } = await client.query(`
            SELECT id, author_name FROM authors 
            WHERE rating IS NULL;
        `);

        // Check if there are no authors with missing ratings
        if (authors.length === 0) {
            console.log("No authors with missing ratings found.");
            if (req.io) {
                req.io.emit('ratingMessage', 'No authors to validate.');
            }
            return res.status(400).json({ message: "No authors with missing ratings found. Process stopped." });
        }

        // Total authors to process
        const totalAuthors = authors.length;
        let processedAuthors = 0;

        // Loop through authors and fetch ratings from the Gemini API
        for (const author of authors) {
            const { id, author_name } = author;

            console.log(`Processing author: ${author_name}`);

            // Query Gemini API for the rating
            const rating = await getAuthorRating(author_name);

            if (rating !== null) {
                // Update the rating in the database
                await client.query(`
                    UPDATE authors 
                    SET rating = $1 
                    WHERE id = $2;
                `, [rating, id]);

                // Increment progress
                processedAuthors++;

                // Calculate progress percentage
                const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
                const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;

                // Emit progress updates via Socket.IO
                if (req.io) {
                    req.io.emit('authorRatingsProgress', progress);
                }

                // Log the progress
                console.log(`Updated author ID ${id} with rating: ${rating}. Progress: ${progress}`);
            } else {
                console.log(`Skipping author ${author_name} due to API error.`);
            }
        }

        return res.status(200).json({ message: "Author ratings update completed successfully." });
    } catch (error) {
        console.error('Error during author rating update:', error.message);
        isValidating = false; // Release lock in case of error

        // Retry after delay
        setTimeout(() => {
            updateAuthorRatings(req, res); // Restart the function
        }, 5000);

        // return res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
};

// Export the update function to be used in the route
module.exports = { updateAuthorRatings };
