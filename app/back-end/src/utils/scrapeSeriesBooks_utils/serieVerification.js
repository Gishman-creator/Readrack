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

async function serieVerification(serie1Text, serie_name) {
  const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-8b",
  });

  const chatSession = model.startChat({
      generationConfig,
      history: [
          {
              role: "user",
              parts: [
                  { text: "are Three Cities and Three Cities Trilogy the same series, answer yes or no only don't add anything at any occasion" },
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
                  { text: "from this text return the name of the serie only: Publication Order of Wishing Chair Books" },
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
                  { text: "from this text return the name of the serie only: Publication Order of African Trilogy Books" },
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
  const serie_name2 = result.response.text().trim();

  if (serie_name2) {
      const result = await chatSession.sendMessage(`are ${serie_name2} and ${serie_name} the same series, answer yes or no only don't add anything at any occasion`);
      return result.response.text().trim().toLowerCase() === "yes";
  }
}

module.exports = { serieVerification };
