const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Try to load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.log("No API Key found");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // List models is not directly on genAI in some versions of SDK, 
        // but let's try calling it via fetch if needed.
        // Actually, let's just try several model names.
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.0-flash",
            "gemini-pro"
        ];

        console.log("Checking model availability for key starting with:", apiKey.substring(0, 5));
        
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("test");
                console.log(`✅ SUCCESS: ${modelName} is available.`);
            } catch (err) {
                console.log(`❌ FAILED: ${modelName} - ${err.message}`);
            }
        }
    } catch (error) {
        console.error("List Test Failed:", error.message);
    }
}

listModels();
