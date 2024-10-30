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

async function serieVerification(serie_name1, serie_name2) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-8b",
    });

    // console.log(serie_name1, "and", serie_name2);

    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [
                    { text: "are Three Cities and Three Cities Trilogy the same book series, answer yes or no only don't add anything at any occasion" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "yes\n" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "are Just series and Just series the same book series, answer yes or no only don't add anything at any occasion" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "yes\n" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "are Just Ender's Saga and Ender's Saga the same book series, answer yes or no only don't add anything at any occasion" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "yes\n" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "are Ender's Saga and Enderverse: Publication Order the same book series, answer yes or no only don't add anything at any occasion" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "no\n" },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(`are ${serie_name1} and ${serie_name2} the same series, answer yes or no only don't add anything at any occasion`);
    const answer = result.response.text().trim().toLowerCase();
    return answer === "yes";
}

module.exports = { serieVerification };
