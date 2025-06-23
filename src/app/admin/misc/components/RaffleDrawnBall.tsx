"use client"

import { Ball } from "./RaffleBall"
import { Check, X } from "lucide-react"

interface DrawnBallSlotProps {
  number?: number
  isMatched?: boolean
  isEmpty?: boolean
}

export function DrawnBallSlot({ number, isMatched, isEmpty = false }: DrawnBallSlotProps) {
  if (isEmpty) {
    return (
      <div className="relative">
        <div className="w-16 h-16 rounded-lg border-2 border-purple-500 bg-purple-900/20 flex items-center justify-center">
          <div className="w-12 h-12 rounded-lg bg-purple-800/50" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Ball number={number} variant={isMatched ? "matched" : "mismatched"} size="lg" textClassName="text-base" />
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isMatched ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isMatched ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
        </div>
      </div>
    </div>
  )
}
