"use client"

import { useState } from "react"
import { Ball } from "./RaffleBall"
import { SpecialBallModal } from "./RaffleSpecialBallModal"
import { Button } from "@/components/core"
import { DrawnBallSlot } from "./RaffleDrawnBall"

interface DrawnBall {
  number: number
  isMatched: boolean
}

interface SpecialBall {
  type: string
  value?: string
}

export default function Stage4RaffleAdmin() {
  const [selectedBalls, setSelectedBalls] = useState<number[]>([19, 4, 12, 44, 14])
  const [drawnBalls, setDrawnBalls] = useState<(DrawnBall | null)[]>([
    { number: 24, isMatched: false },
    { number: 4, isMatched: true },
    null,
    null,
    null,
  ])
  const [specialBalls, setSpecialBalls] = useState<SpecialBall[]>([])

  const handleBallClick = (number: number) => {
    if (selectedBalls.includes(number)) {
      setSelectedBalls(selectedBalls.filter((n) => n !== number))
    } else if (selectedBalls.length < 5) {
      setSelectedBalls([...selectedBalls, number])
    }
  }

  const handleSpecialBallSubmit = (data: { type: string; value?: string }) => {
    setSpecialBalls([...specialBalls, data])
  }

  const matchCount = drawnBalls.filter((ball) => ball?.isMatched).length

  return (
    <div className=" p-8 !font-montserrat ">
      <div className="max-w-6xl mx-auto">

        {/* Prize Amount */}
        <div className="flex justify-center mb-8">
          <div className="bg-purple-600 px-6 py-3 rounded-lg shadow-lg">
            <div className="text-white text-xl font-bold">₦250,000</div>
          </div>
        </div>

        {/* Selected Balls Row */}
        <div className="flex justify-center mb-8">
          <div className="bg-purple-800/50 rounded-lg p-4 border-2 border-purple-500">
            <div className="flex space-x-2">
              {selectedBalls.map((number, index) => (
                <Ball key={index} number={number} variant="selected" size="md" />
              ))}
              {Array.from({ length: 5 - selectedBalls.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-12 h-12 rounded-lg border-2 border-purple-500 bg-purple-900/20"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ball Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-12 gap-2 max-w-4xl mx-auto">
            {Array.from({ length: 49 }, (_, i) => i + 1).map((number) => (
              <Ball
                key={number}
                number={number}
                // isMatched={true}
                variant={selectedBalls.includes(number) ? "selected" : "regular"}
                onClick={() => handleBallClick(number)}
                className="mx-auto !cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Drawn Balls */}
        <div className="flex justify-center mb-8">
          <div className="flex justify-center  items-center ">
            <div className="flex space-x-4">
              {drawnBalls.map((ball, index) => (
                <DrawnBallSlot key={index} number={ball?.number} isMatched={ball?.isMatched} isEmpty={!ball} />
              ))}
            </div>
            {/* Match Counter */}
            <div className="flex justify-center ml-6">
              <div className="bg-white rounded-full px-4 py-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{matchCount}/5</div>
                  <div className="text-xs text-gray-600">MATCH</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-8">
          <SpecialBallModal onSubmit={handleSpecialBallSubmit} />
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-lg">
            REVEAL
          </Button>
        </div>


        {/* Special Balls Display */}
        {specialBalls.length > 0 && (
          <div className="mt-8">
            <h3 className="text-white text-lg font-bold mb-4">Special Balls Added:</h3>
            <div className="space-y-2">
              {specialBalls.map((ball, index) => (
                <div key={index} className="bg-purple-800/50 rounded-lg p-3 text-white">
                  <span className="font-semibold">{ball.type}</span>
                  {ball.value && <span className="ml-2 text-gray-300">- {ball.value}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
