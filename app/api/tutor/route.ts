import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, tutorInfo, userName } = await req.json();

        // Check for any viable key name
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        
        if (!apiKey) {
            console.error("DEBUG: No Gemini API key found in environment");
            return NextResponse.json({ message: "Ay naku! Mukhang hindi ko mahanap ang susi sa aking isip. (No API Key found) 🔑" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // System prompt
        const systemPrompt = `You are ${tutorInfo.name}, a friendly AI tutor for NLLC. 
        Personality: ${tutorInfo.description}. Focus: ${tutorInfo.focus}.
        Student's name: ${userName}.
        
        Guidelines:
        1. Be encouraging and fun. Use emojis!
        2. Use simple Taglish for kids (age 5-12).
        3. Keep responses concise (max 3 sentences).
        4. If they ask about Tagalog, explain it simply.
        5. Encourage them to keep learning.
        
        Answer based on the conversation history below:`;

        // Combine history into a single prompt for robustness
        const promptContext = messages.map((m: any) => 
            `${m.role === 'tutor' ? tutorInfo.name : userName}: ${m.content}`
        ).join('\n');

        const finalPrompt = `${systemPrompt}\n\n${promptContext}\n\n${tutorInfo.name}:`;

        const result = await model.generateContent(finalPrompt);
        const text = result.response.text();

        return NextResponse.json({ message: text });
    } catch (error: any) {
        console.error("DEBUG: Tutor AI Critical Error:", error.message);
        
        let userFriendlyMessage = `Ay naku! Medyo nahihilo ako. Maaari mo bang ulitin ang tanong mo? 😵‍💫 Sabi ng system ko: "${error.message}"`;
        
        if (error.message?.includes('429') || error.message?.includes('Quota')) {
            userFriendlyMessage = "Medyo napagod yata ako kaka-kwento! Mag-pahinga muna tayo ng ilang segundo at subukan ulet ha? 🐒💤✨";
        }

        return NextResponse.json({ 
            message: userFriendlyMessage,
            details: error.message 
        }, { status: 500 });
    }
}
