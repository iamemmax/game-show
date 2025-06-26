import { cn } from "@/utils/classNames"
import type React from "react"

interface GlowyStrokeTextProps {
  children: React.ReactNode
  glowColor?: string
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  textclassName?: string
  className?: string
  glowIntensity?: "none" | "low" | "medium" | "high"
  truncate?: boolean
  lineThrough?: boolean
  lineThroughColor?: string
}

export function GlowyStrokeText({
  children,
  glowColor = "#D91FFF",
  fillColor = "#FFFFFFB0",
  strokeColor = "#D91FFF",
  strokeWidth = 1,
  glowIntensity = "medium",
  className,
  textclassName,
  truncate,
  lineThrough = false,
  lineThroughColor = fillColor,
}: GlowyStrokeTextProps) {
  // Convert hex to rgba for better glow effect
  const hexToRgba = (hex: string, alpha: number) => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Calculate glow shadow values based on intensity
  const getGlowShadows = () => {
    const intensityMap = {
      none: [0, 0, 0],
      low: [0.8, 0.4, 0.1],
      medium: [0.9, 0.7, 0.5, 0.3],
      high: [1, 0.9, 0.8, 0.6, 0.4, 0.2],
    }

    const intensities = intensityMap[glowIntensity]
    const shadows: string[] = []

    for (let i = 0; i < intensities.length; i++) {
      const blurRadius = (i + 1) * 3
      const opacity = intensities[i]
      shadows.push(`0 0 ${blurRadius}px ${hexToRgba(glowColor, opacity)}`)
    }

    return shadows.join(", ")
  }

  // Create text stroke effect using multiple text shadows
  const getTextStroke = () => {
    const shadows: string[] = []
    const offset = 0.5

    for (let x = -strokeWidth; x <= strokeWidth; x += offset) {
      for (let y = -strokeWidth; y <= strokeWidth; y += offset) {
        if (Math.abs(x) >= strokeWidth - offset || Math.abs(y) >= strokeWidth - offset) {
          shadows.push(`${x}px ${y}px 0 ${strokeColor}`)
        }
      }
    }

    return shadows.join(", ")
  }

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Background glow effect */}
      <div
        className={cn("absolute inset-0 blur-sm opacity-70", textclassName)}
        style={{
          color: glowColor,
          textShadow: getGlowShadows(),
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Main text with stroke and optional line-through */}
      <div
        className={cn("relative font-black tracking-wider", textclassName, truncate && "!truncate")}
        style={{
          color: fillColor,
          textShadow: `${getTextStroke()}, ${getGlowShadows()}`,
          textDecoration: lineThrough ? "line-through" : undefined,
          textDecorationColor: lineThrough ? lineThroughColor : undefined,
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Screen reader text */}
      <span className="sr-only">{children}</span>
    </div>
  )
}
