const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function checkQuota() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local!");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"];

  for (const modelName of models) {
    console.log(`\n--- Checking Quota for ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("High-speed quota check. Reply with 'OK'.");
      const text = (await result.response).text();
      console.log(`✅ ${modelName}: STATUS OK! Response: ${text}`);
    } catch (err) {
      console.error(`❌ ${modelName}: FAILED!`);
      console.error(`   - Status Code: ${err.status}`);
      console.error(`   - Message: ${err.message}`);
      
      if (err.message.includes("429") || err.message.includes("quota")) {
        console.error("   - QUOTA RESULT: EXCEEDED (Free tier limit hit 🛑)");
      } else if (err.message.includes("404")) {
        console.error("   - QUOTA RESULT: NOT FOUND (This model is not enabled for your key 🔍)");
      } else if (err.message.includes("403")) {
        console.error("   - QUOTA RESULT: FORBIDDEN (API Key mismatch or permission issue 🔑)");
      } else {
        console.error("   - QUOTA RESULT: OTHER ERROR (Possible network or SDK mismatch)");
      }
    }
  }
}

checkQuota();
