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

async function getBookGenres(author_name, book_name) {
    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [
                    { text: "write down the genre only of the book Silverwood: The Door by Brian Keene" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "Horror, Fantasy\n" },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(`for this book ${book_name} by ${author_name} list all it's genres separated by commas`);
    return result.response.text().trim();
}

module.exports = { getBookGenres };