const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Testing Gemini API Key:", apiKey ? `${apiKey.substring(0, 8)}...` : "NOT FOUND");

  if (!apiKey) {
    console.error("No API key found in .env.local!");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTest = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

  for (const modelName of modelsToTest) {
    console.log(`\n--- Testing Model: ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = "Say 'Hello' in Tagalog.";
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(`✅ SUCCESS! Response: "${response.text()}"`);
    } catch (err) {
      console.error(`❌ FAILED for ${modelName}:`, err.message);
      if (err.status) console.error(`Error Status: ${err.status}`);
    }
  }
  process.exit(0);
}

testGemini();
