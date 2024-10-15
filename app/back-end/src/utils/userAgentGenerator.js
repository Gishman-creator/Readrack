const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();
const prod = process.env.NODE_ENV === "production";

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

const historyFilePath = prod ? path.join(__dirname, './src/assets/conversation_history.json') : './src/assets/conversation_history.json';
let history = [];

// Initialize or load the history
try {
    if (fs.existsSync(historyFilePath)) {
        const historyData = fs.readFileSync(historyFilePath, 'utf8');
        if (historyData) {
            history = JSON.parse(historyData); // Parse only if the file contains valid JSON
        }
    } else {
        fs.writeFileSync(historyFilePath, '[]'); // If the file doesn't exist, create an empty array
    }
} catch (error) {
    console.error('Error loading history:', error.message);
    history = []; // If there's an error, initialize history as an empty array
}

const generateRandomUserAgent = async () => {
    try {
        const chatSession = model.startChat({
            generationConfig,
            history: history
        });

        // Send the message and get the user agent from the response
        const result = await chatSession.sendMessage("generate for me a random user agent header from windows chrome, return the user agent header only and don't give me the same user agent headers");

        // Extract the user agent
        const userAgent = result.response.text().trim();

        // Log the user agent for debugging purposes
        console.log("Generated user agent:", userAgent);

        // Append the conversation to history as separate objects
        history.push({
            role: "user",
            parts: [
                { text: "generate for me a random user agent header from windows chrome, return the user agent header only" },
            ],
        });

        history.push({
            role: "model",
            parts: [
                { text: userAgent }
            ],
        });

        // Save the updated history to the file
        fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));

        return userAgent;
    } catch (error) {
        console.error('Error generating user agent:', error.message);
        throw error;
    }
};

module.exports = { generateRandomUserAgent };
