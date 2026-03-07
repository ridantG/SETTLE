import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = createClient();
    const { text } = await request.json();

    // Security Check: Ensure a user is logged in to prevent API abuse.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (!text || text.trim().length < 50) {
        return NextResponse.json({ error: 'Please provide at least 50 characters to summarize.' }, { status: 400 });
    }

    // Use the Gemini API key from environment variables (never hardcode secrets)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'AI summarization is not configured.' }, { status: 503 });
    }
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    // This is a professional, detailed prompt that instructs the AI.
    const systemPrompt = `You are a helpful assistant for a roommate finding app called Settle. Your task is to summarize the following user description into a clean, concise, friendly, and positive bulleted list. Use markdown for the bullet points (e.g., "- Item 1"). Extract key lifestyle traits, hobbies, personality, and what they are looking for in a roommate or a living space. Do not add any extra commentary before or after the list. Focus on making the user sound like a great potential roommate.`;
    const userPrompt = `Here is the user's description: "${text}"`;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API responded with status: ${response.status}`);
        }

        const result = await response.json();
        const summary = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!summary) {
            throw new Error("Could not extract summary from Gemini API response.");
        }

        return NextResponse.json({ summary });

    } catch (error) {
        console.error("AI Summarize API Error:", error);
        return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 });
    }
}
