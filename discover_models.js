const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function test() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const keyMatch = env.match(/GEMINI_API_KEY="(.+?)"/);
        const apiKey = keyMatch ? keyMatch[1] : null;

        if (!apiKey) return;

        const genAI = new GoogleGenerativeAI(apiKey);
        // In the SDK, listing models is a bit different.
        // Actually, we can use the fetch API to call the list endpoint.
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await resp.json();
        
        fs.writeFileSync('available_models.json', JSON.stringify(data, null, 2));
    } catch (e) {
        fs.writeFileSync('available_models.json', JSON.stringify({ error: e.message }));
    }
}

test();
