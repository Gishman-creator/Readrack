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

async function serieVerification(series) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-8b",
    });

    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
              role: "user",
              parts: [
                {text: "from these series return only the original serie name excluding their different versions in there are versions in these: James Bond - Extended Series, James Bond (Original Series), James Bond. Return the serie names separated by commas."},
              ],
            },
            {
              role: "model",
              parts: [
                {text: "James Bond\n"},
              ],
            },
            {
              role: "user",
              parts: [
                {text: "from these series return only the original serie name excluding their different versions in there are versions in these: Les Rougon-Macquart, Les Rougon-Macquart, Three Cities Trilogy, Les Quatre Évangiles, Stories for Ninon, Os Rougon-Macquart. Return the serie names separated by commas."},
              ],
            },
            {
              role: "model",
              parts: [
                {text: "Les Rougon-Macquart, Three Cities Trilogy, Les Quatre Évangiles, Stories for Ninon\n"},
              ],
            },
            {
                role: "user",
                parts: [
                    { text: "from this text return the name of the serie only and don't include 'the' definite article: Publication Order of Game Of Thrones Graphic Novels" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "Game Of Thrones\n" },
                ],
            },
          ],
        });
      
    const result = await chatSession.sendMessage(`from these series return only the original serie name excluding their different versions in there are versions in these: ${series}. Return the serie names separated by commas.`);
    return result.response.text();
}

module.exports = { serieVerification };
