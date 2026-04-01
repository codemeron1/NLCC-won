import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const models = await genAI.listModels();
    console.log("Available Models:");
    models.models.forEach((m) => {
      console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(", ")})`);
    });
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
