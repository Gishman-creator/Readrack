// userAgentGenerator.js
const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config()

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

const generateRandomUserAgent = async () => {
    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        { text: "generate for me a random user agent header from windows chrome, return the user agent header only" },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36\n" },
                    ],
                },
            ],
        });

        const result = await chatSession.sendMessage("generate for me a random user agent header from windows chrome, return the user agent header only and don't give me the same user agent headers");
        const userAgent = result.response.text().trim(); // Get the user agent header text
        return userAgent;
    } catch (error) {
        console.error('Error generating user agent:', error.message);
        throw error; // Rethrow the error for handling in calling function
    }
};

module.exports = { generateRandomUserAgent };
