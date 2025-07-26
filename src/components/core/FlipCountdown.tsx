"use client"

import { cn } from "@/utils/classNames"
import type React from "react"
import { useEffect, useState, useCallback, useMemo, useRef } from "react"

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
  const hasCompletedRef = useRef(false)
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memoize time calculations
  const timeUnits = useMemo(() => {
    const days = Math.floor(timeLeft / (24 * 60 * 60))
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60)
    const secs = Math.floor(timeLeft % 60)

    const formatTimeUnit = (unit: number) => unit.toString().padStart(2, "0")

    return {
      daysFormatted: formatTimeUnit(days),
      hoursFormatted: formatTimeUnit(hours),
      minutesFormatted: formatTimeUnit(minutes),
      secondsFormatted: formatTimeUnit(secs),
    }
  }, [timeLeft])

  const { daysFormatted, hoursFormatted, minutesFormatted, secondsFormatted } = timeUnits

  // Memoize onComplete to prevent unnecessary re-renders
  const memoizedOnComplete = useCallback(() => {
    if (onComplete && !hasCompletedRef.current) {
      onComplete()
      hasCompletedRef.current = true
    }
  }, [onComplete])

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      memoizedOnComplete()
      return
    }

    if (!isActive) return

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isActive, memoizedOnComplete])

  // Reset when seconds prop changes
  useEffect(() => {
    if (seconds !== timeLeft) {
      setTimeLeft(seconds)
      hasCompletedRef.current = false
    }
  }, [seconds])

  // Handle digit flipping - separated into its own effect with proper dependencies
  useEffect(() => {
    // Clear existing timeout
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current)
    }

    const currentDigits = {
      ...(showDays && {
        day1: parseInt(daysFormatted[0]),
        day2: parseInt(daysFormatted[1]),
      }),
      ...(showHours && {
        hour1: parseInt(hoursFormatted[0]),
        hour2: parseInt(hoursFormatted[1]),
      }),
      min1: parseInt(minutesFormatted[0]),
      min2: parseInt(minutesFormatted[1]),
      sec1: parseInt(secondsFormatted[0]),
      sec2: parseInt(secondsFormatted[1]),
    }

    const newFlipping: Record<string, boolean> = {}
    const newPreviousValues: Record<string, number | null> = {}
    let hasChanges = false

    // Check each digit for changes
    Object.keys(currentDigits).forEach((key) => {
      const currentValue = currentDigits[key as keyof typeof currentDigits]
      const previousValue = previousValues[key]

      if (previousValue !== undefined && previousValue !== currentValue) {
        newFlipping[key] = true
        newPreviousValues[key] = previousValue
        hasChanges = true
      } else {
        newFlipping[key] = false
      }

      newPreviousValues[key] = currentValue ?? null
    })

    // Only update state if there are actual changes
    if (hasChanges || Object.keys(previousValues).length === 0) {
      setFlipping(newFlipping)
      setPreviousValues(newPreviousValues)

      // Reset flipping state after animation completes
      flipTimeoutRef.current = setTimeout(() => {
        setFlipping({})
      }, 500)
    }
  }, [daysFormatted, hoursFormatted, minutesFormatted, secondsFormatted, showDays, showHours])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {showDays && (
        <>
          <FlipDigit
            digit={parseInt(daysFormatted[0])}
            previousDigit={previousValues.day1 ?? null}
            isFlipping={flipping.day1 || false}
            className={digitClassName}
          />
          <FlipDigit
            digit={parseInt(daysFormatted[1])}
            previousDigit={previousValues.day2 ?? null}
            isFlipping={flipping.day2 || false}
            className={digitClassName}
          />
          <div className={cn("text-[#231c2d] text-2xl font-bold mx-1", separatorClassName)}>:</div>
        </>
      )}

      {showHours && (
        <>
          <FlipDigit
            digit={parseInt(hoursFormatted[0])}
            previousDigit={previousValues.hour1 ?? null}
            isFlipping={flipping.hour1 || false}
            className={digitClassName}
          />
          <FlipDigit
            digit={parseInt(hoursFormatted[1])}
            previousDigit={previousValues.hour2 ?? null}
            isFlipping={flipping.hour2 || false}
            className={digitClassName}
          />
          <div className={cn("text-[#231c2d] text-2xl font-bold mx-1", separatorClassName)}>:</div>
        </>
      )}

      <FlipDigit
        digit={parseInt(minutesFormatted[0])}
        previousDigit={previousValues.min1 ?? null}
        isFlipping={flipping.min1 || false}
        className={digitClassName}
      />
      <FlipDigit
        digit={parseInt(minutesFormatted[1])}
        previousDigit={previousValues.min2 ?? null}
        isFlipping={flipping.min2 || false}
        className={digitClassName}
      />

      <div className={cn("text-[#231c2d] text-2xl font-bold mx-1", separatorClassName)}>:</div>

      <FlipDigit
        digit={parseInt(secondsFormatted[0])}
        previousDigit={previousValues.sec1 ?? null}
        isFlipping={flipping.sec1 || false}
        className={digitClassName}
      />
      <FlipDigit
        digit={parseInt(secondsFormatted[1])}
        previousDigit={previousValues.sec2 ?? null}
        isFlipping={flipping.sec2 || false}
        className={digitClassName}
      />
    </div>
  )
}