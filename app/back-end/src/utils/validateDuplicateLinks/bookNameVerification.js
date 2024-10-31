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

async function bookNameVerification(book_names, book_name) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-8b",
    });

    // console.log(book_name1, "and", book_name2);

    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [
                    { text: "among these books '[0]: Friend or Fiend? with the Pain and the Great One; [1]: Soupy Saturdays with the Pain and the Great One; [2]: Cool Zone with the Pain and the Great One' which one is the same as 'Cool Zone with the Pain and the Great One', return one 'index' or if none return 'none' only don't add anything at any occasion" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "2\n" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "among these books '[0]: Basketful of Heads (2019-) #4; [1]: Hill House (2019-) Sampler (Digital Version) #1 (Basketful of Heads (2019-)); [2]: Basketful of Heads (2019-) #1' which one is the same as 'Basketful of Heads #4', return one 'index' or if none return 'none' only don't add anything at any occasion" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "0\n" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "among these books '[0]: Cat Kid Comic Club: Influencers; [1]: Cat Kid Comic Club: Collaborations' which one is the same as 'Cat Kid Comic Club: Influencers', return one 'index' or if none return 'none' only don't add anything at any occasion" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "0\n" },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(`among these books '${book_names}' which one is the same as '${book_name}', return one 'index' or if none return 'none' only don't add anything else unless the 'index' or 'none' at any occasion`);
    const answer = result.response.text().trim().toLowerCase();
    return answer;
}

module.exports = { bookNameVerification };
