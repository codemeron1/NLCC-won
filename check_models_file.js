const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function test() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const keyMatch = env.match(/GEMINI_API_KEY="(.+?)"/);
        const apiKey = keyMatch ? keyMatch[1] : null;

        if (!apiKey) {
            fs.writeFileSync('model_results.txt', "No API Key found");
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
                results.push(`FAILED: ${m} (Error: ${e.message})`);
            }
        }
        fs.writeFileSync('model_results.txt', results.join('\n'));
    } catch (e) {
        fs.writeFileSync('model_results.txt', "Global Error: " + e.message);
    }
}

test();
