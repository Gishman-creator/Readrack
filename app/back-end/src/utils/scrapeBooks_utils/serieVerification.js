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

async function serieVerification(serie1Text) {
  const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-8b",
  });

  const chatSession = model.startChat({
      generationConfig,
      history: [
          {
              role: "user",
              parts: [
                  { text: "from this text return the name of the serie only and don't include 'the' definite article: Publication Order of Wishing Chair Books" },
              ],
          },
          {
              role: "model",
              parts: [
                  { text: "Wishing Chair\n" },
              ],
          },
          {
              role: "user",
              parts: [
                  { text: "from this text return the name of the serie only and don't include 'the' definite article: Publication Order of African Trilogy Books" },
              ],
          },
          {
              role: "model",
              parts: [
                  { text: "African Trilogy\n" },
              ],
          },
      ],
  });

  const result = await chatSession.sendMessage(`from this text return the name of the serie only: ${serie1Text}`);
  return result.response.text().trim();
}

module.exports = { serieVerification };
