"use client"

interface Message {
  id: string
  text: string
  type: "success" | "error" | "info"
}

interface MessageBoxProps {
  messages: Message[]
}

export default function MessageBox({ messages }: MessageBoxProps) {
  const getMessageColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/80"
      case "error":
        return "bg-red-500/80"
      default:
        return "bg-blue-500/80"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${getMessageColor(message.type)} backdrop-blur-sm text-white p-4 rounded-lg shadow-lg animate-fade-in max-w-sm`}
        >
          {message.text}
        </div>
      ))}
    </div>
  )
}
