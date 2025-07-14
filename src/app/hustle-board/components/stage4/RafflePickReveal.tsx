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
import LibertyLifeModal from "./RafflePickRevealLibertyLifeModal"
import { useGetLastContestantPick } from "@/app/components/stages/api/stage4/getLastContestantPick"
import { useGetGameContestants, useGetHustleMatches, useGetMatchedHustles } from "@/app/admin/misc/api"
import { Ball } from "@/app/admin/misc/components/RaffleBall"
import Stage4BoardGetReadyPage from "./ShowStage4Prep"

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
  const episodeId = Number(params?.episodeId || params?.episode)

  // State for ball animations and reveals
  const [revealedBalls, setRevealedBalls] = useState<Set<number>>(new Set())
  const [animatingBall, setAnimatingBall] = useState<number | null>(null)
  const [currentResult, setCurrentResult] = useState<BallPickedPayload | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [ShowStage4Prep, setShowStage4Prep] = useState(true)

  // Fetch hustle matches data (what each ball contains)
  const { data: hustleMatchesData, isLoading: isLoadingMatches } = useGetHustleMatches(episodeId)

  // Fetch matched hustles data (already revealed balls)
  const { data: matchedHustlesData, isLoading: isLoadingMatched } = useGetMatchedHustles(episodeId)

  // 1. Fetch all contestants for the episode
  const { data: contestantsData, refetch, isLoading: isLoadingContestants } = useGetGameContestants(episodeId)
  

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



  // Initialize revealed balls from matched hustles data
  useEffect(() => {
    if (matchedHustlesData?.data) {
      const alreadyRevealed = new Set(matchedHustlesData.data.map((hustle) => hustle.number_pick))
      setRevealedBalls(alreadyRevealed)
    }
  }, [matchedHustlesData])

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
    // setTimeout(() => {
    //   setShowModal(false)
    // }, 8000) // Increased time for better UX
  }, [])

  // Handle MQTT messages
  useEffect(() => {
    const handleMessage = (message: BallPickedResult) => {
      if(message.event === "game_s4_start"){
        setShowStage4Prep(false)
      }
       if(message.event === "close_reveal_modal"){
        setShowModal(false)
      }
      if (message.event === "ball_picked") {
        const { hustle_match } = message.payload
        animateBallReveal(hustle_match.number_pick, message.payload)
        refetch()
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

  // Get ball variant based on state and pre-loaded data
  const getBallVariant = (ballNumber: number): "regular" | "matched" | "mismatched" | "selected" => {
    if (animatingBall === ballNumber) {
      return "selected"
    }

    if (revealedBalls.has(ballNumber)) {
      // Check if this ball had a positive or negative result from matched hustles
      const matchedHustle = matchedHustlesData?.data?.find((hustle) => hustle.number_pick === ballNumber)
      if (matchedHustle) {
        const isPositive = matchedHustle.is_extra_ball
          ? matchedHustle.extra_ball_name === "CRYSTAL_BALL" || matchedHustle.extra_ball_name === "LIBERTY_LIFE_BALL"
          : matchedHustle.is_match
        return isPositive ? "matched" : "mismatched"
      }
      return "matched" // Default for revealed balls
    }

    return "regular"
  }

  // Get ball info from pre-loaded data
  const getBallInfo = (ballNumber: number) => {
    const ballData = hustleMatchesData?.data?.find((match) => match.number_pick === ballNumber)
    return ballData || null
  }

  // Get ball display indicator
  const getBallIndicator = (ballNumber: number) => {
    const ballInfo = getBallInfo(ballNumber)
    if (!ballInfo?.is_extra_ball) return null

    switch (ballInfo.extra_ball_name) {
      case "CRYSTAL_BALL":
        return "💎"
      case "KILLER_BALL":
        return "💀"
      case "EXTRA_PICK_BALL":
        return "➕"
      case "LIBERTY_LIFE_BALL":
        return "🏥"
      default:
        return "⭐"
    }
  }
  if (ShowStage4Prep) {
    return <Stage4BoardGetReadyPage />;
  }
  return (
    <div className="min-h-screen grid grid-cols-[1fr_5fr_1fr] h-full relative">
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
              {/* <div className="flex flex-col items-center text-center">
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
              </div> */}

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


              {/* 60 Ball Grid - Much Bigger */}
              <div className="flex justify-center mt-6">
                <div className="grid grid-cols-12 gap-6 max-w-7xl">
                  {Array.from({ length: 60 }, (_, i) => i + 1).map((ballNumber) => {
                    const ballIndicator = getBallIndicator(ballNumber)
                    const isExtraBall = ballNumber >= 50 && ballNumber <= 60
                    const ballInfo = getBallInfo(ballNumber)

                    return (
                      <motion.div
                        key={ballNumber}
                        className="flex justify-center relative"
                        animate={
                          animatingBall === ballNumber
                            ? {
                                scale: [1, 2, 1],
                                y: [0, -20, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        <Ball
                          number={ballNumber}
                          variant={getBallVariant(ballNumber)}
                          size="lg"
                          className={cn(
                            "transition-all duration-300 w-16 h-16", // Even bigger balls
                            animatingBall === ballNumber && "z-50",
                            isExtraBall && ballInfo?.is_extra_ball && "",
                          )}
                          textClassName="text-xl font-black" // Much bigger text
                        />

                        {/* Enhanced Ball Type Indicator for balls 50-60 */}
                        {isExtraBall && ballInfo?.is_extra_ball && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className=" rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                              <span className="text-2xl">{ballIndicator}</span>
                            </div>
                            
                          </div>
                        )}

                        {/* Regular indicator for other balls */}
                        {!isExtraBall && ballIndicator && !revealedBalls.has(ballNumber) && (
                          <div className="absolute -top-1 -right-1 text-sm bg-black/80 rounded-full w-6 h-6 flex items-center justify-center border border-white/20">
                            {ballIndicator}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Ball Legend */}
              <div className="flex justify-center mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/80 bg-black/40 rounded-lg px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💎</span>
                    <div>
                      <div className="font-semibold">Crystal Ball</div>
                      <div className="text-xs text-white/60">Big Gains</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💀</span>
                    <div>
                      <div className="font-semibold">Killer Ball</div>
                      <div className="text-xs text-white/60">Balance Loss</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <div>
                      <div className="font-semibold">Extra Pick</div>
                      <div className="text-xs text-white/60">Bonus Draw</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏥</span>
                    <div>
                      <div className="font-semibold">Liberty Life</div>
                      <div className="text-xs text-white/60">Health Plan</div>
                    </div>
                  </div>
                </div>
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
                <div 
                className="size-[6.8563rem]  bg-white rounded-full flex justify-center flex-col items-center font-display text-black font-black text-[2rem] ml-2">
                  <p className="">
                    {displayCount}/5
                  </p>
                  <p className="block text-base font-display font-bold uppercase text-black">match</p>
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

      {/* Modal Overlay - Positioned above the ball grid */}
      {showModal && currentResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-montserrat">
          <div className="relative max-w-4xl w-full px-4">
            {currentResult.hustle_match.extra_ball_details?.name === "KILLER_BALL" && (
              <KillerHustlePulledModal isOpen={true} data={currentResult} />
            )}
            {currentResult.hustle_match.extra_ball_details?.name === "CRYSTAL_BALL" && (
              <CrystalModal isOpen={true} data={currentResult} />
            )}
            {currentResult.hustle_match.extra_ball_details?.name === "LIBERTY_LIFE_BALL" && (
              <LibertyLifeModal isOpen={true} data={currentResult} />
            )}
            {!currentResult.hustle_match.is_extra_ball && currentResult.hustle_match.is_match && (
              <WinnerBallModal
                isOpen={true}
                data={{
                  name: {
                    balance_details: {
                      current_balance: currentResult.hustle_match.balance_details.current_balance,
                    },
                  },
                }}
              />
            )}
            {!currentResult.hustle_match.is_extra_ball && !currentResult.hustle_match.is_match && (
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl p-8 border-2 border-gray-500/50 shadow-2xl max-w-2xl mx-auto">
                <div className="flex flex-col items-center text-center text-white space-y-6">
                  <div className="text-6xl">😔</div>
                  <h2 className="text-4xl font-bold text-gray-300">No Match</h2>
                  <p className="text-lg text-white/80">
                    Ball #{currentResult.hustle_match.number_pick} - Better luck next time!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(isLoadingMatches || isLoadingMatched) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 !font-montserrat">
          <div className="bg-purple-900/90 backdrop-blur-sm p-8 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <div className="text-white text-lg">Loading ball data...</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RafflePickReveal
