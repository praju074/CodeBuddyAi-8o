import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt } = await request.json()

    // Use Gemini API key
    const geminiApiKey = "AIzaSyCKATUGLW_-bPTdEjA2q8RgnOfnrcBB_Ts"

    if (!geminiApiKey) {
      return NextResponse.json({
        text: `Demo Response: This is a mock AI response for "${prompt}". To enable real AI functionality, please add your Gemini API key to the environment variables.`,
        isDemo: true,
      })
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash", {
        apiKey: geminiApiKey,
      }),
      prompt: prompt,
      system: systemPrompt || "You are a helpful coding assistant. Provide clear, concise, and accurate responses.",
    })

    return NextResponse.json({ text, isDemo: false })
  } catch (error) {
    console.error("Gemini AI API Error:", error)
    return NextResponse.json(
      {
        text: `Fallback Response: Error occurred while connecting to Gemini AI. Original prompt: "${request.body?.prompt || "Unknown"}". Please check your Gemini API key configuration.`,
        isDemo: true,
        error: "Gemini API error",
      },
      { status: 200 },
    )
  }
}
