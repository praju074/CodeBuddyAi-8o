"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"

export default function DemoNotification() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Card className="fixed top-20 left-4 right-4 z-40 bg-yellow-600/90 backdrop-blur-sm border-yellow-500/50 max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-200 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-yellow-100 font-semibold text-sm">Demo Mode Active</h4>
            <p className="text-yellow-200 text-xs mt-1">
              AI responses are simulated. Add your OpenAI API key to enable real AI functionality.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-yellow-200 hover:text-yellow-100 hover:bg-yellow-700/50 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
