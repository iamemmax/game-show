import { cn } from "@/utils/classNames"
import type React from "react"

interface GlowyStrokeTextProps {
  children: React.ReactNode
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
  glowColor?: string
  strokeColor?: string
  strokeWidth?: number
  className?: string
  glowIntensity?: "low" | "medium" | "high"
}

export function GlowyStrokeText({
  children,
  size = "xl",
  glowColor = "#ff00ff",
  strokeColor = "white",
  strokeWidth = 1,
  glowIntensity = "medium",
  className,
}: GlowyStrokeTextProps) {
  // Map size to font size classes
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-md",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
  }

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
      low: [0.8, 0.4, 0.1],
      medium: [0.9, 0.7, 0.5, 0.3],
      high: [1, 0.9, 0.8, 0.6, 0.4, 0.2],
    }

    const intensities = intensityMap[glowIntensity]
    const shadows = []

    // Create layered shadows with different blur and opacity values
    for (let i = 0; i < intensities.length; i++) {
      const blurRadius = (i + 1) * 2
      const opacity = intensities[i]
      shadows.push(`0 0 ${blurRadius}px ${hexToRgba(glowColor, opacity)}`)
    }

    return shadows.join(", ")
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn("font-black tracking-wider", sizeClasses[size])}
        style={{
          WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
          WebkitTextFillColor: "transparent",
          textShadow: getGlowShadows(),
          color: "transparent",
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
