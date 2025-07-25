"use client"

import { useEffect, useRef } from "react"

export default function GlitchBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Glitch colors
    const glitchColors = ["#2b4539", "#61dca3", "#61b3dc"]
    const lettersAndSymbols = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "!",
      "@",
      "#",
      "$",
      "&",
      "*",
      "(",
      ")",
      "-",
      "_",
      "+",
      "=",
      "/",
      "[",
      "]",
      "{",
      "}",
      ";",
      ":",
      "<",
      ">",
      ",",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ]

    const fontSize = 16
    const charWidth = 10
    const charHeight = 20
    let mouseX = 0
    let mouseY = 0
    let letters: Array<{
      char: string
      color: string
      targetColor: string
      colorProgress: number
    }> = []
    let grid = { columns: 0, rows: 0 }

    const getRandomChar = () => {
      return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)]
    }

    const getRandomColor = () => {
      return glitchColors[Math.floor(Math.random() * glitchColors.length)]
    }

    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
      hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b
      })

      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
          }
        : null
    }

    const interpolateColor = (start: any, end: any, factor: number) => {
      const result = {
        r: Math.round(start.r + (end.r - start.r) * factor),
        g: Math.round(start.g + (end.g - start.g) * factor),
        b: Math.round(start.b + (end.b - start.b) * factor),
      }
      return `rgb(${result.r}, ${result.g}, ${result.b})`
    }

    const calculateGrid = (width: number, height: number) => {
      const columns = Math.ceil(width / charWidth)
      const rows = Math.ceil(height / charHeight)
      return { columns, rows }
    }

    const initializeLetters = (columns: number, rows: number) => {
      grid = { columns, rows }
      const totalLetters = columns * rows
      letters = Array.from({ length: totalLetters }, () => ({
        char: getRandomChar(),
        color: getRandomColor(),
        targetColor: getRandomColor(),
        colorProgress: 1,
      }))
    }

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }

      const { columns, rows } = calculateGrid(rect.width, rect.height)
      initializeLetters(columns, rows)
    }

    const drawLetters = () => {
      if (!ctx || letters.length === 0) return
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      ctx.font = `${fontSize}px monospace`
      ctx.textBaseline = "top"

      // Parallax effect
      const parallaxFactor = 0.05
      const offsetX = (mouseX / window.innerWidth - 0.5) * parallaxFactor * width
      const offsetY = (mouseY / window.innerHeight - 0.5) * parallaxFactor * height

      letters.forEach((letter, index) => {
        const x = (index % grid.columns) * charWidth + offsetX
        const y = Math.floor(index / grid.columns) * charHeight + offsetY
        ctx.fillStyle = letter.color
        ctx.fillText(letter.char, x, y)
      })
    }

    const updateLetters = () => {
      if (!letters || letters.length === 0) return

      const updateCount = Math.max(1, Math.floor(letters.length * 0.05))

      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.length)
        if (!letters[index]) continue

        letters[index].char = getRandomChar()
        letters[index].targetColor = getRandomColor()
        letters[index].colorProgress = 0
      }
    }

    const handleSmoothTransitions = () => {
      let needsRedraw = false
      letters.forEach((letter) => {
        if (letter.colorProgress < 1) {
          letter.colorProgress += 0.05
          if (letter.colorProgress > 1) letter.colorProgress = 1

          const startRgb = hexToRgb(letter.color)
          const endRgb = hexToRgb(letter.targetColor)
          if (startRgb && endRgb) {
            letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress)
            needsRedraw = true
          }
        }
      })

      if (needsRedraw) {
        drawLetters()
      }
    }

    let lastGlitchTime = Date.now()
    const glitchSpeed = 50

    const animateGlitch = () => {
      const now = Date.now()
      if (now - lastGlitchTime >= glitchSpeed) {
        updateLetters()
        drawLetters()
        lastGlitchTime = now
      }

      handleSmoothTransitions()
      requestAnimationFrame(animateGlitch)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      drawLetters()
    }

    const handleResize = () => {
      resizeCanvas()
      drawLetters()
    }

    // Initialize
    resizeCanvas()
    animateGlitch()

    // Event listeners
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: -2 }} />
      {/* Vignette effects */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)",
          zIndex: -1,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
          zIndex: -1,
        }}
      />
    </>
  )
}
