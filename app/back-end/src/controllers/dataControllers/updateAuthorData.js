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

// Function to connect to the Gemini API and update the database
const updateAuthorData = async (req, res) => {
    try {
        // Connect to the database
        const client = await poolpg.connect();

        // Fetch authors with missing data
        const { rows: authors } = await client.query(`
            SELECT id, author_name FROM authors 
            WHERE nationality IS NULL OR bio IS NULL OR awards IS NULL;
        `);

        // Check if there are no authors with missing data
        if (authors.length === 0) {
            console.log("No authors with missing data found.");
            // Send response and stop further execution
            res.status(200).json({ message: "No authors with missing data found. Process stopped." });
            client.release();
            return; // Stop further execution
        }

        // Send an initial response to keep the request open
        res.status(200).json({ message: "Author data update started:" });

        // Total authors to process
        const totalAuthors = authors.length;
        let processedAuthors = 0;

        // Loop through authors and fetch data from the Gemini API
        for (const author of authors) {
            const { id, author_name } = author;

            // console.log(`Processing author: ${author_name}`);

            // Query Gemini API for missing details
            const nationality = await getNationality(author_name);
            const bio = await getBio(author_name);
            const awards = await getAwards(author_name);

            // Update the author in the database
            await client.query(`
                UPDATE authors 
                SET nationality = $1, bio = $2, awards = $3 
                WHERE id = $4;
            `, [nationality, bio, awards, id]);

            // Increment progress
            processedAuthors++;

            // Calculate progress percentage
            const progressPercentage = ((processedAuthors / totalAuthors) * 100).toFixed(2);
            const progress = `${processedAuthors}/${totalAuthors} (${progressPercentage}%)`;

            // Emit progress updates via Socket.IO
            if (req.io) {
                req.io.emit('progress', progress);
            }

            // console.log(`Updated author ID ${id} and progress: ${progress}`);
        }

        client.release(); // Release the client back to the pool
    } catch (error) {
        console.error('Error during author update:', error.message);

        // Retry after a delay if there's an error
        // setTimeout(() => updateAuthorData(req, res), 5000); // Retry every 5 seconds if there is an error
    }
};

// Functions to get data from the Gemini API
const getNationality = async (author_name) => {
    try {
        // Use Gemini API to fetch nationality
        const chatSession = model.startChat({
            generationConfig,
            history: [], // No history is retained
        });
        const response = await chatSession.sendMessage(`Write down the nationality only of ${author_name}, and if English write down 'British' only.`);
        return await response.response.text();
    } catch (error) {
        console.error(`Error fetching nationality for ${author_name}:`, error.message);
        return null;
    }
};

const getBio = async (author_name) => {
    try {
        // Use Gemini API to fetch bio
        const chatSession = model.startChat({
            generationConfig,
            history: [], // No history is retained
        });
        const response = await chatSession.sendMessage(`Write down a small bio about ${author_name}, not more than 60 words and start with the full names.`);
        return await response.response.text();
    } catch (error) {
        console.error(`Error fetching bio for ${author_name}:`, error.message);
        return null;
    }
};

const getAwards = async (author_name) => {
    try {
        // Use Gemini API to fetch awards
        const chatSession = model.startChat({
            generationConfig,
            history: [], // No history is retained
        });
        const response = await chatSession.sendMessage(`Write down only the awards won by ${author_name} and don't add any words. Use this format: 'award_1 (year_received), award_2 (year_received), award_3 (year_received), award_4 (year_received), award_5 (year_received),...' max of 5. If more, add '...'. If none, write 'None'.`);
        return await response.response.text();
    } catch (error) {
        console.error(`Error fetching awards for ${author_name}:`, error.message);
        return null;
    }
};

// Export the update function to be used in the route
module.exports = { updateAuthorData };
