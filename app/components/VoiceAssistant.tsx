"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, Brain, Loader2, AlertCircle } from "lucide-react"

interface VoiceAssistantProps {
  onVoiceCommand: (command: string) => void
  isProcessing?: boolean
  response?: string
  showMessage?: (text: string, type: "success" | "error" | "info") => void
}

export default function VoiceAssistant({
  onVoiceCommand,
  isProcessing = false,
  response = "",
  showMessage = () => {},
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const [volume, setVolume] = useState(0)
  const [error, setError] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isCleaningUpRef = useRef(false)
  const voicesLoadedRef = useRef(false)

  useEffect(() => {
    initializeVoiceAssistant()
    return () => cleanup()
  }, [])

  useEffect(() => {
    if (response && response.trim() && speechSupported) {
      speakResponse(response)
    }
  }, [response, speechSupported])

  const initializeVoiceAssistant = () => {
    try {
      // Check speech recognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        setupSpeechRecognition(SpeechRecognition)
      } else {
        setError("Speech recognition not supported in this browser")
        return
      }

      // Check speech synthesis support
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis
        setSpeechSupported(true)
        setupSpeechSynthesis()
      } else {
        setError("Speech synthesis not supported in this browser")
      }
    } catch (error) {
      console.error("Error initializing voice assistant:", error)
      setError("Failed to initialize voice assistant")
    }
  }

  const setupSpeechRecognition = (SpeechRecognition: any) => {
    try {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started")
        setIsListening(true)
        setError("")
        startVolumeMonitoring()
      }

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(interimTranscript || finalTranscript)

        if (finalTranscript.trim()) {
          console.log("Final transcript:", finalTranscript)
          onVoiceCommand(finalTranscript.trim())
          setTranscript("")
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setError(`Recognition error: ${event.error}`)
        setIsListening(false)
        stopVolumeMonitoring()

        // Auto-retry for certain errors
        if (event.error === "network" || event.error === "audio-capture") {
          setTimeout(() => {
            if (!isListening) {
              setError("")
            }
          }, 3000)
        }
      }

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended")
        setIsListening(false)
        stopVolumeMonitoring()
      }
    } catch (error) {
      console.error("Error setting up speech recognition:", error)
      setError("Failed to setup speech recognition")
    }
  }

  const setupSpeechSynthesis = () => {
    if (!synthRef.current) return

    // Handle voices loading
    const loadVoices = () => {
      const voices = synthRef.current?.getVoices() || []
      console.log("Voices loaded:", voices.length)
      voicesLoadedRef.current = voices.length > 0
    }

    // Load voices immediately if available
    loadVoices()

    // Also listen for voices changed event
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices
    }

    // Fallback: try loading voices after a delay
    setTimeout(loadVoices, 1000)
  }

  const getBestVoice = (): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null

    const voices = synthRef.current.getVoices()
    if (voices.length === 0) return null

    // Try to find the best voice in order of preference
    const preferences = [
      // High quality English voices
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("google") && v.lang.startsWith("en"),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("microsoft") && v.lang.startsWith("en"),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("apple") && v.lang.startsWith("en"),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("samantha"),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("karen"),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("female") && v.lang.startsWith("en"),
      // Any English voice
      (v: SpeechSynthesisVoice) => v.lang === "en-US",
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en-"),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
      // Default voice
      (v: SpeechSynthesisVoice) => v.default,
      // Any voice as last resort
      () => true,
    ]

    for (const preference of preferences) {
      const voice = voices.find(preference)
      if (voice) {
        console.log("Selected voice:", voice.name, voice.lang)
        return voice
      }
    }

    return voices[0] || null
  }

  const cleanTextForSpeech = (text: string): string => {
    return (
      text
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, "Code example")
        .replace(/`([^`]+)`/g, "$1")
        // Remove markdown formatting
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s+/g, "")
        // Remove links and references
        .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")
        .replace(/\[([^\]]+)\]/g, "$1")
        // Remove emojis and special symbols
        .replace(/[🤖🧠⚡🔍🎯📊🚀💡✅❌🔧🛡️📈🎤🔊🎙️]/gu, "")
        // Clean up whitespace and line breaks
        .replace(/\n+/g, ". ")
        .replace(/\s+/g, " ")
        .replace(/\.\s*\./g, ".")
        .trim()
    )
  }

  const speakResponse = async (text: string) => {
    if (!synthRef.current || !text.trim()) {
      console.log("Speech synthesis not available or no text")
      return
    }

    try {
      // Cancel any ongoing speech
      stopSpeaking()

      // Wait a moment for cancellation to complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Clean and prepare text
      const cleanText = cleanTextForSpeech(text)
      if (!cleanText) {
        console.log("No clean text to speak")
        return
      }

      // Limit text length for better performance
      const maxLength = 400
      const finalText =
        cleanText.length > maxLength ? cleanText.substring(0, maxLength).replace(/\s+\S*$/, "") + "..." : cleanText

      console.log("Speaking text:", finalText.substring(0, 100) + "...")

      const utterance = new SpeechSynthesisUtterance(finalText)

      // Set speech parameters
      utterance.rate = 0.85
      utterance.pitch = 1.0
      utterance.volume = 0.8
      utterance.lang = "en-US"

      // Set the best available voice
      const voice = getBestVoice()
      if (voice) {
        utterance.voice = voice
      }

      // Set up event handlers
      utterance.onstart = () => {
        console.log("Speech started")
        setIsSpeaking(true)
        setError("")
      }

      utterance.onend = () => {
        console.log("Speech ended")
        setIsSpeaking(false)
        currentUtteranceRef.current = null
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
        setIsSpeaking(false)
        currentUtteranceRef.current = null

        // Don't show error for common issues, just log them
        if (event.error !== "interrupted" && event.error !== "canceled") {
          showMessage("Voice response failed, but text is available", "info")
        }
      }

      // Store current utterance
      currentUtteranceRef.current = utterance

      // Speak the utterance
      synthRef.current.speak(utterance)
    } catch (error) {
      console.error("Error in speech synthesis:", error)
      setIsSpeaking(false)
      showMessage("Voice synthesis error occurred", "info")
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      try {
        synthRef.current.cancel()
        setIsSpeaking(false)
        currentUtteranceRef.current = null
      } catch (error) {
        console.error("Error stopping speech:", error)
      }
    }
  }

  const startVolumeMonitoring = async () => {
    try {
      cleanupAudioResources()

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContextClass()

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume()
      }

      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)

      microphoneRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateVolume = () => {
        if (analyserRef.current && !isCleaningUpRef.current) {
          try {
            analyserRef.current.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((a, b) => a + b) / bufferLength
            setVolume(Math.min(100, (average / 255) * 100))
          } catch (error) {
            console.warn("Error updating volume:", error)
          }
        }
      }

      volumeIntervalRef.current = setInterval(updateVolume, 100)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setError("Microphone access denied")
    }
  }

  const stopVolumeMonitoring = () => {
    cleanupAudioResources()
  }

  const cleanupAudioResources = () => {
    try {
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current)
        volumeIntervalRef.current = null
      }

      if (microphoneRef.current) {
        microphoneRef.current.disconnect()
        microphoneRef.current = null
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(console.warn)
      }
      audioContextRef.current = null
      analyserRef.current = null

      setVolume(0)
    } catch (error) {
      console.error("Error cleaning up audio resources:", error)
    }
  }

  const cleanup = () => {
    if (isCleaningUpRef.current) return
    isCleaningUpRef.current = true

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }

      stopSpeaking()
      stopVolumeMonitoring()
    } catch (error) {
      console.error("Error during cleanup:", error)
    } finally {
      isCleaningUpRef.current = false
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setError("")
        recognitionRef.current.start()
      } catch (error) {
        console.error("Error starting recognition:", error)
        setError("Failed to start listening")
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error("Error stopping recognition:", error)
      }
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else if (response && response.trim()) {
      speakResponse(response)
    }
  }

  if (!isSupported) {
    return (
      <Card className="bg-red-600/20 backdrop-blur-sm border-red-500/30">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <div>
              <div className="font-medium">Voice Assistant Not Supported</div>
              <div className="text-sm">Your browser doesn't support speech recognition</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/20 hover:bg-black/50 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Voice Assistant</span>
            {speechSupported && <div className="w-2 h-2 bg-green-500 rounded-full" title="Speech synthesis ready" />}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSpeaking}
              disabled={!speechSupported || (!isSpeaking && !response?.trim())}
              className="text-white hover:bg-white/10"
              title={isSpeaking ? "Stop speaking" : "Speak response"}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <Button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`relative ${
              isListening ? "bg-red-600/80 hover:bg-red-700/80" : "bg-blue-600/80 hover:bg-blue-700/80"
            } transition-all duration-300`}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            <span className="ml-2">
              {isProcessing ? "Processing..." : isListening ? "Stop Listening" : "Start Listening"}
            </span>
          </Button>

          {isListening && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm">Listening...</span>
            </div>
          )}

          {isSpeaking && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Speaking...</span>
            </div>
          )}
        </div>

        {/* Volume indicator */}
        {isListening && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 text-white/60" />
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${volume}%` }}
                ></div>
              </div>
              <span className="text-white/60 text-xs">{Math.round(volume)}%</span>
            </div>
          </div>
        )}

        {/* Transcript display */}
        {transcript && (
          <div className="mb-4 p-3 bg-white/10 rounded-md">
            <div className="text-white/80 text-sm">
              <span className="text-blue-400 font-medium">You said: </span>
              {transcript}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500/30 rounded-md">
            <div className="text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Voice commands help */}
        <div className="text-white/60 text-xs">
          <div className="font-medium mb-1">Try saying:</div>
          <div className="space-y-1">
            <div>"Generate a React component"</div>
            <div>"Convert JavaScript to Python"</div>
            <div>"Go to dashboard"</div>
            <div>"Help me with coding"</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
