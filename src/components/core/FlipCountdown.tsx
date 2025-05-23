"use client"

import { cn } from "@/utils/classNames"
import type React from "react"
import { useEffect, useState } from "react"

interface FlipDigitProps {
  digit: number
  previousDigit: number | null
  isFlipping: boolean
  className?: string
}

const FlipDigit: React.FC<FlipDigitProps> = ({ digit, previousDigit, isFlipping, className }) => {
  return (
    <div className={cn("relative size-16 overflow-hidden", className)}>
      {/* Current digit */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-[#231c2d] text-white text-4xl font-bold rounded-md",
          isFlipping ? "animate-flip-down" : "",
        )}
      >
        {digit}
      </div>

      {/* Previous digit - shown during flip animation */}
      {isFlipping && previousDigit !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#231c2d] text-white text-4xl font-bold rounded-md animate-flip-up">
          {previousDigit}
        </div>
      )}

      {/* Horizontal divider line */}
      <div className="absolute left-0 right-0 h-[1px] bg-gray-700 top-1/2 z-10"></div>
    </div>
  )
}

interface FlipCountdownProps {
  seconds: number
  onComplete?: () => void
  className?: string
  digitClassName?: string
  separatorClassName?: string
  showHours?: boolean
  showDays?: boolean
  isActive?: boolean
}

export const FlipCountdown: React.FC<FlipCountdownProps> = ({
  seconds,
  onComplete,
  className,
  digitClassName,
  separatorClassName,
  showHours = false,
  showDays = false,
  isActive = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [flipping, setFlipping] = useState<Record<string, boolean>>({})
  const [previousValues, setPreviousValues] = useState<Record<string, number | null>>({})
  const [hasCompleted, setHasCompleted] = useState(false)

  // Calculate time units
  const days = Math.floor(timeLeft / (24 * 60 * 60))
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60)
  const secs = Math.floor(timeLeft % 60)

  // Format time units to always have two digits
  const formatTimeUnit = (unit: number) => unit.toString().padStart(2, "0")

  const daysFormatted = formatTimeUnit(days)
  const hoursFormatted = formatTimeUnit(hours)
  const minutesFormatted = formatTimeUnit(minutes)
  const secondsFormatted = formatTimeUnit(secs)

  useEffect(() => {
    // Reset the completion flag when seconds prop changes
    if (seconds !== timeLeft && timeLeft === seconds) {
      setHasCompleted(false)
    }

    if (timeLeft <= 0) {
      if (onComplete && !hasCompleted) {
        onComplete()
        setHasCompleted(true)
      }
      return
    }

    // Only run the timer if isActive is true
    if (!isActive) return

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onComplete, isActive, seconds, hasCompleted])

  useEffect(() => {
    setTimeLeft(seconds)
    setHasCompleted(false)
  }, [seconds])

  useEffect(() => {
    // Track which digits are flipping
    const newFlipping: Record<string, boolean> = {}
    const newPreviousValues: Record<string, number | null> = { ...previousValues }

    // Check each time unit to see if it changed
    if (showDays) {
      const day1 = Number.parseInt(daysFormatted[0])
      const day2 = Number.parseInt(daysFormatted[1])

      if (previousValues.day1 !== undefined && previousValues.day1 !== day1) {
        newFlipping.day1 = true
        newPreviousValues.day1 = previousValues.day1
      } else {
        newFlipping.day1 = false
      }

      if (previousValues.day2 !== undefined && previousValues.day2 !== day2) {
        newFlipping.day2 = true
        newPreviousValues.day2 = previousValues.day2
      } else {
        newFlipping.day2 = false
      }

      newPreviousValues.day1 = day1
      newPreviousValues.day2 = day2
    }

    if (showHours) {
      const hour1 = Number.parseInt(hoursFormatted[0])
      const hour2 = Number.parseInt(hoursFormatted[1])

      if (previousValues.hour1 !== undefined && previousValues.hour1 !== hour1) {
        newFlipping.hour1 = true
        newPreviousValues.hour1 = previousValues.hour1
      } else {
        newFlipping.hour1 = false
      }

      if (previousValues.hour2 !== undefined && previousValues.hour2 !== hour2) {
        newFlipping.hour2 = true
        newPreviousValues.hour2 = previousValues.hour2
      } else {
        newFlipping.hour2 = false
      }

      newPreviousValues.hour1 = hour1
      newPreviousValues.hour2 = hour2
    }

    const min1 = Number.parseInt(minutesFormatted[0])
    const min2 = Number.parseInt(minutesFormatted[1])
    const sec1 = Number.parseInt(secondsFormatted[0])
    const sec2 = Number.parseInt(secondsFormatted[1])

    if (previousValues.min1 !== undefined && previousValues.min1 !== min1) {
      newFlipping.min1 = true
      newPreviousValues.min1 = previousValues.min1
    } else {
      newFlipping.min1 = false
    }

    if (previousValues.min2 !== undefined && previousValues.min2 !== min2) {
      newFlipping.min2 = true
      newPreviousValues.min2 = previousValues.min2
    } else {
      newFlipping.min2 = false
    }

    if (previousValues.sec1 !== undefined && previousValues.sec1 !== sec1) {
      newFlipping.sec1 = true
      newPreviousValues.sec1 = previousValues.sec1
    } else {
      newFlipping.sec1 = false
    }

    if (previousValues.sec2 !== undefined && previousValues.sec2 !== sec2) {
      newFlipping.sec2 = true
      newPreviousValues.sec2 = previousValues.sec2
    } else {
      newFlipping.sec2 = false
    }

    newPreviousValues.min1 = min1
    newPreviousValues.min2 = min2
    newPreviousValues.sec1 = sec1
    newPreviousValues.sec2 = sec2

    setFlipping(newFlipping)
    setPreviousValues(newPreviousValues)

    // Reset flipping state after animation completes
    const flipTimeout = setTimeout(() => {
      setFlipping({})
    }, 500)

    return () => clearTimeout(flipTimeout)
  }, [daysFormatted, hoursFormatted, minutesFormatted, secondsFormatted, previousValues, showDays, showHours])

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {showDays && (
        <>
          <FlipDigit
            digit={Number.parseInt(daysFormatted[0])}
            previousDigit={previousValues.day1}
            isFlipping={flipping.day1 || false}
            className={digitClassName}
          />
          <FlipDigit
            digit={Number.parseInt(daysFormatted[1])}
            previousDigit={previousValues.day2}
            isFlipping={flipping.day2 || false}
            className={digitClassName}
          />
          <div className={cn("text-[#231c2d] text-2xl font-bold mx-1", separatorClassName)}>:</div>
        </>
      )}

      {showHours && (
        <>
          <FlipDigit
            digit={Number.parseInt(hoursFormatted[0])}
            previousDigit={previousValues.hour1}
            isFlipping={flipping.hour1 || false}
            className={digitClassName}
          />
          <FlipDigit
            digit={Number.parseInt(hoursFormatted[1])}
            previousDigit={previousValues.hour2}
            isFlipping={flipping.hour2 || false}
            className={digitClassName}
          />
          <div className={cn("text-[#231c2d] text-2xl font-bold mx-1", separatorClassName)}>:</div>
        </>
      )}

      <FlipDigit
        digit={Number.parseInt(minutesFormatted[0])}
        previousDigit={previousValues.min1}
        isFlipping={flipping.min1 || false}
        className={digitClassName}
      />
      <FlipDigit
        digit={Number.parseInt(minutesFormatted[1])}
        previousDigit={previousValues.min2}
        isFlipping={flipping.min2 || false}
        className={digitClassName}
      />

      <div className={cn("text-[#231c2d] text-2xl font-bold mx-1", separatorClassName)}>:</div>

      <FlipDigit
        digit={Number.parseInt(secondsFormatted[0])}
        previousDigit={previousValues.sec1}
        isFlipping={flipping.sec1 || false}
        className={digitClassName}
      />
      <FlipDigit
        digit={Number.parseInt(secondsFormatted[1])}
        previousDigit={previousValues.sec2}
        isFlipping={flipping.sec2 || false}
        className={digitClassName}
      />
    </div>
  )
}
