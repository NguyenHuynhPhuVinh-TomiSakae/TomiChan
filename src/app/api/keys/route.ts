import { NextResponse } from "next/server";

export async function GET() {
  const keys = {
    google: process.env.GEMINI_API_KEY || "",
    groq: process.env.GROQ_API_KEY || "",
    together: process.env.TOGETHER_API_KEY || "",
    openrouter: process.env.OPENROUTER_API_KEY || "",
    googleSearch: {
      apiKey: process.env.CUSTOM_SEARCH_API_KEY || "",
      cseId: process.env.CUSTOM_SEARCH_CSE_ID || "",
    },
    e2b: process.env.E2B_API_KEY || "",
  };

  return NextResponse.json(keys);
}
