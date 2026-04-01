import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key starting with:", apiKey ? apiKey.substring(0, 8) : "NONE");
    
    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing in .env.local");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Say hello in Tagalog");
        console.log("Gemini Response:", result.response.text());
    } catch (err) {
        const errorDetails = {
            message: err.message,
            status: err.status,
            response: err.response,
            stack: err.stack
        };
        import('fs').then(fs => {
            fs.writeFileSync('gemini_error_debug.json', JSON.stringify(errorDetails, null, 2));
            console.log("Error written to gemini_error_debug.json");
        });
    }
}

testGemini();
