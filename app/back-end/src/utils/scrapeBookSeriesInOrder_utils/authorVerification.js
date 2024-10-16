// utils/authorVerification.js

const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function areAuthorsSame(author1Text, author2) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-8b",
    });

    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [
                    { text: "are Michael Bond and Mike Bond the same authors, answer yes or no only don't add anything at any occasion" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "no\n" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "from this text return the name of the author only: Michael Bond - Book Series in Order" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "Michael Bond\n" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "from this text return the name of the author only: Mike Bond Books In Order" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "Mike Bond\n" },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(`from this text return the name of the author only: ${author1Text}`);
    const author1 = result.response.text().trim();

    if (author1) {
        const result = await chatSession.sendMessage(`are ${author1} and ${author2} the same authors, answer yes or no only don't add anything at any occasion`);
        return result.response.text().trim().toLowerCase() === "yes";
    }
}

module.exports = { areAuthorsSame };
