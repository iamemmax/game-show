// "use client"
// import { useMemo, useEffect, useState, useCallback } from "react"
// import { animate, motion } from "framer-motion"
// import { useParams } from "next/navigation"
// import Logo from "@/app/icons/Logo"
// import HeaderTitleContainer from "@/app/shared/HeaderContainer"
// import { GlowyStrokeText } from "@/components/core"
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
// import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar"
// import HustleStages from "@/app/components/stages/components/hustle/HustleStages"
// import NumberCardContainer from "@/app/shared/NumberContainer"
// import { useMQTT } from "@/hooks/useMqttService"
// import ErrorIcon from "@/app/icons/ErrorIcon"
// import { cn } from "@/utils/classNames"
// import CheckIcon from "@/app/icons/CheckIcon"
// import KillerHustlePulledModal from "./RafflePickRevealKillerModal"
// import CrystalModal from "./RafflePickRevealCrystalModal"
// import WinnerBallModal from "./RafflePickRevealWinnerModal"
// import LibertyLifeModal from "./RafflePickRevealLibertyLifeModal"
// import { useGetLastContestantPick } from "@/app/components/stages/api/stage4/getLastContestantPick"
// import { useGetGameContestants, useGetHustleMatches, useGetMatchedHustles } from "@/app/admin/misc/api"
// import { Ball } from "@/app/admin/misc/components/RaffleBall"
// import Stage4BoardGetReadyPage from "./ShowStage4Prep"
// import KillerBall from "@/app/icons/ball/KillerBall"
// import CrystalBall from "@/app/icons/ball/CrystalBall"
// import ExtraBall from "@/app/icons/ball/ExtrallBall"
// import LibertyLifeBall from "@/app/icons/ball/LibertyLifeBall"
// import Stage4MatchAmountContainer from "@/app/shared/Stage4MatchAmountContainer"
// import Stage4ProfileCard from "./Stage4ProfileCard"
// import Image from "next/image"

// // Types for MQTT data
// interface ExtraBallDetails {
//   name: string
//   type: string
//   effect_action: string | null
//   effect_desc: string | null
// }

// interface BalanceDetails {
//   is_gain: boolean
//   previous_balance: number
//   amount_gained: number
//   amount_lost: number
//   current_balance: number
// }

// interface HustleMatch {
//   contestant_id: number
//   number_pick: number
//   is_match: boolean
//   is_extra_ball: boolean
//   extra_ball_details: ExtraBallDetails | null
//   balance_details: BalanceDetails
// }

// interface BallPickedPayload {
//   hustle_match: HustleMatch
//   number_revealed: number[]
// }

// interface BallPickedResult {
//   event: string
//   payload: BallPickedPayload
// }

// const RafflePickReveal = () => {
//   const { isConnected, addMessageListener, removeMessageListener } = useMQTT()
//   const params = useParams()
//   const episodeId = Number(params?.episodeId || params?.episode)

//   // State for ball animations and reveals
//   const [revealedBalls, setRevealedBalls] = useState<Set<number>>(new Set())
//   const [animatingBall, setAnimatingBall] = useState<number | null>(null)
//   const [currentResult, setCurrentResult] = useState<BallPickedPayload | null>(null)
//   const [showModal, setShowModal] = useState(false)
//   const [ShowStage4Prep, setShowStage4Prep] = useState(true)

//   // Fetch hustle matches data (what each ball contains)
//   const { data: hustleMatchesData, isLoading: isLoadingMatches } = useGetHustleMatches(episodeId)

//   // Fetch matched hustles data (already revealed balls)
//   const { data: matchedHustlesData, isLoading: isLoadingMatched } = useGetMatchedHustles(episodeId)

//   // 1. Fetch all contestants for the episode
//   const { data: contestantsData, refetch, isLoading: isLoadingContestants } = useGetGameContestants(episodeId)

//   // 2. Get the last non-eliminated contestant (memoized for stability)
//   const lastContestantId = useMemo(() => {
//     const data = contestantsData?.data?.find((contestant) => contestant?.is_eliminated !== true)
//     return data?.id
//   }, [contestantsData])

//   // 3. Only fetch pick if lastContestantId is available
//   const { data: lastPickData } = useGetLastContestantPick({
//     contestant_id: Number(lastContestantId),
//     episode_id: episodeId,
//   })

//   const mynumbers = lastPickData && lastPickData[0]?.picks
//   const revealedNumbers = currentResult?.number_revealed?.filter((x) => x !== null) ?? []

//   // Initialize revealed balls from matched hustles data
//   useEffect(() => {
//     if (matchedHustlesData?.data) {
//       const alreadyRevealed = new Set(matchedHustlesData.data.map((hustle) => hustle.number_pick))
//       setRevealedBalls(alreadyRevealed)
//     }
//   }, [matchedHustlesData])

//   // Check how many numbers match
//   const matchedCount = revealedNumbers?.filter((num) => mynumbers?.includes(num)).length

//   // If all numbers matched
//   const isWinner = matchedCount === mynumbers?.length

//   // Highlight matched numbers
//   const getNumberMatchStatus = (num: number | null, allRevealed: boolean) => {
//     if (num === null) return { matched: false, showRed: false }
//     const matched = revealedNumbers?.includes(Number(num))
//     const showRed = allRevealed && !matched
//     return { matched, showRed }
//   }

//   const [displayCount, setDisplayCount] = useState(0)

//   useEffect(() => {
//     const controls = animate(displayCount, matchedCount, {
//       duration: 0.5,
//       onUpdate: (latest) => {
//         setDisplayCount(Math.round(latest))
//       },
//     })
//     return controls.stop // cleanup on unmount or value change
//   }, [matchedCount])

//   // Ball animation and reveal logic
//   const animateBallReveal = useCallback(async (ballNumber: number, result: BallPickedPayload) => {
//     setAnimatingBall(ballNumber)
//     setCurrentResult(result)

//     // Simulate ball moving to center and exploding
//     await new Promise((resolve) => setTimeout(resolve, 1500))

//     // Mark ball as revealed
//     setRevealedBalls((prev) => new Set([...prev, ballNumber]))
//     setAnimatingBall(null)

//     // Show appropriate modal
//     setShowModal(true)

//   }, [])

//   // Handle MQTT messages
//   useEffect(() => {
//     const handleMQTTMessage = (message: BallPickedResult) => {
//       if(message.event === "game_s4_start"){
//         setShowStage4Prep(false)
//       }
//        if(message.event === "close_reveal_modal"){
//         setShowModal(false)
//       }
//       if (message.event === "ball_picked") {
//         const { hustle_match } = message.payload
//         animateBallReveal(hustle_match.number_pick, message.payload)
//         refetch()
//       }
//     }
//  if (isConnected) {
//       addMessageListener(handleMQTTMessage);
//     }

//     return () => {
//       removeMessageListener(handleMQTTMessage);
//     };

//   }, [isConnected, addMessageListener, removeMessageListener, animateBallReveal])

//   // Get ball variant based on state and pre-loaded data
//   const getBallVariant = (ballNumber: number): "regular" | "matched" | "mismatched" | "selected" => {
//     if (animatingBall === ballNumber) {
//       return "selected"
//     }

//     if (revealedBalls.has(ballNumber)) {
//       // Check if this ball had a positive or negative result from matched hustles
//       const matchedHustle = matchedHustlesData?.data?.find((hustle) => hustle.number_pick === ballNumber)
//       if (matchedHustle) {
//         const isPositive = matchedHustle.is_extra_ball
//           ? matchedHustle.extra_ball_name === "CRYSTAL_BALL" || matchedHustle.extra_ball_name === "LIBERTY_LIFE_BALL"
//           : matchedHustle.is_match
//         return isPositive ? "matched" : "mismatched"
//       }
//       return "matched" // Default for revealed balls
//     }

//     return "regular"
//   }

//   // Get ball info from pre-loaded data
//   const getBallInfo = (ballNumber: number) => {
//     const ballData = hustleMatchesData?.data?.find((match) => match.number_pick === ballNumber)
//     return ballData || null
//   }

//   // Get ball display indicator
//   const getBallIndicator = (ballNumber: number) => {
//     const ballInfo = getBallInfo(ballNumber)
//     if (!ballInfo?.is_extra_ball) return null

//     switch (ballInfo.extra_ball_name) {
//       case "CRYSTAL_BALL":
//         return "💎"
//       case "KILLER_BALL":
//         return "💀"
//       case "EXTRA_PICK_BALL":
//         return "➕"
//       case "LIBERTY_LIFE_BALL":
//         return <div className="w-5 h-5 relative">
//         <Image
//           src="/images/liberty-life.png"
//           width={20}
//           height={20}
//           alt="Liberty Life Logo"
//           className="object-contain"
//         />
//       </div>
//       default:
//         return "⭐"
//     }
//   }

//  const getEffectLabel = (ballData:any) => {
//     if (!ballData?.is_extra_ball) return null;

//     switch (ballData?.extra_ball_effect_action) {
//       case "GIVE_IVY_PLAN":
//         return "LIBERTY LIFE";
//       case "MINUS_30_PERCENT":
//         return "30% LOSE";
//       case "MINUS_50_PERCENT":
//         return "50% LOSE";
//       case "MINUS_70_PERCENT":
//         return "70% LOSE";
//       case "PLUS_30_PERCENT":
//         return "30% CRYSTAL";
//       case "PLUS_50_PERCENT":
//         return "50% CRYSTAL";
//       case "EXTRA_PICK_OPPORTUNITY":
//         return "1 EXTRA PICK";
//       default:
//         return null;
//     }
//   };

//   // Function to get label color
//   const getLabelColor = (ballData:any) => {
//     if (!ballData.is_extra_ball) return "bg-purple-600";

//     switch (ballData.extra_ball_type) {
//       case "LIBERTY_LIFE":
//         return "bg-[#053F20] border-[#04DA6A] text-[#1FCC3C]";
//       case "WEAK_KILLER":
//       case "STRONG_KILLER":
//       case "SWEEPER":
//       return "bg-[#38040A] border-[#EB001B] text-[#EB001B]";
//       case "HIGH_CRYSTAL":
//       case "LOW_CRYSTAL":
//        return "bg-[#2A2000] border-[#FFC125] text-[#FFC125]";
//       case "EXTRA_PICK":
//         return "bg-[#1B0040] border-[#7E3CE0] text-[#E566FF]";
//       default:
//         return "bg-purple-600";
//     }
//   }

//   if (ShowStage4Prep) {
//     return <Stage4BoardGetReadyPage />;
//   }
//   return (
//     <div className="min-h-screen grid grid-cols-[1fr_4fr_1fr] h-full relative">
//       {/* Left Sidebar */}
//       <div className="flex flex-col justify-between">
//         <div className="flex justify-center items-center h-3.5 w-full mt-8">
//           <Logo />
//         </div>
//         <div>
//           <HustleStages activeStage={4} />
//         </div>
//         <div className="pb-4">
//           <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
//         </div>
//       </div>

//       {/* Center Content */}
//       <div className="flex flex-col justify-between items-center min-h-full">

//         {/* Top section */}
//         <div className="flex flex-col w-full items-center">
//           <div className="w-full h-[100px] flex items-center justify-center">
//             <HeaderTitleContainer
//               backgroundColor="#791192"
//               color="#ed99ff"
//               text="Hustle Board"
//               textGradientEnd="#8E17AA"
//               textGradientStart="#8E17AA"
//               borderGradientStart="#f712fc"
//               borderGradientEnd="#e151fe"
//               fontSize={45}
//               fontFamily="Verdana"
//               textStrokeColor="#a219c1"
//               textStrokeWidth={4.4}
//             />
//           </div>
//           <div className="relative flex flex-col justify-between w-full flex-grow px-6 py-[2.5rem] -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
//             {/* Animated border */}
//             <div className="absolute inset-0">
//               <motion.div
//                 className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
//                 style={{
//                   background: `conic-gradient(from 0deg at 50% 50%,
//                      #d91fff 0deg,
//                      #d91fff 120deg,
//                      #00ffff 100deg,
//                      #00ffff 240deg,
//                      #FFD700 220deg,
//                      #FFD700 360deg,
//                      #d91fff 340deg
//                    )`,
//                 }}
//                 animate={{ rotate: [0, 360] }}
//                 transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
//               />
//             </div>
//             <div className="absolute inset-0">
//               <motion.div
//                 className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
//                 style={{
//                   background: `conic-gradient(from 0deg at 50% 50%,
//                      #d91fff 0deg,
//                      #d91fff 120deg,
//                      #00ffff 100deg,
//                      #00ffff 240deg,
//                      #FFD700 220deg,
//                      #FFD700 360deg,
//                      #d91fff 340deg
//                    )`,
//                 }}
//               />
//             </div>

//             {/* Content Container */}
//             <div className="absolute inset-[8px] py-[2.75rem] bg-[#13051E] bg-[url('/images/host-bg.png')] bg-no-repeat bg-cover rounded-[.675rem]" />

//             {/* Actual Content */}
//             <div className="relative z-10 flex flex-col justify-between h-full w-full">

//    <div className="flex justify-center items-center">
//       <GlowyStrokeText
//                             strokeWidth={2}
//                             strokeColor="#D91FFF"
//                             glowColor="#13051E"
//                             glowIntensity="low"
//                             textclassName="text-[3.125rem] font-extrabold font-lucky [@media(min-width:2000px)]:text-[5rem]"
//                             fillColor="#000"
//                           >
//                             Golden Hustle Match
//                           </GlowyStrokeText>

//       </div>
//                  {/* Top: Hustle Picks */}
//               <div className="flex justify-center items-center gap-6 mt-4">
//                 <div className="flex items-center justify-center flex-col">
// <h3 className="text-white text-xl font-gilroyMedium mb-2">Your pick</h3>
//                 <div className="flex border-[2px] divide-x shadow-[0_4px_20px_#8700C7] divide-[#4B1874] rounded-[20px] py-[5.35px] px-3 border-[#CE64FF]">
//                   {mynumbers?.map((num) => {
//                     const { matched, showRed } = getNumberMatchStatus(num, revealedNumbers?.length === 5)
//                     return (
//                       <div key={num} className="px-4">
//                         <NumberCardContainer
//                           text={String(num)}
//                           textColor={matched ? "#fff" : showRed ? "#fff" : "#F2C94C"}

//                           active={matched || showRed}
//                           width={40}
//                           height={45}
//                           className="cursor-pointer transition-transform hover:scale-105"
//                         />
//                       </div>
//                     )
//                   })}
//                 </div>
//                 </div>
//                  {matchedHustlesData&&matchedHustlesData?.data?.length>0&&
//                  <div
//                 className="size-[3.5rem] shrink-0 py-1  bg-white rounded-full flex mt-10 justify-center flex-col items-center font-display text-black">
//                   <p className="text-base font-extrabold font-display">
//                     {displayCount}/5
//                   </p>
//                   <p className="block text-xxs font-display font-bold uppercase text-black">match</p>
//                 </div>}
//                    <div className="flex justify-center items-center flex-col">
//                     <h3 className="text-white text-xl font-gilroyMedium  mb-2">Match</h3>
//                <div className="flex border-[2px] divide-x shadow-[0_4px_20px_#8700C7] divide-[#4B1874] rounded-[20px] py-[5.35px] px-3 border-[#CE64FF]">

//                   {matchedHustlesData?.data?.map((x, idx:number) => {
//                   {/* {[30,3,10,56,5]?.map((x, idx) => { */}
//                     const isRevealed = x !== null

//                     const isMatched = isRevealed && mynumbers?.includes(x?.number_pick)
//                     // const status = !isRevealed ? "default" : isMatched ? "correct" : "error"
//                     return (
//                       <div key={idx} className="px-4 flex items-center flex-col justify-center">
//                         <NumberCardContainer
//                           text={isRevealed ? String(x?.number_pick) : ""}
//                           textColor="#fff"
//                              backgroundColor={isMatched ? "#04DA6A" : !isMatched ? "#EB001B" : ""}
//                            width={40}
//                           height={45}
//                           active={isMatched || !isMatched}
//                           className="cursor-pointer transition-transform hover:scale-105"
//                           // status={status}
//                         />

//                       </div>
//                     )
//                   })}
//                 </div>

//               </div>
//               </div>

//               {/* 60 Ball Grid - Much Bigger */}
//               <div className="flex justify-center mt-6 w-full ">
//                 <div className="flex items-center flex-wrap justify-center gap-6  w-full max-w-[950px] ">
//                   {Array.from({ length: 49 }, (_, i) => i + 1).map((ballNumber) => {
//                     const ballIndicator = getBallIndicator(ballNumber)
//                     const isExtraBall = ballNumber >= 50 && ballNumber <= 60
//                     const ballInfo = getBallInfo(ballNumber)

//                     return (
//                       <motion.div
//                         key={ballNumber}
//                         className="flex justify-center relative"
//                         animate={
//                           animatingBall === ballNumber
//                             ? {
//                                 scale: [1, 2, 1],
//                                 y: [0, -20, 0],
//                               }
//                             : {}
//                         }
//                         transition={{ duration: 1, ease: "easeOut" }}
//                       >
//                         <Ball
//                           number={ballNumber}
//                           variant={getBallVariant(ballNumber)}
//                           size="md"
//                           className={cn(
//                             "transition-all duration-300 w-12 h-12", // Even bigger balls
//                             animatingBall === ballNumber && "z-50",
//                             isExtraBall && ballInfo?.is_extra_ball && "",
//                           )}
//                           textClassName="text-xl font-black" // Much bigger text
//                         />

//                         {/* Enhanced Ball Type Indicator for balls 50-60 */}
//                         {isExtraBall && ballInfo?.is_extra_ball && (
//                           <div className="absolute -top-2 -right-2 z-10">
//                             <div className=" rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
//                               <span className="text-2xl">{ballIndicator}</span>
//                             </div>

//                           </div>
//                         )}

//                         {/* Regular indicator for other balls */}
//                         {!isExtraBall && ballIndicator && !revealedBalls.has(ballNumber) && (
//                           <div className="absolute -top-1 -right-1 text-sm bg-black/80 rounded-full w-6 h-6 flex items-center justify-center border border-white/20">
//                             {ballIndicator}
//                           </div>
//                         )}
//                       </motion.div>
//                     )
//                   })}
//                 </div>
//               </div>
//   <div className="grid grid-cols-5 max-w-[1000px] w-full mt-8 gap-5 mx-auto justify-center items-center">
//           {hustleMatchesData?.data?.slice(-11)?.map((item, idx) => (
//             <div className="flex flex-col items-center gap-2" key={item?.number_pick + idx}>
//               <motion.div
//                 className="flex justify-center relative"
//                 animate={
//                   animatingBall === item?.number_pick
//                     ? {
//                         scale: [1, 2, 1],
//                         y: [0, -20, 0],
//                       }
//                     : {}
//                 }
//                 transition={{ duration: 1, ease: "easeOut" }}
//               >
//                 <Ball
//                           number={item?.number_pick}
//                           variant={getBallVariant(item?.number_pick)}
//                           size="md"
//                           className={cn(
//                             "transition-all duration-300 w-12 h-12", // Even bigger balls
//                             animatingBall === item?.number_pick && "z-50",

//                           )}
//                           textClassName="text-xl font-black" // Much bigger text
//                         />
//               </motion.div>

//               {/* Effect Label */}
//               {getEffectLabel(item) && (
//                 <div className={`px-4 py-[.4375rem] rounded-[3.125rem] flex items-center border justify-center text-xs font-extrabold font-display  ${getLabelColor(item)}`}>
//                   {getEffectLabel(item)}
//                 </div>
//               )}
//             </div>
//           ))}

//           <div className="col-span-4">
//             <Stage4ProfileCard contestantsData={contestantsData} />
//           </div>
//         </div>

//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Sidebar */}
// <div className="flex justify-between items-center flex-col py-10">
//   {/* Reserved for top right content if needed */}
//   <div className=""></div>

//   {/* Dynamic Match Amount Containers */}
//   <div className="flex items-center flex-col gap-3">
//     {[
//       { amount: "₦300,000", matches: 1 },
//       { amount: "₦500,000", matches: 2 },
//       { amount: "₦3,500,000", matches: 3 },
//       { amount: "₦10,000,000", matches: 4 },
//       { amount: "₦100,000,000", matches: 5 },
//     ].map((tier, index) => (
//       <Stage4MatchAmountContainer
//         key={index}
//         mainText={tier.amount}
//         circleText={`${tier.matches}/5`}
//         isActive={matchedCount === tier.matches}
//       />
//     ))}
//   </div>

//   {/* Extra Ball Icons */}
//   <div className="flex flex-col items-center gap-y-3">
//     <div><KillerBall /></div>
//     <div><CrystalBall /></div>
//     <div><ExtraBall /></div>
//     <div><LibertyLifeBall /></div>
//   </div>
// </div>

//       {/* Modal Overlay - Positioned above the ball grid */}
//       {showModal && currentResult && (
//         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-montserrat">
//           <div className="relative max-w-4xl w-full px-4">
//             {currentResult.hustle_match.extra_ball_details?.name === "KILLER_BALL" && (
//               <KillerHustlePulledModal isOpen={true} data={currentResult} />
//             )}
//             {currentResult.hustle_match.extra_ball_details?.name === "CRYSTAL_BALL" && (
//               <CrystalModal isOpen={true} data={currentResult} />
//             )}
//             {currentResult.hustle_match.extra_ball_details?.name === "LIBERTY_LIFE_BALL" && (
//               <LibertyLifeModal isOpen={true} data={currentResult} />
//             )}
//             {!currentResult.hustle_match.is_extra_ball && currentResult.hustle_match.is_match && (
//               <WinnerBallModal
//                 isOpen={true}
//                 data={{
//                   name: {
//                     balance_details: {
//                       current_balance: currentResult.hustle_match.balance_details.current_balance,
//                     },
//                   },
//                 }}
//               />
//             )}
//             {!currentResult.hustle_match.is_extra_ball && !currentResult.hustle_match.is_match && (
//               <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl p-8 border-2 border-gray-500/50 shadow-2xl max-w-2xl mx-auto">
//                 <div className="flex flex-col items-center text-center text-white space-y-6">
//                   <div className="text-6xl">😔</div>
//                   <h2 className="text-4xl font-bold text-gray-300">No Match</h2>
//                   <p className="text-lg text-white/80">
//                     Ball #{currentResult.hustle_match.number_pick} - Better luck next time!
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       {/* Loading Overlay */}
//       {(isLoadingMatches || isLoadingMatched) && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 !font-montserrat">
//           <div className="bg-purple-900/90 backdrop-blur-sm p-8 rounded-lg flex flex-col items-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
//             <div className="text-white text-lg">Loading ball data...</div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default RafflePickReveal

"use client";
import { useMemo, useEffect, useState, useCallback } from "react";
import { animate, motion } from "framer-motion";
import { useParams } from "next/navigation";
import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import { GlowyStrokeText } from "@/components/core";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import NumberCardContainer from "@/app/shared/NumberContainer";
import { useMQTT } from "@/hooks/useMqttService";
import ErrorIcon from "@/app/icons/ErrorIcon";
import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import KillerHustlePulledModal from "./RafflePickRevealKillerModal";
import CrystalModal from "./RafflePickRevealCrystalModal";
import WinnerBallModal from "./RafflePickRevealWinnerModal";
import LibertyLifeModal from "./RafflePickRevealLibertyLifeModal";
import { useGetLastContestantPick } from "@/app/components/stages/api/stage4/getLastContestantPick";
import {
  useGetGameContestants,
  useGetHustleMatches,
  useGetMatchedHustles,
} from "@/app/admin/misc/api";
import { Ball } from "@/app/admin/misc/components/RaffleBall";
import Stage4BoardGetReadyPage from "./ShowStage4Prep";
import KillerBall from "@/app/icons/ball/KillerBall";
import CrystalBall from "@/app/icons/ball/CrystalBall";
import ExtraBall from "@/app/icons/ball/ExtrallBall";
import LibertyLifeBall from "@/app/icons/ball/LibertyLifeBall";
import Stage4MatchAmountContainer from "@/app/shared/Stage4MatchAmountContainer";
import Stage4ProfileCard from "./Stage4ProfileCard";
import Image from "next/image";
import { MQTTMessage } from "@/contexts/MQTTProvider";

// Types for MQTT data
interface ExtraBallDetails {
  name: string;
  type: string;
  effect_action: string | null;
  effect_desc: string | null;
}

interface BalanceDetails {
  is_gain: boolean;
  previous_balance: number;
  amount_gained: number;
  amount_lost: number;
  current_balance: number;
}

interface HustleMatch {
  contestant_id: number;
  number_pick: number;
  is_match: boolean;
  is_extra_ball: boolean;
  extra_ball_details: ExtraBallDetails | null;
  balance_details: BalanceDetails;
}

interface BallPickedPayload {
  hustle_match: HustleMatch;
  number_revealed: number[];
}

interface BallPickedResult {
  event: string;
  payload: BallPickedPayload;
}

const RafflePickReveal = () => {
  const { isConnected, addMessageListener, removeMessageListener } = useMQTT();
  const params = useParams();
  const episodeId = Number(params?.episodeId || params?.episode);

  // State for ball animations and reveals
  const [revealedBalls, setRevealedBalls] = useState<Set<number>>(new Set());
  const [animatingBall, setAnimatingBall] = useState<number | null>(null);
  const [currentResult, setCurrentResult] = useState<BallPickedPayload | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [ShowStage4Prep, setShowStage4Prep] = useState(true);

  // Fetch hustle matches data (what each ball contains)
  const { data: hustleMatchesData, isLoading: isLoadingMatches } =
    useGetHustleMatches(episodeId);

  // Fetch matched hustles data (already revealed balls)
  const { data: matchedHustlesData, isLoading: isLoadingMatched } =
    useGetMatchedHustles(episodeId);

  // 1. Fetch all contestants for the episode
  const {
    data: contestantsData,
    refetch,
    isLoading: isLoadingContestants,
  } = useGetGameContestants(episodeId);

  // 2. Get the last non-eliminated contestant (memoized for stability)
  const lastContestantId = useMemo(() => {
    const data = contestantsData?.data?.find(
      (contestant) => contestant?.is_eliminated !== true
    );
    return data?.id;
  }, [contestantsData]);

  // 3. Only fetch pick if lastContestantId is available
  const { data: lastPickData } = useGetLastContestantPick({
    contestant_id: Number(lastContestantId),
    episode_id: episodeId,
  });

  const mynumbers = lastPickData && lastPickData[0]?.picks;
  const revealedNumbers =
    matchedHustlesData?.data?.map((hustle) => hustle.number_pick) || [];

  // Initialize revealed balls from matched hustles data
  useEffect(() => {
    if (matchedHustlesData?.data) {
      const alreadyRevealed = new Set(
        matchedHustlesData.data.map((hustle) => hustle.number_pick)
      );
      setRevealedBalls(alreadyRevealed);
    }
  }, [matchedHustlesData]);

  // Check how many numbers match - Fixed to use mynumbers and revealedNumbers correctly
  const matchedCount = useMemo(() => {
    if (!mynumbers || !revealedNumbers.length) return 0;
    return revealedNumbers.filter((num) => mynumbers.includes(num)).length;
  }, [mynumbers, revealedNumbers]);

  // If all numbers matched
  const isWinner = matchedCount === mynumbers?.length;

  // Highlight matched numbers
  const getNumberMatchStatus = (num: number | null, allRevealed: boolean) => {
    if (num === null) return { matched: false, showRed: false };
    const matched = revealedNumbers?.includes(Number(num));
    const showRed = allRevealed && !matched;
    return { matched, showRed };
  };

  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const controls = animate(displayCount, matchedCount, {
      duration: 0.5,
      onUpdate: (latest) => {
        setDisplayCount(Math.round(latest));
      },
    });
    return controls.stop; // cleanup on unmount or value change
  }, [matchedCount]);

  // Ball animation and reveal logic
  const animateBallReveal = useCallback(
    async (ballNumber: number, result: BallPickedPayload) => {
      setAnimatingBall(ballNumber);
      setCurrentResult(result);

      // Simulate ball moving to center and exploding
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mark ball as revealed
      setRevealedBalls((prev) => new Set([...prev, ballNumber]));
      setAnimatingBall(null);

      // Show appropriate modal
      setShowModal(true);
    },
    []
  );

  // Handle MQTT messages
  useEffect(() => {
    const handleMQTTMessage = (message: MQTTMessage) => {
      const result = message.payload as BallPickedPayload;
      if (message.event === "game_s4_start") {
        setShowStage4Prep(false);
      }
      if (message.event === "close_reveal_modal") {
        setShowModal(false);
      }
      if (message.event === "ball_picked") {
        const { hustle_match } = result;
        animateBallReveal(hustle_match.number_pick, result);
        refetch();
      }
    };
    if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };
  }, [
    isConnected,
    addMessageListener,
    removeMessageListener,
    animateBallReveal,
  ]);

  // Get ball variant based on state and pre-loaded data
  const getBallVariant = (
    ballNumber: number
  ): "regular" | "matched" | "mismatched" | "selected" => {
    if (animatingBall === ballNumber) {
      return "selected";
    }

    if (revealedBalls.has(ballNumber)) {
      // Check if this ball had a positive or negative result from matched hustles
      const matchedHustle = matchedHustlesData?.data?.find(
        (hustle) => hustle.number_pick === ballNumber
      );
      if (matchedHustle) {
        const isPositive = matchedHustle.is_extra_ball
          ? matchedHustle.extra_ball_name === "CRYSTAL_BALL" ||
            matchedHustle.extra_ball_name === "LIBERTY_LIFE_BALL"
          : matchedHustle.is_match;
        return isPositive ? "matched" : "mismatched";
      }
      return "matched"; // Default for revealed balls
    }

    return "regular";
  };

  // Get ball info from pre-loaded data
  const getBallInfo = (ballNumber: number) => {
    const ballData = hustleMatchesData?.data?.find(
      (match) => match.number_pick === ballNumber
    );
    return ballData || null;
  };

  // Get ball display indicator
  const getBallIndicator = (ballNumber: number) => {
    const ballInfo = getBallInfo(ballNumber);
    if (!ballInfo?.is_extra_ball) return null;

    switch (ballInfo.extra_ball_name) {
      case "CRYSTAL_BALL":
        return "💎";
      case "KILLER_BALL":
        return "💀";
      case "EXTRA_PICK_BALL":
        return "➕";
      case "LIBERTY_LIFE_BALL":
        return (
          <div className="w-5 h-5 relative">
            <Image
              src="/images/liberty-life.png"
              width={20}
              height={20}
              alt="Liberty Life Logo"
              className="object-contain"
            />
          </div>
        );
      default:
        return "⭐";
    }
  };

  const getEffectLabel = (ballData: any) => {
    if (!ballData?.is_extra_ball) return null;

    switch (ballData?.extra_ball_effect_action) {
      case "GIVE_IVY_PLAN":
        return "LIBERTY LIFE";
      case "MINUS_30_PERCENT":
        return "30% LOSE";
      case "MINUS_50_PERCENT":
        return "50% LOSE";
      case "MINUS_70_PERCENT":
        return "70% LOSE";
      case "PLUS_30_PERCENT":
        return "30% CRYSTAL";
      case "PLUS_50_PERCENT":
        return "50% CRYSTAL";
      case "EXTRA_PICK_OPPORTUNITY":
        return "1 EXTRA PICK";
      default:
        return null;
    }
  };

  // Function to get label color
  const getLabelColor = (ballData: any) => {
    if (!ballData.is_extra_ball) return "bg-purple-600";

    switch (ballData.extra_ball_type) {
      case "LIBERTY_LIFE":
        return "bg-[#053F20] border-[#04DA6A] text-[#1FCC3C]";
      case "WEAK_KILLER":
      case "STRONG_KILLER":
      case "SWEEPER":
        return "bg-[#38040A] border-[#EB001B] text-[#EB001B]";
      case "HIGH_CRYSTAL":
      case "LOW_CRYSTAL":
        return "bg-[#2A2000] border-[#FFC125] text-[#FFC125]";
      case "EXTRA_PICK":
        return "bg-[#1B0040] border-[#7E3CE0] text-[#E566FF]";
      default:
        return "bg-purple-600";
    }
  };

  if (ShowStage4Prep) {
    return <Stage4BoardGetReadyPage />;
  }
  return (
    <div className="min-h-screen grid grid-cols-[1fr_4fr_1fr] h-full relative">
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
            <div className="absolute inset-[8px] py-[2.75rem] bg-[#13051E] bg-[url('/images/host-bg.png')] bg-no-repeat bg-cover rounded-[.675rem]" />

            {/* Actual Content */}
            <div className="relative z-10 flex flex-col justify-between h-full w-full">
              <div className="flex justify-center items-center">
                <GlowyStrokeText
                  strokeWidth={2}
                  strokeColor="#D91FFF"
                  glowColor="#13051E"
                  glowIntensity="low"
                  textclassName="text-[3.125rem] font-extrabold font-lucky [@media(min-width:2000px)]:text-[5rem]"
                  fillColor="#000"
                >
                  Golden Hustle Match
                </GlowyStrokeText>
              </div>
              {/* Top: Hustle Picks */}
              <div className="flex justify-center items-center gap-6 mt-4">
                <div className="flex items-center justify-center flex-col">
                  <h3 className="text-white text-2xl font-gilroyMedium mb-2">
                    Your pick
                  </h3>
                  <div className="flex border-[2px] divide-x shadow-[0_4px_20px_#8700C7] divide-[#4B1874] rounded-[20px] py-[5.35px] px-3 border-[#CE64FF]">
                    {mynumbers?.map((num) => {
                      const { matched, showRed } = getNumberMatchStatus(
                        num,
                        revealedNumbers?.length === 5
                      );
                      return (
                        <div key={num} className="px-4">
                          <NumberCardContainer
                            text={String(num)}
                            textColor={
                              matched ? "#fff" : showRed ? "#fff" : "#F2C94C"
                            }
                            active={matched || showRed}
                            width={75}
                            height={80}
                            className="cursor-pointer transition-transform hover:scale-105"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {matchedHustlesData && matchedHustlesData?.data?.length > 0 && (
                  <div className="size-[5.5rem] shrink-0 py-1  bg-white rounded-full flex mt-10 justify-center flex-col items-center font-display text-black">
                    <p className="text-2xl font-extrabold font-display">
                      {displayCount}/5
                    </p>
                    <p className="block text-lg font-display font-bold uppercase text-black">
                      match
                    </p>
                  </div>
                )}
                <div className="flex justify-center items-center flex-col">
                  <h3 className="text-white text-xl font-gilroyMedium  mb-2">
                    Match
                  </h3>
                  <div className="flex border-[2px] divide-x shadow-[0_4px_20px_#8700C7] divide-[#4B1874] rounded-[20px] py-[5.35px] px-3 border-[#CE64FF]">
                    {matchedHustlesData?.data?.map((x, idx: number) => {
                      {
                        /* {[30,3,10,56,5]?.map((x, idx) => { */
                      }
                      const isRevealed = x !== null;

                      const isMatched =
                        isRevealed && mynumbers?.includes(x?.number_pick);
                      // const status = !isRevealed ? "default" : isMatched ? "correct" : "error"
                      return (
                        <div
                          key={idx}
                          className="px-4 flex items-center flex-col justify-center"
                        >
                          <NumberCardContainer
                            text={isRevealed ? String(x?.number_pick) : ""}
                            textColor="#fff"
                            backgroundColor={
                              isMatched
                                ? "#04DA6A"
                                : !isMatched
                                  ? "#EB001B"
                                  : ""
                            }
                            width={75}
                            height={80}
                            active={isMatched || !isMatched}
                            className="cursor-pointer font-verdana transition-transform hover:scale-105"
                            // status={status}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 60 Ball Grid - Much Bigger */}
              <div className="flex justify-center mt-6 w-full ">
                <div className="flex items-center flex-wrap justify-center gap-6  w-full max-w-[1250px] ">
                  {Array.from({ length: 49 }, (_, i) => i + 1).map(
                    (ballNumber) => {
                      const ballIndicator = getBallIndicator(ballNumber);
                      const isExtraBall = ballNumber >= 50 && ballNumber <= 60;
                      const ballInfo = getBallInfo(ballNumber);
                      const isRevealed = revealedBalls.has(ballNumber);

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
                              "transition-all duration-300 w-14 h-14", // Even bigger balls
                              animatingBall === ballNumber && "z-50",
                              isExtraBall && ballInfo?.is_extra_ball && ""
                            )}
                            textClassName="text-2xl font-black" // Much bigger text
                          />

                          {/* Enhanced Ball Type Indicator for balls 50-60 */}
                          {isExtraBall &&
                            ballInfo?.is_extra_ball &&
                            !isRevealed && (
                              <div className="absolute -top-2 -right-2 z-10">
                                <div className=" rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                  <span className="text-2xl">
                                    {ballIndicator}
                                  </span>
                                </div>
                              </div>
                            )}

                          {/* Regular indicator for other balls */}
                          {!isExtraBall && ballIndicator && !isRevealed && (
                            <div className="absolute -top-1 -right-1 text-sm bg-black/80 rounded-full w-6 h-6 flex items-center justify-center border border-white/20">
                              {ballIndicator}
                            </div>
                          )}
                        </motion.div>
                      );
                    }
                  )}
                </div>
              </div>
              <div className="grid grid-cols-5 max-w-[1200px] w-full mt-8 gap-5 mx-auto justify-center items-center">
                {hustleMatchesData?.data?.slice(-11)?.map((item, idx) => {
                  const isRevealed = revealedBalls.has(item?.number_pick);
                  return (
                    <div
                      className="flex flex-col items-center gap-2"
                      key={item?.number_pick + idx}
                    >
                      <motion.div
                        className="flex justify-center relative"
                        animate={
                          animatingBall === item?.number_pick
                            ? {
                                scale: [1, 2, 1],
                                y: [0, -20, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        <Ball
                          number={item?.number_pick}
                          variant={getBallVariant(item?.number_pick)}
                          size="md"
                          className={cn(
                            "transition-all duration-300 w-14 h-14", // Even bigger balls
                            animatingBall === item?.number_pick && "z-50"
                          )}
                          textClassName="text-xl font-black" // Much bigger text
                        />
                      </motion.div>

                      {/* Effect Label - Only show if not revealed */}
                      {getEffectLabel(item) && (
                        <div
                          className={`px-4 py-[.4375rem] ${isRevealed ? "opacity-40" : ""} rounded-[3.125rem] flex items-center border justify-center text-xl font-extrabold font-display  ${getLabelColor(item)}`}
                        >
                          {getEffectLabel(item)}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="col-span-4">
                  <Stage4ProfileCard contestantsData={contestantsData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex justify-between items-center flex-col py-10">
        {/* Reserved for top right content if needed */}
        <div className=""></div>

        {/* Dynamic Match Amount Containers */}
        <div className="flex items-center flex-col gap-3">
          {[
            // { amount: "₦300,000", matches: 1 },
            { amount: "₦500,000", matches: 2 },
            { amount: "₦3,500,000", matches: 3 },
            { amount: "₦10,000,000", matches: 4 },
            { amount: "₦100,000,000", matches: 5 },
          ].map((tier, index) => (
            <Stage4MatchAmountContainer
              key={index}
              mainText={tier.amount}
              circleText={`${tier.matches}/5`}
              isActive={matchedCount === tier.matches}
            />
          ))}
        </div>

        {/* Extra Ball Icons */}
        <div className="flex flex-col items-center gap-y-3">
          <div>
            <KillerBall />
          </div>
          <div>
            <CrystalBall />
          </div>
          <div>
            <ExtraBall />
          </div>
          <div>
            <LibertyLifeBall />
          </div>
        </div>
      </div>

      {/* Modal Overlay - Positioned above the ball grid */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm font-montserrat">
          <div className="relative max-w-4xl w-full px-4">
            {currentResult?.hustle_match.extra_ball_details?.name ===
              "KILLER_BALL" && (
              <KillerHustlePulledModal
                isOpen={showModal}
                setShowModal={setShowModal}
                data={currentResult}
              />
            )}
            {currentResult?.hustle_match.extra_ball_details?.name ===
              "CRYSTAL_BALL" && (
              <CrystalModal
                isOpen={true}
                data={currentResult}
                setShowModal={setShowModal}
              />
            )}
            {currentResult?.hustle_match.extra_ball_details?.name ===
              "LIBERTY_LIFE_BALL" && (
              <LibertyLifeModal
                isOpen={true}
                data={currentResult}
                setShowModal={setShowModal}
              />
            )}
            {!currentResult?.hustle_match.is_extra_ball &&
              currentResult?.hustle_match.is_match && (
                <WinnerBallModal
                  isOpen={true}
                  data={{
                    name: {
                      balance_details: {
                        current_balance:
                          currentResult.hustle_match.balance_details
                            .current_balance,
                      },
                    },
                  }}
                  setShowModal={setShowModal}
                />
              )}
            {!currentResult?.hustle_match.is_extra_ball &&
              !currentResult?.hustle_match.is_match && (
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl p-8 border-2 border-gray-500/50 shadow-2xl max-w-2xl mx-auto">
                  <div className="flex flex-col items-center text-center text-white space-y-6">
                    <div className="text-6xl">😔</div>
                    <h2 className="text-4xl font-bold text-gray-300">
                      No Match
                    </h2>
                    <p className="text-lg text-white/80">
                      Ball #{currentResult?.hustle_match.number_pick} - Better
                      luck next time!
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
  );
};

export default RafflePickReveal;
