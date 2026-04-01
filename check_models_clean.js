const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function test() {
    // Read from .env.local directly to avoid env issues
    const env = fs.readFileSync('.env.local', 'utf8');
    const keyMatch = env.match(/GEMINI_API_KEY="(.+?)"/);
    const apiKey = keyMatch ? keyMatch[1] : null;

    if (!apiKey) {
        console.log("No API Key found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    let results = [];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("hi");
            results.push(`SUCCESS: ${m}`);
        } catch (e) {
            results.push(`FAILED: ${m} (Error: ${e.message.substring(0, 50)}...)`);
        }
    }
    console.log(results.join('\n'));
}

test();
