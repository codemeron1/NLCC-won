import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { uploadImageToSupabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { topic, gradeLevel } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Teacher Generate: Using Gemini API Key (Prefix):", apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured in .env.local" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const prompt = `
      You are an expert Filipino teacher. Create a Tagalog lesson about "${topic}" for ${gradeLevel} students.
      The lesson should be interactive and engaging for children.
      Return the response in strictly JSON format with this structure:
      {
        "title": "A catchy Filipino title",
        "description": "A short engaging description in Tagalog",
        "category": "Reading",
        "image": "A short English phrase describing the main visual for the lesson cover (e.g. 'colorful Filipino classroom')",
        "items": [
          {
            "primaryText": "The Filipino word or phrase",
            "secondaryText": "The English translation",
            "image": "A short English phrase describing the item (e.g. 'happy red apple')",
            "emoji": "A single relevant unicode emoji (e.g. '🍎')",
            "pronunciation": "Phonetic pronunciation"
          }
        ]
      }
      Include at least 6 vocabulary items.
    `;

    console.log(`Teacher Generate: Requesting AI for topic "${topic}"...`);

    const generateWithRetry = async (modelName: string, maxRetries = 2) => {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: { 
                        responseMimeType: "application/json",
                        temperature: 0.7,
                    }
                });
                const result = await model.generateContent(prompt);
                console.log(`Teacher Generate: Success with model ${modelName}`);
                return result;
            } catch (error: any) {
                lastError = error;
                console.error(`Teacher Generate: Attempt ${i+1} failed for ${modelName}:`, error.message);
                if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
                    console.warn(`Quota hit for ${modelName}, retry ${i + 1}/${maxRetries} after delay (5s)...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                throw error;
            }
        }
        throw lastError;
    };

    let result;
    try {
        // Try the newest 2.0-flash model first
        result = await generateWithRetry("gemini-2.0-flash");
    } catch (error: any) {
        // If 2.0-flash fails (especially status 429), try stable 1.5 versions
        console.warn(`Gemini 2.0 failed, trying 1.5-flash fallback...`);
        try {
            result = await generateWithRetry("gemini-1.5-flash");
        } catch (innerError: any) {
            console.error(`Gemini 1.5-flash also failed. Attempting final Pro fallback...`);
            result = await generateWithRetry("gemini-1.5-pro");
        }
    }

    const response = await result.response;
    const text = response.text();
    console.log("Teacher Generate: Raw Response Length:", text.length);
    const data = JSON.parse(text);

    // Helper to generate and upload image
    const processImage = async (desc: string, type: 'icon' | 'item', seed: number) => {
        try {
            // Using Pollinations as the primary generator for children's art style for stability
            const cleanDesc = desc.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).join("-");
            const pollPrompt = encodeURIComponent(`high quality cute ${cleanDesc} 3d clay style illustration for kids, isolated on white background, masterpiece, studio lighting`);
            const url = `https://pollinations.ai/p/${pollPrompt}?width=512&height=512&nologo=true&seed=${seed}`;
            
            // Validate URL (simple ping or just return)
            return url;
        } catch (error) {
            console.error(`Image generation URL build failed for "${desc}":`, error);
            return "";
        }
    };

    // Transform short descriptions into full AI image URLs
    const seeds = data.items.map(() => Math.floor(Math.random() * 1000000));
    const iconUrl = await processImage(data.image || data.title, 'icon', Math.floor(Math.random() * 1000000));
    const itemUrls = await Promise.all(
        data.items.map((item: any, idx: number) => processImage(item.image || item.primaryText, 'item', seeds[idx]))
    );

    const lessonData = {
        ...data,
        icon: iconUrl,
        items: data.items.map((item: any, index: number) => ({
            ...item,
            imageEmoji: itemUrls[index], // This is the image URL
            emoji: item.emoji || '⭐' // This is the backup emoji
        }))
    };

    return NextResponse.json(lessonData);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    // Check if it's a rate limit error (429)
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
      return NextResponse.json({ 
          error: "API Quota Exceeded", 
          details: "You've reached the Gemini API free tier limit. Please wait a moment before trying again.",
          suggestion: "If this continues, consider checking your API quota in Google AI Studio or switching to a different model." 
      }, { status: 429 });
    }

    return NextResponse.json({ 
        error: "Failed to generate lesson", 
        details: error.message,
        suggestion: "Please check your Gemini API key and internet connection." 
    }, { status: 500 });
  }
}
