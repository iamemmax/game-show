"use client"
import { useMemo, useEffect, useState, useCallback } from "react"
import { animate, motion } from "framer-motion"
import { useParams } from "next/navigation"
import Logo from "@/app/icons/Logo"
import HeaderTitleContainer from "@/app/shared/HeaderContainer"
import { GlowyStrokeText } from "@/components/core"
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar"
import HustleStages from "@/app/components/stages/components/hustle/HustleStages"
import NumberCardContainer from "@/app/shared/NumberContainer"
import { useMQTT } from "@/hooks/useMqttService"
import ErrorIcon from "@/app/icons/ErrorIcon"
import { cn } from "@/utils/classNames"
import CheckIcon from "@/app/icons/CheckIcon"
import KillerHustlePulledModal from "./RafflePickRevealKillerModal"
import CrystalModal from "./RafflePickRevealCrystalModal"
import WinnerBallModal from "./RafflePickRevealWinnerModal"
import { useGetLastContestantPick } from "@/app/components/stages/api/stage4/getLastContestantPick"
import { useGetGameContestants } from "@/app/admin/misc/api"
import { Ball } from "./RaffleBall"


// Types for MQTT data
interface ExtraBallDetails {
  name: string
  type: string
  effect_action: string | null
  effect_desc: string | null
}

interface BalanceDetails {
  is_gain: boolean
  previous_balance: number
  amount_gained: number
  amount_lost: number
  current_balance: number
}

interface HustleMatch {
  contestant_id: number
  number_pick: number
  is_match: boolean
  is_extra_ball: boolean
  extra_ball_details: ExtraBallDetails | null
  balance_details: BalanceDetails
}

interface BallPickedPayload {
  hustle_match: HustleMatch
  number_revealed: number[]
}

interface BallPickedResult {
  event: string
  payload: BallPickedPayload
}

const RafflePickReveal = () => {
  const { isConnected, onMessage } = useMQTT()
  const params = useParams()
  const episodeId = Number(params?.episodeId)

  // State for ball animations and reveals
  const [revealedBalls, setRevealedBalls] = useState<Set<number>>(new Set())
  const [animatingBall, setAnimatingBall] = useState<number | null>(null)
  const [currentResult, setCurrentResult] = useState<BallPickedPayload | null>(null)
  const [showModal, setShowModal] = useState(false)

  // 1. Fetch all contestants for the episode
  const { data: contestantsData, isLoading: isLoadingContestants } = useGetGameContestants(episodeId)

  // 2. Get the last non-eliminated contestant (memoized for stability)
  const lastContestantId = useMemo(() => {
    const data = contestantsData?.data?.find((contestant) => contestant?.is_eliminated !== true)
    return data?.id
  }, [contestantsData])

  // 3. Only fetch pick if lastContestantId is available
  const { data: lastPickData } = useGetLastContestantPick({
    contestant_id: Number(lastContestantId),
    episode_id: episodeId,
  })

  const mynumbers = lastPickData && lastPickData[0]?.picks
  const revealedNumbers = currentResult?.number_revealed?.filter((x) => x !== null) ?? []

  // Check how many numbers match
  const matchedCount = revealedNumbers?.filter((num) => mynumbers?.includes(num)).length

  // If all numbers matched
  const isWinner = matchedCount === mynumbers?.length

  // Highlight matched numbers
  const getNumberMatchStatus = (num: number | null, allRevealed: boolean) => {
    if (num === null) return { matched: false, showRed: false }
    const matched = revealedNumbers?.includes(Number(num))
    const showRed = allRevealed && !matched
    return { matched, showRed }
  }

  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    const controls = animate(displayCount, matchedCount, {
      duration: 0.5,
      onUpdate: (latest) => {
        setDisplayCount(Math.round(latest))
      },
    })
    return controls.stop // cleanup on unmount or value change
  }, [matchedCount])

  // Ball animation and reveal logic
  const animateBallReveal = useCallback(async (ballNumber: number, result: BallPickedPayload) => {
    setAnimatingBall(ballNumber)
    setCurrentResult(result)

    // Simulate ball moving to center and exploding
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mark ball as revealed
    setRevealedBalls((prev) => new Set([...prev, ballNumber]))
    setAnimatingBall(null)

    // Show appropriate modal
    setShowModal(true)

    // Auto-hide modal after some time
    setTimeout(() => {
      setShowModal(false)
    }, 5000)
  }, [])

  // Handle MQTT messages
  useEffect(() => {
    const handleMessage = (message: BallPickedResult) => {
      if (message.event === "ball_picked") {
        const { hustle_match } = message.payload
        animateBallReveal(hustle_match.number_pick, message.payload)
      }
    }

    if (isConnected) {
      onMessage(handleMessage)
    }

    return () => {
      if (isConnected) {
        onMessage(null)
      }
    }
  }, [isConnected, onMessage, animateBallReveal])

  // Get ball variant based on state
  const getBallVariant = (ballNumber: number): "regular" | "matched" | "mismatched" | "selected" => {
    if (animatingBall === ballNumber) {
      return "selected"
    }

    if (revealedBalls.has(ballNumber)) {
      // Determine if this ball was a positive or negative result
      if (currentResult && currentResult.hustle_match.number_pick === ballNumber) {
        const isPositive = currentResult.hustle_match.is_extra_ball
          ? currentResult.hustle_match.balance_details.is_gain
          : currentResult.hustle_match.is_match
        return isPositive ? "matched" : "mismatched"
      }
      return "matched" // Default for revealed balls
    }

    return "regular"
  }

  return (
    <div className="min-h-screen grid grid-cols-[1fr_5fr_1fr] h-full">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>
          <HustleStages activeStage={4} />
        </div>
        <div className="pb-4">
          <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
        </div>
      </div>

      {/* Center Content */}
      <div className="flex flex-col justify-between items-center min-h-full">
        {/* Top section */}
        <div className="flex flex-col w-full items-center">
          <div className="w-full h-[100px] flex items-center justify-center">
            <HeaderTitleContainer
              backgroundColor="#791192"
              color="#ed99ff"
              text="Hustle Board"
              textGradientEnd="#8E17AA"
              textGradientStart="#8E17AA"
              borderGradientStart="#f712fc"
              borderGradientEnd="#e151fe"
              fontSize={45}
              fontFamily="Verdana"
              textStrokeColor="#a219c1"
              textStrokeWidth={4.4}
            />
          </div>
          <div className="relative flex flex-col justify-between w-full flex-grow px-6 py-[2.5rem] -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
            {/* Animated border */}
            <div className="absolute inset-0">
              <motion.div
                className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%,
                     #d91fff 0deg,
                     #d91fff 120deg,
                     #00ffff 100deg,
                     #00ffff 240deg,
                     #FFD700 220deg,
                     #FFD700 360deg,
                     #d91fff 340deg
                   )`,
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
            <div className="absolute inset-0">
              <motion.div
                className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%,
                     #d91fff 0deg,
                     #d91fff 120deg,
                     #00ffff 100deg,
                     #00ffff 240deg,
                     #FFD700 220deg,
                     #FFD700 360deg,
                     #d91fff 340deg
                   )`,
                }}
              />
            </div>

            {/* Content Container */}
            <div className="absolute inset-[8px] py-[3.75rem] bg-[#13051E] bg-[url('/images/host-bg.png')] bg-no-repeat bg-cover rounded-[.675rem]" />

            {/* Actual Content */}
            <div className="relative z-10 flex flex-col justify-between h-full w-full">
              {/* Title & Subtitle */}
              <div className="flex flex-col items-center text-center">
                <GlowyStrokeText
                  strokeWidth={2}
                  strokeColor="#D91FFF"
                  glowColor="#13051E"
                  glowIntensity="low"
                  textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
                  fillColor="#000"
                >
                  Golden Hustle Match
                </GlowyStrokeText>
                <p className="text-lg font-normal text-[#D5B9FF]">
                  Watch as balls are revealed to determine your hustle fate
                </p>
              </div>

              {/* 60 Ball Grid */}
              <div className="flex justify-center mt-6">
                <div className="grid grid-cols-10 gap-2 max-w-2xl">
                  {Array.from({ length: 60 }, (_, i) => i + 1).map((ballNumber) => (
                    <motion.div
                      key={ballNumber}
                      className="flex justify-center"
                      animate={
                        animatingBall === ballNumber
                          ? {
                              scale: [1, 1.5, 1],
                              x: [0, 0, 0],
                              y: [0, -50, 0],
                            }
                          : {}
                      }
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    >
                      <Ball
                        number={ballNumber}
                        variant={getBallVariant(ballNumber)}
                        size="sm"
                        className={cn(
                          "transition-all duration-300",
                          animatingBall === ballNumber && "z-50 animate-pulse",
                        )}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Top: Hustle Picks */}
              <div className="flex justify-center mt-8">
                <div className="flex border-[4px] divide-x shadow-[0_4px_20px_#8700C7] divide-[#4B1874] rounded-[20px] py-[10.35px] px-3 border-[#CE64FF]">
                  {mynumbers?.map((num) => {
                    const { matched, showRed } = getNumberMatchStatus(num, revealedNumbers.length === 5)
                    return (
                      <div key={num} className="px-4">
                        <NumberCardContainer
                          text={String(num)}
                          textColor={matched ? "#fff" : showRed ? "#fff" : "#F2C94C"}
                          backgroundColor={matched ? "#04DA6A" : showRed ? "#EB001B" : ""}
                          active={matched || showRed}
                          width={80}
                          height={85}
                          className="cursor-pointer transition-transform hover:scale-105"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 mt-6">
                {showModal && currentResult && (
                  <>
                    {!isWinner && currentResult.hustle_match.extra_ball_details?.name === "KILLER_BALL" && (
                      <KillerHustlePulledModal
                        isOpen={true}
                        data={{
                          name: {
                            ...currentResult.hustle_match,
                            extra_ball_details: currentResult.hustle_match.extra_ball_details ?? {
                              name: "",
                              type: "",
                              effect_action: null,
                              effect_desc: null,
                            },
                          },
                          number_revealed: currentResult.number_revealed,
                        }}
                      />
                    )}
                    {currentResult.hustle_match.extra_ball_details?.name === "CRYSTAL_BALL" && (
                      <CrystalModal isOpen={true} />
                    )}
                    {isWinner && <WinnerBallModal isOpen={true} />}
                  </>
                )}
              </div>

              {/* Bottom: Picked Numbers */}
              <div className="flex justify-center items-center mt-10 mb-6">
                <div className="flex items-center justify-center">
                  {currentResult?.number_revealed?.map((x, idx) => {
                    const isRevealed = x !== null
                    const isMatched = isRevealed && mynumbers?.includes(x)
                    const status = !isRevealed ? "default" : isMatched ? "correct" : "error"
                    return (
                      <div key={idx} className="px-4 flex items-center flex-col justify-center">
                        <NumberCardContainer
                          text={isRevealed ? String(x) : ""}
                          textColor="#F2C94C"
                          width={isRevealed ? 80 : 140}
                          height={isRevealed ? 85 : 145}
                          className="cursor-pointer transition-transform hover:scale-105"
                          status={status}
                        />
                        {isRevealed &&
                          (isMatched ? (
                            <div className="w-[2.6519rem] h-[2.212rem] flex justify-center items-center rounded-[.4006rem] bg-[#10A151] mt-2">
                              <CheckIcon size={20} />
                            </div>
                          ) : (
                            <div className="w-[2.6519rem] h-[2.52512rem] flex justify-center items-center rounded-[.4006rem] bg-[#eb001b] mt-2">
                              <ErrorIcon height={17} width={17} color="#bc061b" />
                            </div>
                          ))}
                      </div>
                    )
                  })}
                </div>
                {/* Match Counter */}
                <div className="w-[6.8563rem] h-[6.8563rem] bg-white rounded-full flex justify-center flex-col items-center ml-4">
                  <p className="font-display text-black font-black text-[2rem]">
                    {displayCount}/{mynumbers?.length}
                  </p>
                  <p className="block text-base font-display font-bold uppercase -mt-2">match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={2} />
      </div>
    </div>
  )
}

export default RafflePickReveal
