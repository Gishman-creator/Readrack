const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

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

async function generatePublishDate(author_name, book_name) {
    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [
                    { text: "write down the publish date only of the book Silverwood: The Door by Brian Keene. In the format of Month, D YYYY or Month YYY if only the month and year is known or YYYY if the year is only known" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "March 28, 2023\n" },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(`write down the publish date only, of the book ${book_name} by ${author_name}. In the format of Month, D YYYY or Month YYY if only the month and year is known or YYYY if the year is only known`);
    return result.response.text();
}

module.exports = { generatePublishDate };