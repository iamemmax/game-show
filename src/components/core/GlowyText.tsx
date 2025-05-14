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
  truncate
}: GlowyStrokeTextProps) {


  // Calculate glow shadow values based on intensity
  const getGlowShadows = () => {
    // Convert hex to rgba for better glow effect
    const hexToRgba = (hex: string, alpha: number) => {
      const r = Number.parseInt(hex.slice(1, 3), 16)
      const g = Number.parseInt(hex.slice(3, 5), 16)
      const b = Number.parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Create multiple text-shadow layers with decreasing opacity
    const intensityMap = {
      none: [0, 0, 0],
      low: [0.8, 0.4, 0.1],
      medium: [0.9, 0.7, 0.5, 0.3],
      high: [1, 0.9, 0.8, 0.6, 0.4, 0.2],
    }

    const intensities = intensityMap[glowIntensity]
    const shadows = []

    // Create layered shadows with different blur and opacity values
    for (let i = 0; i < intensities.length; i++) {
      const blurRadius = (i + 1) * 3
      const opacity = intensities[i]
      shadows.push(`0 0 ${blurRadius}px ${hexToRgba(glowColor, opacity)}`)
    }

    return shadows.join(", ")
  }

  // Create text stroke effect using multiple text shadows
  const getTextStroke = () => {
    const shadows = []
    const offset = 0.5 // Small offset for each shadow direction

    // Create a shadow in each direction to simulate stroke
    for (let x = -strokeWidth; x <= strokeWidth; x += offset) {
      for (let y = -strokeWidth; y <= strokeWidth; y += offset) {
        // Only add shadows at the edges (not in the middle)
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

      {/* Main text with stroke */}
      <div
        className={cn("relative font-black tracking-wider", textclassName, truncate && "!truncate" )}
        style={{
          color: fillColor,
          textShadow: `${getTextStroke()}, ${getGlowShadows()}`,
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Hidden text for screen readers */}
      <span className="sr-only">{children}</span>
    </div>
  )
}
