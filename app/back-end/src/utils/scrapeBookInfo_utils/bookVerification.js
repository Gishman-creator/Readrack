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

async function bookVerification(bookH3, bookName) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
  });

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          { text: "is this google search link heading 'Tik-Tok of Oz: Baum, L. Frank: 9781482636635' for this book 'Tiktok and the Nome King by Baum L. Frank'. return yes or no only and any circumstance" },
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
          { text: "is this google search link heading 'Tiktok and the Nome King: Baum, L. Frank - Books' for this book 'Tiktok and the Nome King by Baum L. Frank'. return yes or no only and any circumstance" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "yes\n" },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(`is this google search link heading '${bookH3}' for this book '${bookName}'. return yes or no only and any circumstance`);
  return result.response.text().trim().toLowerCase() === "yes";
}

module.exports = { bookVerification };
