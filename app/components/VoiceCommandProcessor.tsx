"use client"

interface VoiceCommandProcessorProps {
  command: string
  onNavigate: (view: string) => void
  onSetPrompt: (prompt: string) => void
  onExecuteAction: (action: string, data?: any) => void
}

export class VoiceCommandProcessor {
  private command: string
  private onNavigate: (view: string) => void
  private onSetPrompt: (prompt: string) => void
  private onExecuteAction: (action: string, data?: any) => void

  constructor({ command, onNavigate, onSetPrompt, onExecuteAction }: VoiceCommandProcessorProps) {
    this.command = command
    this.onNavigate = onNavigate
    this.onSetPrompt = onSetPrompt
    this.onExecuteAction = onExecuteAction
  }

  processCommand(cmd: string): string {
    const lowerCmd = cmd.toLowerCase().trim()

    // Navigation commands
    if (lowerCmd.includes("go to dashboard") || lowerCmd.includes("show dashboard") || lowerCmd.includes("dashboard")) {
      this.onNavigate("dashboard")
      return "Navigating to dashboard"
    }

    if (lowerCmd.includes("code generator") || lowerCmd.includes("generate code") || lowerCmd.includes("generator")) {
      this.onNavigate("ai-code-generator")
      return "Opening code generator"
    }

    if (lowerCmd.includes("code converter") || lowerCmd.includes("convert code") || lowerCmd.includes("converter")) {
      this.onNavigate("code-converter")
      return "Opening code converter"
    }

    if (lowerCmd.includes("bug recorder") || lowerCmd.includes("record bug") || lowerCmd.includes("bugs")) {
      this.onNavigate("bug-recorder")
      return "Opening bug recorder"
    }

    if (lowerCmd.includes("snippet library") || lowerCmd.includes("my snippets") || lowerCmd.includes("snippets")) {
      this.onNavigate("code-snippet-library")
      return "Opening snippet library"
    }

    // Code generation commands
    if (lowerCmd.includes("generate") || lowerCmd.includes("create") || lowerCmd.includes("build")) {
      const prompt = cmd.replace(/^(generate|create|build)\s*/i, "")
      this.onSetPrompt(prompt)
      this.onExecuteAction("generate-code", { prompt })
      return `Generating code for: ${prompt}`
    }

    // Code conversion commands
    if (lowerCmd.includes("convert") && (lowerCmd.includes("to") || lowerCmd.includes("from"))) {
      this.onExecuteAction("convert-code", { command: cmd })
      return "Processing code conversion request"
    }

    // Help commands
    if (lowerCmd.includes("help") || lowerCmd.includes("what can you do")) {
      return `I can help you with:
      - Generate code: Say "Generate a React component"
      - Convert code: Say "Convert JavaScript to Python"
      - Navigate: Say "Go to dashboard" or "Open code generator"
      - Debug: Say "Help me debug this error"
      - Explain: Say "Explain this code"`
    }

    // Default: treat as code generation prompt
    if (cmd.length > 10) {
      this.onSetPrompt(cmd)
      return `I'll help you with: ${cmd}. Please navigate to the appropriate tool or I can generate code for you.`
    }

    return "I didn't understand that command. Try saying 'help' to see what I can do."
  }
}

export default function VoiceCommandProcessorComponent(props: VoiceCommandProcessorProps) {
  const processor = new VoiceCommandProcessor(props)
  return null // This is just a utility component
}
