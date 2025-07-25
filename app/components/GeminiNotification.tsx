"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, X, Brain } from "lucide-react"

export default function GeminiNotification() {
  const [isVisible, setIsVisible] = useState(true)
  const [hasValidApiKey, setHasValidApiKey] = useState(false)

  useEffect(() => {
    // Check for a valid Gemini API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    const isValid = apiKey && apiKey !== "your-api-key-here" && apiKey.length > 10

    setHasValidApiKey(!!isValid)

    // Auto-hide if valid API key is present
    if (isValid) {
      const timer = setTimeout(() => setIsVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <Card
      className={`fixed top-4 left-4 right-4 z-40 backdrop-blur-sm border-opacity-50 max-w-md mx-auto ${
        hasValidApiKey ? "bg-green-600/90 border-green-500/50" : "bg-blue-600/90 border-blue-500/50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {hasValidApiKey ? (
            <Brain className="w-5 h-5 text-green-200 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-200 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h4 className={`font-semibold text-sm ${hasValidApiKey ? "text-green-100" : "text-blue-100"}`}>
              {hasValidApiKey ? "Gemini AI Active" : "Demo Mode Active"}
            </h4>
            <p className={`text-xs mt-1 ${hasValidApiKey ? "text-green-200" : "text-blue-200"}`}>
              {hasValidApiKey
                ? "Real Gemini AI responses are enabled. Enjoy the full AI experience!"
                : "Using enhanced demo responses. Add your Gemini API key (NEXT_PUBLIC_GEMINI_API_KEY) to enable real AI functionality."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className={`p-1 h-auto ${
              hasValidApiKey
                ? "text-green-200 hover:text-green-100 hover:bg-green-700/50"
                : "text-blue-200 hover:text-blue-100 hover:bg-blue-700/50"
            }`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
