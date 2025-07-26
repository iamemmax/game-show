


// "use client"
// import Logo from "@/app/icons/Logo"
// import HeaderTitleContainer from "@/app/shared/HeaderContainer"
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
// import { GlowyStrokeText, Button } from "@/components/core"
// import { cn } from "@/utils/classNames"
// import { motion, AnimatePresence } from "framer-motion"
// import React, { useState, useEffect, useRef } from "react"
// import HustleSideBar from "../hustle/HustleSideBar"
// import HustleStages from "../hustle/HustleStages"
// import { useMQTT } from "@/hooks/useMqttService"
// import { tokenStorage } from "@/utils/auth"
// import PickCardContainer from "@/app/shared/PickCardContainer"
// import { useErrorModalState } from "@/hooks"
// import { useGetGameContestants } from "@/app/admin/misc/api"
// import { type Card, CARD_STYLES } from "./CardStyles"
// import { useCardSelection } from "../../api/stage3/sendCardSelection"
// import PickCard1 from "@/app/icons/cards/PickCard1"
// import PickCard2 from "@/app/icons/cards/PickCard2"
// import PickCard3 from "@/app/icons/cards/PickCard3"
// import DudCards from "@/app/icons/cards/DudCard"
// import EliminatedModal from "@/app/shared/EliminatedModal"
// import PassCard from "./PassCard"
// import BonusFlip from "@/app/icons/cards/BonusFlip"
// import InstantCashout from "@/app/icons/cards/InstantCashout"
// import MissCardFlip from "@/app/icons/cards/MissCardFlip"
// import StageThreeWinnerModal from "../StageThreeWinnerModal"
// import { useCheckWhetherToRevealPass } from "../../api/stage3/postCheckRevealFlip"

// // Deterministic random number generator using a seed
// class SeededRandom {
//   private seed: number

//   constructor(seed: number) {
//     this.seed = seed
//   }

//   next(): number {
//     this.seed = (this.seed * 9301 + 49297) % 233280
//     return this.seed / 233280
//   }

//   nextInt(max: number): number {
//     return Math.floor(this.next() * max)
//   }

//   shuffle<T>(array: T[]): T[] {
//     const shuffled = [...array]
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = this.nextInt(i + 1)
//       ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
//     }
//     return shuffled
//   }
// }

// // Timer synchronization utilities
// interface SyncedTimer {
//   id: string
//   type: "global" | "bonus" | "miss_flip"
//   startTime: number
//   duration: number
//   message?: string
//   nextPlayer?: string
//   cardIndex?: number
//   contestantId?: number
// }

// const Stage3CardSelection = () => {
//   const user = tokenStorage.getUser()
//   const { isConnected, sendMessage, addMessageListener, removeMessageListener } = useMQTT()
//   const [isEliminated, setIsEliminated] = useState(false)
//   const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number; name: string }>>([])
//   const { isErrorModalOpen, setErrorModalState, openErrorModalWithMessage, errorModalMessage } = useErrorModalState()
//   const [eveal_count, set_reveal_count] = useState(0)

//   // Server time synchronization
//   const [serverTimeOffset, setServerTimeOffset] = useState(0)
//   const syncedTimersRef = useRef<Map<string, SyncedTimer>>(new Map())
//   const timerIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

//   // Updated card types with instant cash
//   const CARD_TYPES = {
//     DUD: "DUD",
//     FIVE_K: "FIVE_K",
//     TEN_K: "TEN_K",
//     TWENTY_K: "TWENTY_K",
//     BONUS_FLIP: "BONUS_FLIP",
//     MISS_FLIP: "MISS_FLIP",
//     PASS: "PASS",
//   }

//   const BONUS_FLIP_STYLE = {
//     backgroundColor: "#001144",
//     rayColor: "#00BFFF",
//     innerCircleColor: "#002266",
//     textColor: "#00BFFF",
//     cornerColor: "#0088CC",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#000822",
//     textStrokeWidth: 1,
//     textStrokeColor: "#001133",
//   }

//   const MISS_FLIP_STYLE = {
//     backgroundColor: "#440022",
//     rayColor: "#FF1493",
//     innerCircleColor: "#660033",
//     textColor: "#FF1493",
//     cornerColor: "#AA0055",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#220011",
//     textStrokeWidth: 1,
//     textStrokeColor: "#330022",
//   }

//   const PASS_CARD_STYLE = {
//     backgroundColor: "#FFD700",
//     rayColor: "#FFF700",
//     innerCircleColor: "#FFED4E",
//     textColor: "#000000",
//     cornerColor: "#FFB000",
//     fontFamily: "Arial",
//     fontSize: 18,
//     labelBackgroundColor: "#FFE55C",
//     textStrokeWidth: 2,
//     textStrokeColor: "#B8860B",
//   }

//   // Instant cash card styles
//   const INSTANT_CASH_STYLES = {
//     FIVE_K: {
//       backgroundColor: "#006600",
//       rayColor: "#00FF00",
//       innerCircleColor: "#008800",
//       textColor: "#00FF00",
//       cornerColor: "#00AA00",
//       fontFamily: "Arial",
//       fontSize: 16,
//       labelBackgroundColor: "#004400",
//       textStrokeWidth: 1,
//       textStrokeColor: "#002200",
//     },
//     TEN_K: {
//       backgroundColor: "#004400",
//       rayColor: "#00DD00",
//       innerCircleColor: "#006600",
//       textColor: "#00DD00",
//       cornerColor: "#008800",
//       fontFamily: "Arial",
//       fontSize: 16,
//       labelBackgroundColor: "#002200",
//       textStrokeWidth: 1,
//       textStrokeColor: "#001100",
//     },
//     TWENTY_K: {
//       backgroundColor: "#002200",
//       rayColor: "#00BB00",
//       innerCircleColor: "#004400",
//       textColor: "#00BB00",
//       cornerColor: "#006600",
//       fontFamily: "Arial",
//       fontSize: 16,
//       labelBackgroundColor: "#001100",
//       textStrokeWidth: 1,
//       textStrokeColor: "#000800",
//     },
//   }

//   // Function to get synchronized server time
//   const getServerTime = () => {
//     return Date.now() + serverTimeOffset
//   }

//   // Function to start a synchronized timer
//   const startSyncedTimer = (timer: SyncedTimer) => {
//     console.log(`⏰ Starting synced timer: ${timer.id}`)

//     // Store the timer
//     syncedTimersRef.current.set(timer.id, timer)

//     // Broadcast timer start to all clients
//     const payload = {
//       event: "stage3_timer_sync",
//       payload: {
//         game_episode: user?.game_episode,
//         action: "start",
//         timer: timer,
//       },
//     }
//     sendMessage(payload, "stage3_timer_sync")

//     // Start local timer interval
//     startLocalTimerInterval(timer)
//   }

//   // Function to start local timer interval based on synced timer
//   const startLocalTimerInterval = (timer: SyncedTimer) => {
//     // Clear existing interval if any
//     const existingInterval = timerIntervalsRef.current.get(timer.id)
//     if (existingInterval) {
//       clearInterval(existingInterval)
//     }

//     const interval = setInterval(() => {
//       const currentTime = getServerTime()
//       const elapsed = currentTime - timer.startTime
//       const remaining = Math.max(0, timer.duration - elapsed)
//       const remainingSeconds = Math.ceil(remaining / 1000)

//       // Update UI based on timer type
//       switch (timer.type) {
//         case "global":
//           setGlobalTimer({
//             show: remainingSeconds > 0,
//             value: remainingSeconds,
//             message: timer.message || "",
//             nextPlayer: timer.nextPlayer || "",
//           })
//           break
//         case "bonus":
//           if (timer.cardIndex !== undefined) {
//             setBonusCardTimers((prev) => ({
//               ...prev,
//               [timer.cardIndex!]: remainingSeconds,
//             }))
//           }
//           break
//         case "miss_flip":
//           setMissFlipState((prev) => ({
//             ...prev,
//             showTimer: remainingSeconds > 0,
//             timerValue: remainingSeconds,
//           }))
//           break
//       }

//       // Clean up when timer expires
//       if (remainingSeconds <= 0) {
//         clearInterval(interval)
//         timerIntervalsRef.current.delete(timer.id)
//         syncedTimersRef.current.delete(timer.id)

//         // Handle timer completion
//         handleTimerComplete(timer)
//       }
//     }, 50) // Update every 50ms for faster, smoother countdown

//     timerIntervalsRef.current.set(timer.id, interval)
//   }

//   // Function to handle timer completion
//   const handleTimerComplete = (timer: SyncedTimer) => {
//     console.log(`⏰ Timer completed: ${timer.id}`)

//     switch (timer.type) {
//       case "global":
//         setGlobalTimer({ show: false, value: 0, message: "", nextPlayer: "" })
//         break
//       case "bonus":
//         if (timer.cardIndex !== undefined) {
//           setBonusCardTimers((prev) => {
//             const newTimers = { ...prev }
//             delete newTimers[timer.cardIndex!]
//             return newTimers
//           })
//         }
//         break
//       case "miss_flip":
//         setMissFlipState((prev) => ({
//           ...prev,
//           showTimer: false,
//           timerValue: 0,
//         }))
//         break
//     }
//   }

//   // Function to stop a synchronized timer
//   const stopSyncedTimer = (timerId: string) => {
//     const interval = timerIntervalsRef.current.get(timerId)
//     if (interval) {
//       clearInterval(interval)
//       timerIntervalsRef.current.delete(timerId)
//     }
//     syncedTimersRef.current.delete(timerId)

//     // Broadcast timer stop to all clients
//     const payload = {
//       event: "stage3_timer_sync",
//       payload: {
//         game_episode: user?.game_episode,
//         action: "stop",
//         timerId: timerId,
//       },
//     }
//     sendMessage(payload, "stage3_timer_sync")
//   }

//   // Function to generate deterministic card array using game episode as seed
//   const generateDeterministicCards = (gameEpisode: number): Card[] => {
//     const rng = new SeededRandom(gameEpisode)
//     const cardArray: Card[] = []

//     // Add 15 DUD cards (24 - 1 PASS - 3 BONUS - 2 MISS - 3 INSTANT = 15)
//     for (let i = 0; i < 15; i++) {
//       cardArray.push({
//         type: CARD_TYPES.DUD,
//         originalType: CARD_TYPES.DUD,
//         revealed: false,
//         style: CARD_STYLES[rng.nextInt(CARD_STYLES.length)],
//         contestant_id: null,
//       })
//     }

//     // Add exactly 3 instant cash cards
//     cardArray.push({
//       type: CARD_TYPES.FIVE_K,
//       originalType: CARD_TYPES.FIVE_K,
//       revealed: false,
//       style: INSTANT_CASH_STYLES.FIVE_K,
//       contestant_id: null,
//     })
//     cardArray.push({
//       type: CARD_TYPES.TEN_K,
//       originalType: CARD_TYPES.TEN_K,
//       revealed: false,
//       style: INSTANT_CASH_STYLES.TEN_K,
//       contestant_id: null,
//     })
//     cardArray.push({
//       type: CARD_TYPES.TWENTY_K,
//       originalType: CARD_TYPES.TWENTY_K,
//       revealed: false,
//       style: INSTANT_CASH_STYLES.TWENTY_K,
//       contestant_id: null,
//     })

//     // Add exactly 3 bonus flip cards
//     for (let i = 0; i < 3; i++) {
//       cardArray.push({
//         type: CARD_TYPES.BONUS_FLIP,
//         originalType: CARD_TYPES.BONUS_FLIP,
//         revealed: false,
//         style: BONUS_FLIP_STYLE,
//         contestant_id: null,
//       })
//     }

//     // Add exactly 2 miss flip cards
//     for (let i = 0; i < 2; i++) {
//       cardArray.push({
//         type: CARD_TYPES.MISS_FLIP,
//         originalType: CARD_TYPES.MISS_FLIP,
//         revealed: false,
//         style: MISS_FLIP_STYLE,
//         contestant_id: null,
//       })
//     }

//     // Shuffle the first 23 cards (everything except PASS) using seeded random
//     const shuffledCards = rng.shuffle(cardArray)

//     // Now add the PASS card at a deterministic position between index 10-23
//     const passInsertPosition = rng.nextInt(14) + 10 // Deterministic position from 10 to 23
//     const passCard = {
//       type: CARD_TYPES.PASS,
//       originalType: CARD_TYPES.PASS,
//       revealed: false,
//       style: PASS_CARD_STYLE,
//       contestant_id: null,
//     }

//     // Insert PASS card at the calculated position
//     shuffledCards.splice(passInsertPosition, 0, passCard)

//     const passIndex = shuffledCards.findIndex((card) => card.originalType === CARD_TYPES.PASS)
//     console.log(`🎯 PASS card is at index: ${passIndex} (deterministic)`)

//     return shuffledCards
//   }

//   const { data: handlePassRevealed } = useCheckWhetherToRevealPass()
//   const [passFound, setPassFound] = useState(false)
//   const [passFinderName, setPassFinderName] = useState<string>("")
//   const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false)
//   const [showCardRevealModal, setShowCardRevealModal] = useState(false)
//   const [revealedCardInfo, setRevealedCardInfo] = useState<{
//     type: string
//     amount?: number
//     index: number
//     playerName?: string
//   } | null>(null)
//   const [showCountdown, setShowCountdown] = useState(false)
//   const [countdownValue, setCountdownValue] = useState(3)
//   const [bonusCardTimers, setBonusCardTimers] = useState<Record<number, number>>({})

//   // Updated miss flip state management
//   const [missFlipState, setMissFlipState] = useState<{
//     active: boolean
//     contestantId: number | null
//     turnsRemaining: number
//     showTimer: boolean
//     timerValue: number
//   }>({
//     active: false,
//     contestantId: null,
//     turnsRemaining: 0,
//     showTimer: false,
//     timerValue: 0,
//   })

//   const [showBonusModal, setShowBonusModal] = useState(false)
//   const [bonusModalInfo, setBonusModalInfo] = useState<{
//     playerName: string
//     cardIndex: number
//   } | null>(null)
//   const [globalTimer, setGlobalTimer] = useState<{
//     show: boolean
//     value: number
//     message: string
//     nextPlayer: string
//   }>({ show: false, value: 0, message: "", nextPlayer: "" })

//   const [bonusFlipNotification, setBonusFlipNotification] = useState<{
//     show: boolean
//     playerName: string
//     isCurrentUser: boolean
//   }>({ show: false, playerName: "", isCurrentUser: false })

//   // Initialize cards with deterministic generation based on game episode
//   const [cards, setCards] = useState<Card[]>(() => {
//     if (user?.game_episode) {
//       return generateDeterministicCards(Number(user.game_episode))
//     }
//     return []
//   })

//   // Re-generate cards if game episode changes
//   useEffect(() => {
//     if (user?.game_episode && cards.length === 0) {
//       const deterministicCards = generateDeterministicCards(Number(user.game_episode))
//       setCards(deterministicCards)
//     }
//   }, [user?.game_episode, cards.length])

//   const [gameEnded, setGameEnded] = useState(false)
//   const [attempts, setAttempts] = useState(0)
//   const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([])
//   const [isSending, setIsSending] = useState(false)
//   const [flippingCards, setFlippingCards] = useState<number[]>([])
//   const [contestantNames, setContestantNames] = useState<Record<number, string>>({})
//   const [currentTurn, setCurrentTurn] = useState<number | null>(null)
//   const [isMyTurn, setIsMyTurn] = useState<boolean>(true)
//   const [otherContestantId, setOtherContestantId] = useState<number | null>(null)
//   const [otherContestantName, setOtherContestantName] = useState<string>("")
//   const [playerCash, setPlayerCash] = useState<Record<number, number>>({})
//   const [showCashModal, setShowCashModal] = useState(false)
//   const [lastCashWon, setLastCashWon] = useState<number>(0)

//   const {
//     data: contestantsData,
//     isLoading: isLoadingContestants,
//     refetch,
//   } = useGetGameContestants(user?.game_episode as number)

//   const cardIcons = [PickCard1, PickCard2, PickCard3]

//   // Helper function to get cash amount from card type
//   const getCashAmount = (cardType: string): number => {
//     switch (cardType) {
//       case CARD_TYPES.FIVE_K:
//         return 5000
//       case CARD_TYPES.TEN_K:
//         return 10000
//       case CARD_TYPES.TWENTY_K:
//         return 20000
//       default:
//         return 0
//     }
//   }

//   // Updated helper function to start global timer with synchronization
//   const startGlobalTimer = (seconds: number, message: string, nextPlayer: string) => {
//     const timer: SyncedTimer = {
//       id: `global_${Date.now()}`,
//       type: "global",
//       startTime: getServerTime(),
//       duration: seconds * 1000,
//       message,
//       nextPlayer,
//     }
//     startSyncedTimer(timer)
//   }

//   // Updated helper function to start bonus card timer with synchronization
//   const startBonusCardTimer = (cardIndex: number) => {
//     const timer: SyncedTimer = {
//       id: `bonus_${cardIndex}_${Date.now()}`,
//       type: "bonus",
//       startTime: getServerTime(),
//       duration: 5000, // 5 seconds
//       cardIndex,
//     }
//     startSyncedTimer(timer)
//   }

//   // Updated miss flip timer function with synchronization
//   const startMissFlipSequence = (contestantId: number) => {
//     console.log(`❌ Starting miss flip sequence for contestant ${contestantId} - 2 separate turns`)
//     setMissFlipState({
//       active: true,
//       contestantId: contestantId,
//       turnsRemaining: 2,
//       showTimer: false,
//       timerValue: 0,
//     })
//     // Give the first turn immediately
//     setCurrentTurn(contestantId)
//     setIsMyTurn(contestantId === user?.contestant_id)
//   }

//   // Function to handle turn completion during miss flip sequence with synchronized timer
//   const handleMissFlipTurnComplete = () => {
//     if (!missFlipState.active || !missFlipState.contestantId) return

//     const remainingTurns = missFlipState.turnsRemaining - 1
//     console.log(`❌ Miss flip turn completed. Remaining turns: ${remainingTurns}`)

//     if (remainingTurns > 0) {
//       // Show synchronized timer before next turn (3 seconds)
//       setMissFlipState((prev) => ({
//         ...prev,
//         turnsRemaining: remainingTurns,
//         showTimer: true,
//         timerValue: 3,
//       }))

//       const timer: SyncedTimer = {
//         id: `miss_flip_${Date.now()}`,
//         type: "miss_flip",
//         startTime: getServerTime(),
//         duration: 3000, // 3 seconds
//         contestantId: missFlipState.contestantId,
//       }
//       startSyncedTimer(timer)

//       // Set up the next turn after timer completes
//       setTimeout(() => {
//         setCurrentTurn(missFlipState.contestantId)
//         setIsMyTurn(missFlipState.contestantId === user?.contestant_id)
//         setMissFlipState((prevState) => ({
//           ...prevState,
//           showTimer: false,
//           timerValue: 0,
//         }))
//       }, 3100) // Slightly longer than timer to ensure completion
//     } else {
//       // All miss flip turns completed, return to original player
//       console.log(`❌ Miss flip sequence completed, returning to original player`)
//       setMissFlipState({
//         active: false,
//         contestantId: null,
//         turnsRemaining: 0,
//         showTimer: false,
//         timerValue: 0,
//       })

//       // Show transition timer before switching back
//       const originalPlayer =
//         missFlipState.contestantId === user?.contestant_id ? otherContestantId : user?.contestant_id
//       const originalPlayerName = originalPlayer === user?.contestant_id ? user?.name || "You" : otherContestantName

//       startGlobalTimer(2, "Turn switching back...", originalPlayerName)
//       setTimeout(() => {
//         setCurrentTurn(originalPlayer as any)
//         setIsMyTurn(originalPlayer === user?.contestant_id)
//       }, 2100) // Slightly longer than timer
//     }
//   }

//   // Clean up intervals on unmount
//   useEffect(() => {
//     return () => {
//       // Clear all timer intervals
//       timerIntervalsRef.current.forEach((interval) => {
//         clearInterval(interval)
//       })
//       timerIntervalsRef.current.clear()
//       syncedTimersRef.current.clear()
//     }
//   }, [])

//   // Helper function to get contestant name by ID
//   const getContestantName = (contestantId: number): { name: string; balance?: string } => {
//     if (contestantId === user?.contestant_id) {
//       return { name: user?.name || "YOU", balance: String(0) }
//     }
//     if (contestantsData?.data) {
//       const contestant = contestantsData.data.find((c: any) => c.id === contestantId)
//       if (contestant?.name) {
//         return {
//           name: contestant.name,
//           balance: contestant?.actual_balance,
//         }
//       }
//     }
//     if (contestantNames[contestantId]) {
//       return { name: contestantNames[contestantId], balance: undefined }
//     }
//     return { name: `Contestant ${contestantId}`, balance: undefined }
//   }

//   // Check elimination status and set remaining contestants
//   useEffect(() => {
//     if (!contestantsData?.data || !user?.contestant_id) return

//     const currentContestant = contestantsData.data.find((contestant: any) => contestant.id === user.contestant_id)

//     if (currentContestant?.eliminated_stage !== null || currentContestant?.is_eliminated) {
//       setIsEliminated(true)
//     } else {
//       setIsEliminated(false)
//     }

//     const remaining = contestantsData.data
//       .filter((contestant) => contestant.eliminated_stage === null && !contestant.is_eliminated)
//       .map((contestant) => ({
//         id: contestant.id,
//         name: contestant?.name || `Contestant ${contestant.id}`,
//       }))

//     setRemainingContestants(remaining)

//     const namesMap: Record<number, string> = {}
//     contestantsData.data.forEach((contestant: any) => {
//       if (contestant.id && contestant.name) {
//         namesMap[contestant.id] = contestant.name
//       }
//     })
//     setContestantNames(namesMap)
//   }, [contestantsData?.data, user?.contestant_id])

//   // Set up turn system for remaining contestants
//   useEffect(() => {
//     if (!user?.contestant_id || !contestantsData?.data || isEliminated) return

//     const showdownContestants = contestantsData.data.filter(
//       (contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated,
//     )

//     if (showdownContestants.length >= 2) {
//       const otherContestant = showdownContestants.find((contestant: any) => contestant.id !== user.contestant_id)

//       if (otherContestant) {
//         setOtherContestantId(otherContestant.id)
//         setOtherContestantName(otherContestant.name as string)
//       }

//       // Lower contestant ID goes first (unless they have bonus flips)
//       const firstTurnId = Math.min(showdownContestants[0].id, showdownContestants[1].id)
//       setCurrentTurn(firstTurnId)
//       setIsMyTurn(firstTurnId === user.contestant_id)
//     }
//   }, [contestantsData?.data, user?.contestant_id, isEliminated])

//   const getContestantInfo = (id: number) => {
//     const allContestant = contestantsData?.data?.find((contestant) => contestant.id === id)
//     return allContestant
//   }

//   // Updated TurnIndicator component to show miss flip status
//   const TurnIndicator = () => {
//     if (gameEnded) return null

//     // Show miss flip timer if active
//     // if (missFlipState.showTimer) {
//     //   const playerName = missFlipState.contestantId === user?.contestant_id ? "You" : otherContestantName
//     //   return (
//     //     <div className="mt-2 p-4 rounded-lg text-center bg-purple-600 bg-opacity-30 border border-purple-400">
//     //       <div className="text-purple-400 text-lg font-bold mb-2">{playerName} - Next Turn Starting In:</div>
//     //       <div className="text-purple-400 text-6xl font-bold">{missFlipState.timerValue}</div>
//     //       <div className="text-white text-sm mt-2">Turns Remaining: {missFlipState.turnsRemaining}</div>
//     //     </div>
//     //   )
//     // }

//     // Only show turn indicator, no timer here
//     return (
//       <div className="">
//         <div
//           className={cn(
//             "mt-2 p-2 rounded-lg text-center",
//             isMyTurn
//               ? "bg-green-600 bg-opacity-20 border border-green-400"
//               : "bg-red-600 bg-opacity-20 border border-red-400",
//           )}
//         >
//           <div className="flex items-center justify-center gap-2">
//             <div className={cn("w-3 h-3 rounded-full", isMyTurn ? "bg-green-400" : "bg-red-400")}></div>
//             <span className={cn("font-gilroyBold text-sm", isMyTurn ? "text-green-400" : "text-red-400")}>
//               {missFlipState.active && missFlipState.contestantId
//                 ? `${missFlipState.contestantId === user?.contestant_id ? "Your" : `${otherContestantName}'s`} Extra Turn ${3 - missFlipState.turnsRemaining}/2`
//                 : isMyTurn
//                   ? "Your turn to flip"
//                   : `${otherContestantName}'s turn`}
//             </span>
//             <div className={cn("w-3 h-3 rounded-full", isMyTurn ? "bg-green-400" : "bg-red-400")}></div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Global Timer Component - only show for current player
//   const GlobalTimer = () => {
//     if (!globalTimer.show || globalTimer.value <= 0) return null

//     return (
//       <AnimatePresence>
//         <div className="fixed inset-0 bg-black  flex items-center justify-center !z-[99999999999999999999]">
//           <motion.div
//             // initial={{ scale: 0.5, opacity: 0 }}
//             // animate={{ scale: 1, opacity: 1 }}
//             // exit={{ scale: 0.5, opacity: 0 }}
//             className="text-center p-8"
//           >
//             {globalTimer.nextPlayer && (
//               <div className="text-green-400 text-2xl font-bold px-6 py-3 rounded-lg">
//                 {globalTimer.nextPlayer}'s turn next
//               </div>
//             )}
//             <div className="text-[#04DA6A] text-9xl font-bold mb-4 drop-shadow-lg">{globalTimer.value}</div>
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

 

//   // Enhanced Card Reveal Modal Component matching the provided designs
//   const CardRevealModal = ({
//     cardType,
//     amount,
//     playerName,
//     onClose,
//   }: {
//     cardType: string
//     amount?: number
//     playerName?: string
//     onClose: () => void
//   }) => {
//     const getCardDisplay = () => {
//       switch (cardType) {
//         case CARD_TYPES.FIVE_K:
//           return {
//             title: "+₦5,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.TEN_K:
//           return {
//             title: "+₦10,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.TWENTY_K:
//           return {
//             title: "+₦20,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.MISS_FLIP:
//           return {
//             title: `${otherContestantName} gets 2 extra turns before your next turn`,
//             Icon: <MissCardFlip width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
//             cardBg: "bg-purple-600",
//           }
//         case CARD_TYPES.PASS:
//           return {
//             title: "🏆 PASS CARD! 🏆",
//             Icon: <PassCard width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
//             cardBg: "bg-yellow-400",
//           }
//         case CARD_TYPES.DUD:
//         default:
//           return {
//             title: "DUD CARD",
//             Icon: <DudCards width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
//             cardBg: "bg-gray-500",
//           }
//       }
//     }

//     const cardDisplay = getCardDisplay()

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//         <motion.div
//           initial={{ scale: 0.5, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.5, opacity: 0 }}
//           className="text-center max-w-lg w-full mx-4"
//         >
//           {/* Top text for cash cards */}
//           {(cardType.includes("K") ||
//             cardType === CARD_TYPES.FIVE_K ||
//             cardType === CARD_TYPES.TEN_K ||
//             cardType === CARD_TYPES.TWENTY_K) && (
//             <div className="text-green-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//           )}

//           {/* Miss flip special text */}
//           {cardType === CARD_TYPES.MISS_FLIP && (
//             <div className="text-green-400 text-xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//           )}

//           {/* Card container */}
//           <div className="relative mb-8">
//             <div className={`bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm `}>
//               <div className="text-white text-4xl font-bold mb-2">{cardDisplay.Icon}</div>
//             </div>
//           </div>

//           {/* Player name at bottom */}
//           {playerName && (
//             <div className="bg-red-800 text-white px-6 py-3 rounded-lg inline-block font-bold">{playerName}</div>
//           )}

//           {/* Countdown display */}
//           {showCountdown && (
//             <div className="mt-8">
//               <div className="text-green-400 text-xl font-bold mb-4">{`${otherContestantName}'s turn to flip`}</div>
//               <div className="text-green-400 text-8xl font-bold animate-pulse">{countdownValue}</div>
//             </div>
//           )}
//         </motion.div>
//       </div>
//     )
//   }

//   // Bonus Modal Component
//   const BonusModal = () => {
//     if (!showBonusModal || !bonusModalInfo) return null

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//         <motion.div
//           initial={{ scale: 0.5, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.5, opacity: 0 }}
//           className="text-center max-w-lg w-full mx-4"
//         >
//           <div className="text-purple-400 text-3xl font-bold mb-6">🎯 BONUS FLIP!</div>
//           <div className="relative mb-8">
//             <div className="bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm">
//               <BonusFlip width={300} height={300} />
//             </div>
//           </div>
//           <div className="text-white text-xl font-bold mb-4">{bonusModalInfo.playerName} earned an extra flip!</div>
//           <div className="bg-purple-800 text-white px-6 py-3 rounded-lg inline-block font-bold">
//             {bonusModalInfo.playerName}
//           </div>
//         </motion.div>
//       </div>
//     )
//   }

//   const { mutate: handleCard } = useCardSelection()

//   const sendCardSelection = async (index: number, type: string) => {
//     if (!isConnected || !user?.contestant_id) {
//       openErrorModalWithMessage("Not connected to game server")
//       return
//     }

//     setIsSending(true)
//     try {
//       const payload = {
//         event: "stage3_card_selection",
//         payload: {
//           game_episode: user?.game_episode,
//           contestant_id: user?.contestant_id,
//           contestant_name: user?.name,
//           card_index: index,
//           card_type: type,
//         },
//       }

//       await sendMessage(payload, "stage3_card_selection")
//       handleCard(
//         {
//           contestant_id: user?.contestant_id,
//           game_episode: Number(user?.game_episode),
//           pick: type?.toUpperCase(),
//         },
//         {
//           onSuccess: () => {
//             refetch()
//           },
//         },
//       )
//     } catch (error) {
//       openErrorModalWithMessage("Failed to send selection")
//     } finally {
//       setIsSending(false)
//     }
//   }

//   const handleCardClick = (index: number) => {
//     // Prevent clicks when not allowed or when global timer is showing
//     if (
//       cards[index].revealed ||
//       gameEnded ||
//       passFound ||
//       isSending ||
//       flippingCards?.length > 0 ||
//       !isMyTurn ||
//       globalTimer.show ||
//       missFlipState.showTimer
//     ) {
//       return
//     }

//     setFlippingCards([index])
//     const newAttempts = attempts + 1
//     setAttempts(newAttempts)

//     const clickedCard = cards[index]

//     // Apply the reveal after animation delay
//     setTimeout(() => {
//       let finalCardType = clickedCard.originalType

//       if (newAttempts <= 10) {
//         if (finalCardType === "PASS") {
//           finalCardType = "DUD"
//         }
//       } else if (newAttempts >= 10) {
//         // CARD_TYPES
//         Math.random() < 0.5 ? (finalCardType = CARD_TYPES.PASS) : finalCardType
//       } else if (newAttempts > 20) {
//         finalCardType = CARD_TYPES.PASS
//       }

//       const newCards = [...cards]
//       newCards[index] = {
//         ...newCards[index],
//         revealed: true,
//         type: finalCardType,
//         contestant_id: user?.contestant_id || null,
//         style:
//           finalCardType === CARD_TYPES.PASS
//             ? PASS_CARD_STYLE
//             : finalCardType === CARD_TYPES.FIVE_K
//               ? INSTANT_CASH_STYLES.FIVE_K
//               : finalCardType === CARD_TYPES.TEN_K
//                 ? INSTANT_CASH_STYLES.TEN_K
//                 : finalCardType === CARD_TYPES.TWENTY_K
//                   ? INSTANT_CASH_STYLES.TWENTY_K
//                   : newCards[index].style,
//       }

//       setCards(newCards)
//       setFlippingCards([])
//       setRecentlyUpdated([index])

//       // Handle different card types based on FINAL type
//       switch (finalCardType) {
//         case CARD_TYPES.FIVE_K:
//         case CARD_TYPES.TEN_K:
//         case CARD_TYPES.TWENTY_K:
//           console.log(`💰 Instant cash revealed: ${finalCardType}`)
//           const cashAmount = getCashAmount(finalCardType)
//           setLastCashWon(cashAmount)

//           // Only show cash modal for current player
//           setShowCashModal(true)
//           setTimeout(() => {
//             setShowCashModal(false)
//             // Check if we're in miss flip sequence
//             if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
//               handleMissFlipTurnComplete()
//             } else {
//               // Quick turn switch without waiting modal
//               setCurrentTurn(otherContestantId)
//               setIsMyTurn(false)
//               // Show brief timer only for next player
//               startGlobalTimer(1, "Your turn!", otherContestantName)
//             }
//           }, 1500) // Shorter display time
//           sendCardSelection(index, finalCardType)
//           break

//         case CARD_TYPES.DUD:
//           console.log(`💀 DUD revealed, switching turns`)
//           // Check if we're in miss flip sequence
//           if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
//             handleMissFlipTurnComplete()
//           } else {
//             // Immediate turn switch
//             setCurrentTurn(otherContestantId)
//             setIsMyTurn(false)
//             // Show brief timer only for next player
//             startGlobalTimer(1, "Your turn!", otherContestantName)
//           }
//           sendCardSelection(index, finalCardType)
//           break

//         case CARD_TYPES.BONUS_FLIP:
//           console.log(`🎯 Bonus flip revealed! Player gets 1 extra flip`)
//           // Show modal and start timer
//           setBonusModalInfo({
//             playerName: user?.name || "You",
//             cardIndex: index,
//           })
//           setShowBonusModal(true)
//           startBonusCardTimer(index)

//           // Hide modal after 3 seconds
//           setTimeout(() => {
//             setShowBonusModal(false)
//           }, 3000)

//           // Show notification
//           setBonusFlipNotification({
//             show: true,
//             playerName: user?.name || "You",
//             isCurrentUser: true,
//           })

//           // Hide notification after 3 seconds
//           setTimeout(() => {
//             setBonusFlipNotification({
//               show: false,
//               playerName: "",
//               isCurrentUser: false,
//             })
//           }, 3000)

//           // IMPORTANT: Keep the turn with current player - they get 1 more flip
//           sendCardSelection(index, finalCardType)
//           break

//         case CARD_TYPES.MISS_FLIP:
//           console.log(`❌ Miss flip revealed! Opponent gets 2 separate turns`)
//           setRevealedCardInfo({
//             type: finalCardType,
//             index,
//             playerName: user?.name || "You",
//           })
//           setShowCardRevealModal(true)

//           // Show card for 3 seconds, then start miss flip sequence
//           setTimeout(() => {
//             setShowCardRevealModal(false)
//             startGlobalTimer(3, `${otherContestantName} gets 2 extra turns!`, otherContestantName)
//             setTimeout(() => {
//               if (otherContestantId) {
//                 startMissFlipSequence(otherContestantId)
//               }
//             }, 3100) // Slightly longer than timer
//           }, 3000)
//           sendCardSelection(index, finalCardType)
//           break

//         case CARD_TYPES.PASS:
//           console.log(`🏆 PASS card found! Game winner!`)
//           setRevealedCardInfo({
//             type: finalCardType,
//             index,
//             playerName: user?.name || "You",
//           })
//           setShowCardRevealModal(true)

//           // Show PASS card for 5 seconds before showing winner modal
//           setTimeout(() => {
//             setShowCardRevealModal(false)
//             setPassFinderName(user?.name || "You")
//             setPassFinderIsCurrentUser(true)
//             setPassFound(true)
//             setGameEnded(true)
//           }, 5000)
//           sendCardSelection(index, finalCardType)
//           break

//         default:
//           console.log(`❓ Unknown card type: ${finalCardType}`)
//           // Check if we're in miss flip sequence
//           if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
//             handleMissFlipTurnComplete()
//           } else {
//             setCurrentTurn(otherContestantId)
//             setIsMyTurn(false)
//           }
//           sendCardSelection(index, finalCardType)
//       }

//       refetch()
//       // Clear recent update highlight
//       setTimeout(() => setRecentlyUpdated([]), 1000)
//     }, 600)
//   }

//   // Check if game should end (PASS found or all valuable cards found)
//   useEffect(() => {
//     const revealedCards = cards.filter((card) => card.revealed)
//     const unrevealedCards = cards.filter((card) => !card.revealed)

//     // Game ends if PASS is found
//     if (passFound) {
//       console.log(`🏁 Game ended - PASS card found`)
//       setGameEnded(true)
//       return
//     }

//     // Or if all cards are revealed and no PASS found (shouldn't happen)
//     if (unrevealedCards.length === 0 && !passFound) {
//       console.log(`🚨 All cards revealed but no PASS found - this shouldn't happen!`)
//       setGameEnded(true)
//     }
//   }, [cards, passFound])

//   // MQTT message handler with timer synchronization
//   useEffect(() => {
//     if (!isConnected) return

//     const handleMQTTMessage = (receivedMessage: any) => {
//       // Handle timer synchronization messages
//       if (receivedMessage?.event === "stage3_timer_sync") {
//         const { action, timer, timerId } = receivedMessage.payload

//         if (action === "start" && timer) {
//           // Start the timer locally for synchronization
//           startLocalTimerInterval(timer)
//         } else if (action === "stop" && timerId) {
//           // Stop the timer locally
//           const interval = timerIntervalsRef.current.get(timerId)
//           if (interval) {
//             clearInterval(interval)
//             timerIntervalsRef.current.delete(timerId)
//           }
//           syncedTimersRef.current.delete(timerId)
//         }
//         return
//       }

//       // Handle card selection messages
//       if (receivedMessage?.event === "stage3_card_selection") {
//         const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload

//         if (contestant_id === user?.contestant_id) return

//         setFlippingCards((prev) => [...prev, card_index])

//         setTimeout(() => {
//           setCards((prevCards) => {
//             const newCards = [...prevCards]
//             const finalCardType = card_type
//             console.log(`📡 MQTT: Card ${card_index} revealed as ${card_type}`)

//             newCards[card_index] = {
//               ...newCards[card_index],
//               revealed: true,
//               type: finalCardType,
//               contestant_id: contestant_id,
//               style:
//                 finalCardType === CARD_TYPES.PASS
//                   ? PASS_CARD_STYLE
//                   : finalCardType === CARD_TYPES.FIVE_K
//                     ? INSTANT_CASH_STYLES.FIVE_K
//                     : finalCardType === CARD_TYPES.TEN_K
//                       ? INSTANT_CASH_STYLES.TEN_K
//                       : finalCardType === CARD_TYPES.TWENTY_K
//                         ? INSTANT_CASH_STYLES.TWENTY_K
//                         : newCards[card_index].style,
//             }
//             return newCards
//           })

//           console.log(`📡 MQTT: Opponent revealed card ${card_index} as ${card_type}`)

//           // Handle opponent's card reveal based on the received card type
//           switch (card_type) {
//             case CARD_TYPES.FIVE_K:
//             case CARD_TYPES.TEN_K:
//             case CARD_TYPES.TWENTY_K:
//               console.log(`💰 Opponent got instant cash: ${card_type}`)
//               // Check if opponent is in miss flip sequence
//               if (missFlipState.active && missFlipState.contestantId === contestant_id) {
//                 setTimeout(() => {
//                   handleMissFlipTurnComplete()
//                 }, 1000)
//               } else {
//                 // Quick turn switch to current player
//                 setCurrentTurn(user?.contestant_id || null)
//                 setIsMyTurn(true)
//                 // Show brief timer for current player
//                 startGlobalTimer(1, "Your turn!", user?.name || "You")
//               }
//               break

//             case CARD_TYPES.DUD:
//               console.log(`💀 Opponent revealed ${card_type}`)
//               // Check if opponent is in miss flip sequence
//               if (missFlipState.active && missFlipState.contestantId === contestant_id) {
//                 setTimeout(() => {
//                   handleMissFlipTurnComplete()
//                 }, 1000)
//               } else {
//                 // Quick turn switch to current player
//                 setCurrentTurn(user?.contestant_id || null)
//                 setIsMyTurn(true)
//                 // Show brief timer for current player
//                 startGlobalTimer(1, "Your turn!", user?.name || "You")
//               }
//               break

//             case CARD_TYPES.BONUS_FLIP:
//               console.log(`🎯 Opponent got bonus flip, they get 1 extra flip`)
//               // No modal needed, opponent keeps their turn
//               break

//             case CARD_TYPES.MISS_FLIP:
//               console.log(`❌ Opponent hit miss flip, I get 2 extra flips`)
//               if (user?.contestant_id) {
//                 startMissFlipSequence(user.contestant_id)
//                 // Show brief timer for current player
//                 startGlobalTimer(1, "You get 2 extra turns!", user?.name || "You")
//               }
//               break

//             case CARD_TYPES.PASS:
//               console.log(`🏆 Opponent found PASS card!`)
//               const finderName = contestant_name || getContestantName(contestant_id)?.name
//               setPassFinderName(finderName)
//               setPassFinderIsCurrentUser(false)
//               setPassFound(true)
//               setGameEnded(true)
//               break

//             default:
//               console.log(`❓ Unknown card type from opponent: ${card_type}`)
//               // Check if opponent is in miss flip sequence
//               if (missFlipState.active && missFlipState.contestantId === contestant_id) {
//                 setTimeout(() => {
//                   handleMissFlipTurnComplete()
//                 }, 1000)
//               } else {
//                 setCurrentTurn(user?.contestant_id || null)
//                 setIsMyTurn(true)
//               }
//           }

//           setFlippingCards((prev) => prev.filter((idx) => idx !== card_index))
//           setRecentlyUpdated([card_index])
//           setTimeout(() => setRecentlyUpdated([]), 1000)
//           refetch()
//         }, 600)
//       }
//     }

//     if (isConnected) {
//       addMessageListener(handleMQTTMessage)
//     }

//     return () => {
//       removeMessageListener(handleMQTTMessage)
//     }
//   }, [
//     isConnected,
//     addMessageListener,
//     removeMessageListener,
//     user?.contestant_id,
//     refetch,
//     otherContestantId,
//     otherContestantName,
//     missFlipState,
//   ])

//   // Render different card types
//   const renderCard = (card: Card, index: number) => {
//     if (!card.revealed) {
//       return (
//         <PickCardContainer
//           backgroundColor={"transparent"}
//           text={React.createElement(cardIcons[index % 3], {
//             className: "w-[103px]",
//           })}
//           textColor={card.style.textColor}
//           fontFamily={card.style.fontFamily}
//           containerLabel=""
//           className={cn(
//             "transition-transform w-full h-full duration-300 ease-in-out p-0",
//             recentlyUpdated.includes(index) ? "ring-2 ring-white" : "",
//             flippingCards.includes(index) ? "shadow-md" : "",
//           )}
//           textClassName="font-bold text-[1.2rem]"
//           labelClassName="hidden"
//         />
//       )
//     }

//     // Render revealed cards based on type
//     const cardElement = (() => {
//       switch (card.type) {
//         case CARD_TYPES.DUD:
//           return <DudCards className="w-[90px] h-full" />
//         case CARD_TYPES.FIVE_K:
//         case CARD_TYPES.TEN_K:
//         case CARD_TYPES.TWENTY_K:
//           return <InstantCashout className="w-[90px] h-full" />
//         case CARD_TYPES.BONUS_FLIP:
//           return <BonusFlip className="w-[90px] h-full" />
//         case CARD_TYPES.MISS_FLIP:
//           return <MissCardFlip className="w-[90px] h-full" />
//         case CARD_TYPES.PASS:
//           return <PassCard className="w-[90px]" />
//         default:
//           return <DudCards className="w-[90px] h-full" />
//       }
//     })()

//     // // Add timer overlay for bonus cards - works for both current user and opponent
//     // if (card.type === CARD_TYPES.BONUS_FLIP && bonusCardTimers[index] > 0) {
//     //   const isCurrentUserCard = card.contestant_id === user?.contestant_id
//     //   const playerName = card.contestant_id ? getContestantName(card.contestant_id)?.name : "Unknown"

//     //   return (
//     //     <div className="relative">
//     //       {cardElement}
//     //       <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg border-4 border-yellow-400">
//     //         <div className="text-center">
//     //           <div className="text-yellow-400 text-sm font-bold mb-1">BONUS FLIP</div>
//     //           <div className="text-yellow-400 text-4xl font-bold drop-shadow-lg">{bonusCardTimers[index]}</div>
//     //           <div className="text-white text-xs font-bold">
//     //             {isCurrentUserCard ? "You can flip again!" : `${playerName?.split(" ")[0]} can flip again!`}
//     //           </div>
//     //           <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg"></div>
//     //         </div>
//     //       </div>
//     //     </div>
//     //   )
//     // }

//     return cardElement
//   }

//   // Show elimination modal if user is eliminated
//   if (isEliminated) {
//     return (
//       <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
//         <EliminatedModal
//           setShowEliminationModal={() => setIsEliminated(true)}
//           showEliminationModal={true}
//           balance={Number(getContestantInfo(Number(user?.contestant_id))?.actual_balance)}
//           image_url={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
//         />
//       </div>
//     )
//   }

//   const BonusFlipNotification = () => {
//     if (!bonusFlipNotification.show) return null

//     return (
//       <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
//         <motion.div
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -50 }}
//           className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-400"
//         >
//           <div className="text-center">
//             <div className="text-yellow-400 font-bold text-lg">🎯 BONUS FLIP!</div>
//             <div className="text-sm">
//               {bonusFlipNotification.isCurrentUser
//                 ? "You can flip again!"
//                 : `${bonusFlipNotification.playerName} can flip again!`}
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     )
//   }

//   return (
//     <>
//       <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
//         {/* Left Sidebar */}
//         <div className="flex flex-col justify-between">
//           <div className="flex justify-center items-center h-3.5 w-full mt-8">
//             <Logo />
//           </div>
//           <div>
//             <HustleStages activeStage={3} />
//           </div>
//           <div className="pb-4">
//             <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
//           </div>
//         </div>

//         {/* Center Content */}
//         <div className="flex flex-col justify-between items-center min-h-full">
//           <div className="flex flex-col w-full items-center">
//             <div className="w-full h-[100px] flex items-center justify-center">
//               <HeaderTitleContainer
//                 backgroundColor="#791192"
//                 color="#ed99ff"
//                 text="Pick-Pad"
//                 textGradientEnd="#8E17AA"
//                 textGradientStart="#8E17AA"
//                 borderGradientStart="#f712fc"
//                 borderGradientEnd="#e051fe"
//                 fontSize={45}
//                 fontFamily="Verdana"
//                 textStrokeColor="#a219c1"
//                 textStrokeWidth={4.4}
//               />
//             </div>

//             <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[65rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
//               {/* Animated border */}
//               <div className="absolute inset-0">
//                 <motion.div
//                   className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
//                   style={{
//                     background: `conic-gradient(from 0deg at 50% 50%,
//                         #d91fff 0deg,
//                         #d91fff 120deg,
//                         #00ffff 100deg,
//                         #00ffff 240deg,
//                         #FFD700 220deg,
//                         #FFD700 360deg,
//                         #d91fff 340deg
//                       )`,
//                   }}
//                   animate={{ rotate: [0, 360] }}
//                   transition={{
//                     duration: 4,
//                     ease: "linear",
//                     repeat: Number.POSITIVE_INFINITY,
//                   }}
//                 />
//               </div>

//               {/* Content container */}
//               <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />

//               <div className="relative">
//                 <div className="flex justify-between items-center">
//                   <div className="flex justify-between items-center flex-col w-full">
//                     <GlowyStrokeText
//                       strokeWidth={2}
//                       strokeColor="#D91FFF"
//                       glowColor="#13051E"
//                       glowIntensity="low"
//                       textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
//                       fillColor="#000"
//                     >
//                       Stage 3: Card Collection Showdown
//                     </GlowyStrokeText>
//                   </div>
//                 </div>

//                 <div className="text-white flex justify-center items-center gap-5">
//                   {/* New Turn Indicator - placed between header and cards */}
//                   {!passFound && <TurnIndicator />}
//                 </div>

//                 {isLoadingContestants ? (
//                   <div className="flex justify-center items-center h-full w-full">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//                   </div>
//                 ) : (
//                   <div className="mt-4 grid grid-cols-6 justify-center gap-4">
//                     {cards.map((card, index) => {
//                       const isFlipping = flippingCards.includes(index)
//                       const isRecentlyUpdated = recentlyUpdated.includes(index)

//                       let displayName = ""
//                       if (card.revealed && card.contestant_id) {
//                         displayName = getContestantName(card.contestant_id)?.name
//                       }

//                       return (
//                         <div
//                           key={index}
//                           onClick={() => handleCardClick(index)}
//                           className={cn(
//                             "relative transition-transform h-[90px]",
//                             card.revealed
//                               ? "cursor-default pointer-events-none opacity-70"
//                               : isMyTurn && !globalTimer.show && !missFlipState.showTimer
//                                 ? "cursor-pointer hover:scale-105"
//                                 : "cursor-not-allowed opacity-80",
//                             isSending || flippingCards.length > 0 || globalTimer?.show || missFlipState.showTimer
//                               ? "cursor-wait pointer-events-none"
//                               : "",
//                             isRecentlyUpdated ? "animate-pulse" : "",
//                           )}
//                         >
//                           <AnimatePresence mode="wait">
//                             <motion.div
//                               key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
//                               initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
//                               animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
//                               transition={{ duration: 0.3, ease: "easeInOut" }}
//                               style={{
//                                 transformStyle: "preserve-3d",
//                                 backfaceVisibility: "hidden",
//                               }}
//                               className="relative"
//                             >
//                               <div className="relative">
//                                 {card.revealed && (
//                                   <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
//                                     <span className="font-bold text-black text-xs bg-white px-2 py-1 rounded">
//                                       {displayName?.split(" ")[0]}
//                                     </span>
//                                   </div>
//                                 )}
//                                 <div className="relative w-full h-full">{renderCard(card, index)}</div>
//                               </div>
//                             </motion.div>
//                           </AnimatePresence>
//                         </div>
//                       )
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Sidebar */}
//         <div>
//           <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} />
//         </div>

//         {/* Global Timer */}
//         <GlobalTimer />

//            {/* Winner/Runner-up Modals */}
//         {passFound && passFinderIsCurrentUser && (
//           <StageThreeWinnerModal
//             name={passFinderName}
//             balance={String(getContestantInfo(Number(user?.contestant_id))?.actual_balance ?? 0)}
//             imgUrl={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
//           />
//         )}

//         {passFound && !passFinderIsCurrentUser && (
//           <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
//             <EliminatedModal
//               setShowEliminationModal={() => setIsEliminated(true)}
//               showEliminationModal={true}
//               balance={Number(getContestantInfo(Number(user?.contestant_id))?.actual_balance)}
//               image_url={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
//             />
//           </div>
//         )}

//         {/* Enhanced Card Reveal Modal */}
//         {showCardRevealModal && revealedCardInfo && (
//           <CardRevealModal
//             cardType={revealedCardInfo.type}
//             amount={revealedCardInfo.amount}
//             playerName={revealedCardInfo.playerName}
//             onClose={() => {
//               setShowCardRevealModal(false)
//               setShowCountdown(false)
//             }}
//           />
//         )}

//         <BonusFlipNotification />

//         {/* Bonus Modal */}
//         <BonusModal />
//       </div>
//     </>
//   )
// }

// export default Stage3CardSelection





// "use client"
// import Logo from "@/app/icons/Logo"
// import HeaderTitleContainer from "@/app/shared/HeaderContainer"
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
// import { GlowyStrokeText } from "@/components/core"
// import { cn } from "@/utils/classNames"
// import { motion, AnimatePresence } from "framer-motion"
// import React, { useState, useEffect, useRef } from "react"
// import HustleSideBar from "../hustle/HustleSideBar"
// import HustleStages from "../hustle/HustleStages"
// import { useMQTT } from "@/hooks/useMqttService"
// import { tokenStorage } from "@/utils/auth"
// import PickCardContainer from "@/app/shared/PickCardContainer"
// import { useErrorModalState } from "@/hooks"
// import { useGetGameContestants } from "@/app/admin/misc/api"
// import { type Card, CARD_STYLES } from "./CardStyles"
// import { useCardSelection } from "../../api/stage3/sendCardSelection"
// import PickCard1 from "@/app/icons/cards/PickCard1"
// import PickCard2 from "@/app/icons/cards/PickCard2"
// import PickCard3 from "@/app/icons/cards/PickCard3"
// import DudCards from "@/app/icons/cards/DudCard"
// import EliminatedModal from "@/app/shared/EliminatedModal"
// import PassCard from "./PassCard"
// import BonusFlip from "@/app/icons/cards/BonusFlip"
// import InstantCashout from "@/app/icons/cards/InstantCashout"
// import MissCardFlip from "@/app/icons/cards/MissCardFlip"
// import StageThreeWinnerModal from "../StageThreeWinnerModal"
// import { useCheckWhetherToRevealPass } from "../../api/stage3/postCheckRevealFlip"

// // Deterministic random number generator using a seed
// class SeededRandom {
//   private seed: number

//   constructor(seed: number) {
//     this.seed = seed
//   }

//   next(): number {
//     this.seed = (this.seed * 9301 + 49297) % 233280
//     return this.seed / 233280
//   }

//   nextInt(max: number): number {
//     return Math.floor(this.next() * max)
//   }

//   shuffle<T>(array: T[]): T[] {
//     const shuffled = [...array]
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = this.nextInt(i + 1)
//       ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
//     }
//     return shuffled
//   }
// }

// // Improved timer synchronization utilities
// interface SyncedTimer {
//   id: string
//   type: "global" | "bonus" | "miss_flip" | "turn_transition"
//   startTime: number
//   duration: number
//   message?: string
//   nextPlayer?: string
//   cardIndex?: number
//   contestantId?: number
//   priority: number // Higher priority timers override lower ones
// }

// const Stage3CardSelection = () => {
//   const user = tokenStorage.getUser()
//   const { isConnected, sendMessage, addMessageListener, removeMessageListener } = useMQTT()
//   const [isEliminated, setIsEliminated] = useState(false)
//   const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number; name: string }>>([])
//   const { isErrorModalOpen, setErrorModalState, openErrorModalWithMessage, errorModalMessage } = useErrorModalState()

//   // Improved server time synchronization
//   const [serverTimeOffset, setServerTimeOffset] = useState(0)
//   const activeTimerRef = useRef<SyncedTimer | null>(null)
//   const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
//   const timerQueueRef = useRef<SyncedTimer[]>([])

//   // Updated card types with instant cash
//   const CARD_TYPES = {
//     DUD: "DUD",
//     FIVE_K: "FIVE_K",
//     TEN_K: "TEN_K",
//     TWENTY_K: "TWENTY_K",
//     BONUS_FLIP: "BONUS_FLIP",
//     MISS_FLIP: "MISS_FLIP",
//     PASS: "PASS",
//   }

//   const BONUS_FLIP_STYLE = {
//     backgroundColor: "#001144",
//     rayColor: "#00BFFF",
//     innerCircleColor: "#002266",
//     textColor: "#00BFFF",
//     cornerColor: "#0088CC",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#000822",
//     textStrokeWidth: 1,
//     textStrokeColor: "#001133",
//   }

//   const MISS_FLIP_STYLE = {
//     backgroundColor: "#440022",
//     rayColor: "#FF1493",
//     innerCircleColor: "#660033",
//     textColor: "#FF1493",
//     cornerColor: "#AA0055",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#220011",
//     textStrokeWidth: 1,
//     textStrokeColor: "#330022",
//   }

//   const PASS_CARD_STYLE = {
//     backgroundColor: "#FFD700",
//     rayColor: "#FFF700",
//     innerCircleColor: "#FFED4E",
//     textColor: "#000000",
//     cornerColor: "#FFB000",
//     fontFamily: "Arial",
//     fontSize: 18,
//     labelBackgroundColor: "#FFE55C",
//     textStrokeWidth: 2,
//     textStrokeColor: "#B8860B",
//   }

//   // Instant cash card styles
//   const INSTANT_CASH_STYLES = {
//     FIVE_K: {
//       backgroundColor: "#006600",
//       rayColor: "#00FF00",
//       innerCircleColor: "#008800",
//       textColor: "#00FF00",
//       cornerColor: "#00AA00",
//       fontFamily: "Arial",
//       fontSize: 16,
//       labelBackgroundColor: "#004400",
//       textStrokeWidth: 1,
//       textStrokeColor: "#002200",
//     },
//     TEN_K: {
//       backgroundColor: "#004400",
//       rayColor: "#00DD00",
//       innerCircleColor: "#006600",
//       textColor: "#00DD00",
//       cornerColor: "#008800",
//       fontFamily: "Arial",
//       fontSize: 16,
//       labelBackgroundColor: "#002200",
//       textStrokeWidth: 1,
//       textStrokeColor: "#001100",
//     },
//     TWENTY_K: {
//       backgroundColor: "#002200",
//       rayColor: "#00BB00",
//       innerCircleColor: "#004400",
//       textColor: "#00BB00",
//       cornerColor: "#006600",
//       fontFamily: "Arial",
//       fontSize: 16,
//       labelBackgroundColor: "#001100",
//       textStrokeWidth: 1,
//       textStrokeColor: "#000800",
//     },
//   }

//   // Function to get synchronized server time
//   const getServerTime = () => {
//     return Date.now() + serverTimeOffset
//   }

//   // Improved timer management - only one timer at a time
//   const startSyncedTimer = (timer: SyncedTimer) => {
//     console.log(`⏰ Starting synced timer: ${timer.id} (priority: ${timer.priority})`)

//     // Stop any existing timer
//     stopCurrentTimer()

//     // Set as active timer
//     activeTimerRef.current = timer

//     // Broadcast timer start to all clients
//     const payload = {
//       event: "stage3_timer_sync",
//       payload: {
//         game_episode: user?.game_episode,
//         action: "start",
//         timer: timer,
//       },
//     }
//     sendMessage(payload, "stage3_timer_sync")

//     // Start local timer interval
//     startLocalTimerInterval(timer)
//   }

//   // Function to stop current timer
//   const stopCurrentTimer = () => {
//     if (timerIntervalRef.current) {
//       clearInterval(timerIntervalRef.current)
//       timerIntervalRef.current = null
//     }

//     if (activeTimerRef.current) {
//       console.log(`⏰ Stopping timer: ${activeTimerRef.current.id}`)
//       activeTimerRef.current = null
//     }

//     // Reset all timer states
//     setGlobalTimer({ show: false, value: 0, message: "", nextPlayer: "" })
//     setBonusCardTimers({})
//     setMissFlipState((prev) => ({
//       ...prev,
//       showTimer: false,
//       timerValue: 0,
//     }))
//   }

//   // Function to start local timer interval based on synced timer
//   const startLocalTimerInterval = (timer: SyncedTimer) => {
//     const interval = setInterval(() => {
//       const currentTime = getServerTime()
//       const elapsed = currentTime - timer.startTime
//       const remaining = Math.max(0, timer.duration - elapsed)
//       const remainingSeconds = Math.ceil(remaining / 3000)

//       // Update UI based on timer type
//       switch (timer.type) {
//         case "global":
//         case "turn_transition":
//           setGlobalTimer({
//             show: remainingSeconds > 0,
//             value: remainingSeconds,
//             message: timer.message || "",
//             nextPlayer: timer.nextPlayer || "",
//           })
//           break
//         case "bonus":
//           if (timer.cardIndex !== undefined) {
//             setBonusCardTimers((prev) => ({
//               [timer.cardIndex!]: remainingSeconds,
//             }))
//           }
//           break
//         case "miss_flip":
//           setMissFlipState((prev) => ({
//             ...prev,
//             showTimer: remainingSeconds > 0,
//             timerValue: remainingSeconds,
//           }))
//           break
//       }

//       // Clean up when timer expires
//       if (remainingSeconds <= 0) {
//         clearInterval(interval)
//         timerIntervalRef.current = null
//         handleTimerComplete(timer)
//       }
//     }, 50) // Update every 50ms for smoother countdown

//     timerIntervalRef.current = interval
//   }

//   // Function to handle timer completion
//   const handleTimerComplete = (timer: SyncedTimer) => {
//     console.log(`⏰ Timer completed: ${timer.id}`)

//     activeTimerRef.current = null

//     switch (timer.type) {
//       case "global":
//       case "turn_transition":
//         setGlobalTimer({ show: false, value: 0, message: "", nextPlayer: "" })
//         break
//       case "bonus":
//         setBonusCardTimers({})
//         break
//       case "miss_flip":
//         setMissFlipState((prev) => ({
//           ...prev,
//           showTimer: false,
//           timerValue: 0,
//         }))
//         break
//     }

//     // Process next timer in queue if any
//     processTimerQueue()
//   }

//   // Function to add timer to queue or start immediately
//   const queueTimer = (timer: SyncedTimer) => {
//     if (!activeTimerRef.current || timer.priority > activeTimerRef.current.priority) {
//       // Start immediately if no active timer or higher priority
//       startSyncedTimer(timer)
//     } else {
//       // Add to queue
//       timerQueueRef.current.push(timer)
//       timerQueueRef.current.sort((a, b) => b.priority - a.priority) // Sort by priority
//     }
//   }

//   // Function to process timer queue
//   const processTimerQueue = () => {
//     if (timerQueueRef.current.length > 0) {
//       const nextTimer = timerQueueRef.current.shift()!
//       startSyncedTimer(nextTimer)
//     }
//   }

//   // Function to generate deterministic card array using game episode as seed
//   const generateDeterministicCards = (gameEpisode: number): Card[] => {
//     const rng = new SeededRandom(gameEpisode)
//     const cardArray: Card[] = []

//     // Add 15 DUD cards (24 - 1 PASS - 3 BONUS - 2 MISS - 3 INSTANT = 15)
//     for (let i = 0; i < 15; i++) {
//       cardArray.push({
//         type: CARD_TYPES.DUD,
//         originalType: CARD_TYPES.DUD,
//         revealed: false,
//         style: CARD_STYLES[rng.nextInt(CARD_STYLES.length)],
//         contestant_id: null,
//       })
//     }

//     // Add exactly 3 instant cash cards
//     cardArray.push({
//       type: CARD_TYPES.FIVE_K,
//       originalType: CARD_TYPES.FIVE_K,
//       revealed: false,
//       style: INSTANT_CASH_STYLES.FIVE_K,
//       contestant_id: null,
//     })
//     cardArray.push({
//       type: CARD_TYPES.TEN_K,
//       originalType: CARD_TYPES.TEN_K,
//       revealed: false,
//       style: INSTANT_CASH_STYLES.TEN_K,
//       contestant_id: null,
//     })
//     cardArray.push({
//       type: CARD_TYPES.TWENTY_K,
//       originalType: CARD_TYPES.TWENTY_K,
//       revealed: false,
//       style: INSTANT_CASH_STYLES.TWENTY_K,
//       contestant_id: null,
//     })

//     // Add exactly 3 bonus flip cards
//     for (let i = 0; i < 3; i++) {
//       cardArray.push({
//         type: CARD_TYPES.BONUS_FLIP,
//         originalType: CARD_TYPES.BONUS_FLIP,
//         revealed: false,
//         style: BONUS_FLIP_STYLE,
//         contestant_id: null,
//       })
//     }

//     // Add exactly 2 miss flip cards
//     for (let i = 0; i < 2; i++) {
//       cardArray.push({
//         type: CARD_TYPES.MISS_FLIP,
//         originalType: CARD_TYPES.MISS_FLIP,
//         revealed: false,
//         style: MISS_FLIP_STYLE,
//         contestant_id: null,
//       })
//     }

//     // Shuffle the first 23 cards (everything except PASS) using seeded random
//     const shuffledCards = rng.shuffle(cardArray)

//     // Now add the PASS card at a deterministic position between index 10-23
//     const passInsertPosition = rng.nextInt(14) + 10 // Deterministic position from 10 to 23
//     const passCard = {
//       type: CARD_TYPES.PASS,
//       originalType: CARD_TYPES.PASS,
//       revealed: false,
//       style: PASS_CARD_STYLE,
//       contestant_id: null,
//     }

//     // Insert PASS card at the calculated position
//     shuffledCards.splice(passInsertPosition, 0, passCard)

//     const passIndex = shuffledCards.findIndex((card) => card.originalType === CARD_TYPES.PASS)
//     console.log(`🎯 PASS card is at index: ${passIndex} (deterministic)`)

//     return shuffledCards
//   }

//   const { data: handlePassRevealed } = useCheckWhetherToRevealPass()
//   const [passFound, setPassFound] = useState(false)
//   const [passFinderName, setPassFinderName] = useState<string>("")
//   const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false)
//   const [showCardRevealModal, setShowCardRevealModal] = useState(false)
//   const [revealedCardInfo, setRevealedCardInfo] = useState<{
//     type: string
//     amount?: number
//     index: number
//     playerName?: string
//   } | null>(null)
//   const [showCountdown, setShowCountdown] = useState(false)
//   const [countdownValue, setCountdownValue] = useState(3)
//   const [bonusCardTimers, setBonusCardTimers] = useState<Record<number, number>>({})

//   // Updated miss flip state management
//   const [missFlipState, setMissFlipState] = useState<{
//     active: boolean
//     contestantId: number | null
//     turnsRemaining: number
//     showTimer: boolean
//     timerValue: number
//   }>({
//     active: false,
//     contestantId: null,
//     turnsRemaining: 0,
//     showTimer: false,
//     timerValue: 0,
//   })

//   const [showBonusModal, setShowBonusModal] = useState(false)
//   const [bonusModalInfo, setBonusModalInfo] = useState<{
//     playerName: string
//     cardIndex: number
//   } | null>(null)

//   const [globalTimer, setGlobalTimer] = useState<{
//     show: boolean
//     value: number
//     message: string
//     nextPlayer: string
//   }>({ show: false, value: 0, message: "", nextPlayer: "" })

//   const [bonusFlipNotification, setBonusFlipNotification] = useState<{
//     show: boolean
//     playerName: string
//     isCurrentUser: boolean
//   }>({ show: false, playerName: "", isCurrentUser: false })

//   // Initialize cards with deterministic generation based on game episode
//   const [cards, setCards] = useState<Card[]>(() => {
//     if (user?.game_episode) {
//       return generateDeterministicCards(Number(user.game_episode))
//     }
//     return []
//   })

//   // Re-generate cards if game episode changes
//   useEffect(() => {
//     if (user?.game_episode && cards.length === 0) {
//       const deterministicCards = generateDeterministicCards(Number(user.game_episode))
//       setCards(deterministicCards)
//     }
//   }, [user?.game_episode, cards.length])

//   const [gameEnded, setGameEnded] = useState(false)
//   const [attempts, setAttempts] = useState(0)
//   const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([])
//   const [isSending, setIsSending] = useState(false)
//   const [flippingCards, setFlippingCards] = useState<number[]>([])
//   const [contestantNames, setContestantNames] = useState<Record<number, string>>({})
//   const [currentTurn, setCurrentTurn] = useState<number | null>(null)
//   const [isMyTurn, setIsMyTurn] = useState<boolean>(true)
//   const [otherContestantId, setOtherContestantId] = useState<number | null>(null)
//   const [otherContestantName, setOtherContestantName] = useState<string>("")
//   const [playerCash, setPlayerCash] = useState<Record<number, number>>({})
//   const [showCashModal, setShowCashModal] = useState(false)
//   const [lastCashWon, setLastCashWon] = useState<number>(0)

//   const {
//     data: contestantsData,
//     isLoading: isLoadingContestants,
//     refetch,
//   } = useGetGameContestants(user?.game_episode as number)

//   const cardIcons = [PickCard1, PickCard2, PickCard3]

//   // Helper function to get cash amount from card type
//   const getCashAmount = (cardType: string): number => {
//     switch (cardType) {
//       case CARD_TYPES.FIVE_K:
//         return 5000
//       case CARD_TYPES.TEN_K:
//         return 10000
//       case CARD_TYPES.TWENTY_K:
//         return 20000
//       default:
//         return 0
//     }
//   }

//   // Updated helper functions with improved timer management
//   const startGlobalTimer = (seconds: number, message: string, nextPlayer: string, priority = 5) => {
//     const timer: SyncedTimer = {
//       id: `global_${Date.now()}`,
//       type: "global",
//       startTime: getServerTime(),
//       duration: seconds * 1000,
//       message,
//       nextPlayer,
//       priority,
//     }
//     queueTimer(timer)
//   }

//   const startTurnTransitionTimer = (seconds: number, message: string, nextPlayer: string, priority = 10) => {
//     const timer: SyncedTimer = {
//       id: `turn_transition_${Date.now()}`,
//       type: "turn_transition",
//       startTime: getServerTime(),
//       duration: seconds * 1000,
//       message,
//       nextPlayer,
//       priority,
//     }
//     queueTimer(timer)
//   }

//   const startBonusCardTimer = (cardIndex: number, priority = 3) => {
//     const timer: SyncedTimer = {
//       id: `bonus_${cardIndex}_${Date.now()}`,
//       type: "bonus",
//       startTime: getServerTime(),
//       duration: 5000, // 5 seconds
//       cardIndex,
//       priority,
//     }
//     queueTimer(timer)
//   }

//   // Updated miss flip sequence with improved timer management
//   const startMissFlipSequence = (contestantId: number) => {
//     console.log(`❌ Starting miss flip sequence for contestant ${contestantId} - 2 separate turns`)
//     setMissFlipState({
//       active: true,
//       contestantId: contestantId,
//       turnsRemaining: 2,
//       showTimer: false,
//       timerValue: 0,
//     })

//     // Start with a transition timer before giving the first turn
//     startTurnTransitionTimer(3, "Extra turns starting...", getContestantName(contestantId).name, 15)

//     setTimeout(() => {
//       setCurrentTurn(contestantId)
//       setIsMyTurn(contestantId === user?.contestant_id)
//     }, 3100)
//   }

//   // Function to handle turn completion during miss flip sequence
//   const handleMissFlipTurnComplete = () => {
//     if (!missFlipState.active || !missFlipState.contestantId) return

//     const remainingTurns = missFlipState.turnsRemaining - 1
//     console.log(`❌ Miss flip turn completed. Remaining turns: ${remainingTurns}`)

//     if (remainingTurns > 0) {
//       // Show transition timer before next turn (3 seconds)
//       setMissFlipState((prev) => ({
//         ...prev,
//         turnsRemaining: remainingTurns,
//       }))

//       const timer: SyncedTimer = {
//         id: `miss_flip_${Date.now()}`,
//         type: "miss_flip",
//         startTime: getServerTime(),
//         duration: 3000, // 3 seconds
//         contestantId: missFlipState.contestantId,
//         priority: 12, // High priority for miss flip transitions
//       }
//       queueTimer(timer)

//       // Set up the next turn after timer completes
//       setTimeout(() => {
//         setCurrentTurn(missFlipState.contestantId)
//         setIsMyTurn(missFlipState.contestantId === user?.contestant_id)
//       }, 3100)
//     } else {
//       // All miss flip turns completed, return to original player
//       console.log(`❌ Miss flip sequence completed, returning to original player`)
//       setMissFlipState({
//         active: false,
//         contestantId: null,
//         turnsRemaining: 0,
//         showTimer: false,
//         timerValue: 0,
//       })

//       // Show transition timer before switching back
//       const originalPlayer =
//         missFlipState.contestantId === user?.contestant_id ? otherContestantId : user?.contestant_id
//       const originalPlayerName = originalPlayer === user?.contestant_id ? user?.name || "You" : otherContestantName

//       startTurnTransitionTimer(2, "Turn switching back...", originalPlayerName, 15)

//       setTimeout(() => {
//         setCurrentTurn(originalPlayer as any)
//         setIsMyTurn(originalPlayer === user?.contestant_id)
//       }, 2100)
//     }
//   }

//   // Clean up intervals on unmount
//   useEffect(() => {
//     return () => {
//       stopCurrentTimer()
//       timerQueueRef.current = []
//     }
//   }, [])

//   // Helper function to get contestant name by ID
//   const getContestantName = (contestantId: number): { name: string; balance?: string } => {
//     if (contestantId === user?.contestant_id) {
//       return { name: user?.name || "YOU", balance: String(0) }
//     }
//     if (contestantsData?.data) {
//       const contestant = contestantsData.data.find((c: any) => c.id === contestantId)
//       if (contestant?.name) {
//         return {
//           name: contestant.name,
//           balance: contestant?.actual_balance,
//         }
//       }
//     }
//     if (contestantNames[contestantId]) {
//       return { name: contestantNames[contestantId], balance: undefined }
//     }
//     return { name: `Contestant ${contestantId}`, balance: undefined }
//   }

//   // Check elimination status and set remaining contestants
//   useEffect(() => {
//     if (!contestantsData?.data || !user?.contestant_id) return

//     const currentContestant = contestantsData.data.find((contestant: any) => contestant.id === user.contestant_id)
//     if (currentContestant?.eliminated_stage !== null || currentContestant?.is_eliminated) {
//       setIsEliminated(true)
//     } else {
//       setIsEliminated(false)
//     }

//     const remaining = contestantsData.data
//       .filter((contestant) => contestant.eliminated_stage === null && !contestant.is_eliminated)
//       .map((contestant) => ({
//         id: contestant.id,
//         name: contestant?.name || `Contestant ${contestant.id}`,
//       }))

//     setRemainingContestants(remaining)

//     const namesMap: Record<number, string> = {}
//     contestantsData.data.forEach((contestant: any) => {
//       if (contestant.id && contestant.name) {
//         namesMap[contestant.id] = contestant.name
//       }
//     })
//     setContestantNames(namesMap)
//   }, [contestantsData?.data, user?.contestant_id])

//   // Set up turn system for remaining contestants
//   useEffect(() => {
//     if (!user?.contestant_id || !contestantsData?.data || isEliminated) return

//     const showdownContestants = contestantsData.data.filter(
//       (contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated,
//     )

//     if (showdownContestants.length >= 2) {
//       const otherContestant = showdownContestants.find((contestant: any) => contestant.id !== user.contestant_id)
//       if (otherContestant) {
//         setOtherContestantId(otherContestant.id)
//         setOtherContestantName(otherContestant.name as string)
//       }

//       // Lower contestant ID goes first (unless they have bonus flips)
//       const firstTurnId = Math.min(showdownContestants[0].id, showdownContestants[1].id)
//       setCurrentTurn(firstTurnId)
//       setIsMyTurn(firstTurnId === user.contestant_id)
//     }
//   }, [contestantsData?.data, user?.contestant_id, isEliminated])

//   const getContestantInfo = (id: number) => {
//     const allContestant = contestantsData?.data?.find((contestant) => contestant.id === id)
//     return allContestant
//   }

//   // Updated TurnIndicator component
//   const TurnIndicator = () => {
//     if (gameEnded) return null

//     return (
//       <div className="">
//         <div
//           className={cn(
//             "mt-2 p-2 rounded-lg text-center",
//             isMyTurn
//               ? "bg-green-600 bg-opacity-20 border border-green-400"
//               : "bg-red-600 bg-opacity-20 border border-red-400",
//           )}
//         >
//           <div className="flex items-center justify-center gap-2">
//             <div className={cn("w-3 h-3 rounded-full", isMyTurn ? "bg-green-400" : "bg-red-400")}></div>
//             <span className={cn("font-gilroyBold text-sm", isMyTurn ? "text-green-400" : "text-red-400")}>
//               {missFlipState.active && missFlipState.contestantId
//                 ? `${missFlipState.contestantId === user?.contestant_id ? "Your" : `${otherContestantName}'s`} Extra Turn ${3 - missFlipState.turnsRemaining}/2`
//                 : isMyTurn
//                   ? "Your turn to flip"
//                   : `${otherContestantName}'s turn`}
//             </span>
//             <div className={cn("w-3 h-3 rounded-full", isMyTurn ? "bg-green-400" : "bg-red-400")}></div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Global Timer Component - unified display for all timer types
//   const GlobalTimer = () => {
//     if (!globalTimer.show || globalTimer.value <= 0) return null

//     return (
//       <AnimatePresence>
//         <div className="fixed inset-0 bg-black flex items-center justify-center !z-[99999999999999999999]">
//           <motion.div className="text-center p-8">
//             {globalTimer.nextPlayer && (
//               <div className="text-green-400 text-2xl font-bold px-6 py-3 rounded-lg mb-4">{globalTimer.message}</div>
//             )}
//             <div className="text-[#04DA6A] text-9xl font-bold mb-4 drop-shadow-lg">{globalTimer.value}</div>
//             {globalTimer.nextPlayer && <div className="text-white text-xl">{globalTimer.nextPlayer}</div>}
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   // Enhanced Card Reveal Modal Component matching the provided designs
//   const CardRevealModal = ({
//     cardType,
//     amount,
//     playerName,
//     onClose,
//   }: {
//     cardType: string
//     amount?: number
//     playerName?: string
//     onClose: () => void
//   }) => {
//     const getCardDisplay = () => {
//       switch (cardType) {
//         case CARD_TYPES.FIVE_K:
//           return {
//             title: "+₦5,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.TEN_K:
//           return {
//             title: "+₦10,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.TWENTY_K:
//           return {
//             title: "+₦20,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.MISS_FLIP:
//           return {
//             title: `${otherContestantName} gets 2 extra turns before your next turn`,
//             Icon: <MissCardFlip width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
//             cardBg: "bg-purple-600",
//           }
//         case CARD_TYPES.PASS:
//           return {
//             title: "🏆 PASS CARD! 🏆",
//             Icon: <PassCard width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
//             cardBg: "bg-yellow-400",
//           }
//         case CARD_TYPES.DUD:
//         default:
//           return {
//             title: "DUD CARD",
//             Icon: <DudCards width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
//             cardBg: "bg-gray-500",
//           }
//       }
//     }

//     const cardDisplay = getCardDisplay()

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//         <motion.div
//           initial={{ scale: 0.5, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.5, opacity: 0 }}
//           className="text-center max-w-lg w-full mx-4"
//         >
//           {/* Top text for cash cards */}
//           {(cardType.includes("K") ||
//             cardType === CARD_TYPES.FIVE_K ||
//             cardType === CARD_TYPES.TEN_K ||
//             cardType === CARD_TYPES.TWENTY_K) && (
//             <div className="text-green-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//           )}

//           {/* Miss flip special text */}
//           {cardType === CARD_TYPES.MISS_FLIP && (
//             <div className="text-green-400 text-xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//           )}

//           {/* Card container */}
//           <div className="relative mb-8">
//             <div className={`bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm `}>
//               <div className="text-white text-4xl font-bold mb-2">{cardDisplay.Icon}</div>
//             </div>
//           </div>

//           {/* Player name at bottom */}
//           {playerName && (
//             <div className="bg-red-800 text-white px-6 py-3 rounded-lg inline-block font-bold">{playerName}</div>
//           )}

//           {/* Countdown display */}
//           {showCountdown && (
//             <div className="mt-8">
//               <div className="text-green-400 text-xl font-bold mb-4">{`${otherContestantName}'s turn to flip`}</div>
//               <div className="text-green-400 text-8xl font-bold animate-pulse">{countdownValue}</div>
//             </div>
//           )}
//         </motion.div>
//       </div>
//     )
//   }

//   // Bonus Modal Component
//   const BonusModal = () => {
//     if (!showBonusModal || !bonusModalInfo) return null

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//         <motion.div
//           initial={{ scale: 0.5, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.5, opacity: 0 }}
//           className="text-center max-w-lg w-full mx-4"
//         >
//           <div className="text-purple-400 text-3xl font-bold mb-6">🎯 BONUS FLIP!</div>
//           <div className="relative mb-8">
//             <div className="bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm">
//               <BonusFlip width={300} height={300} />
//             </div>
//           </div>
//           <div className="text-white text-xl font-bold mb-4">{bonusModalInfo.playerName} earned an extra flip!</div>
//           <div className="bg-purple-800 text-white px-6 py-3 rounded-lg inline-block font-bold">
//             {bonusModalInfo.playerName}
//           </div>
//         </motion.div>
//       </div>
//     )
//   }

//   const { mutate: handleCard } = useCardSelection()

//   const sendCardSelection = async (index: number, type: string) => {
//     if (!isConnected || !user?.contestant_id) {
//       openErrorModalWithMessage("Not connected to game server")
//       return
//     }

//     setIsSending(true)
//     try {
//       const payload = {
//         event: "stage3_card_selection",
//         payload: {
//           game_episode: user?.game_episode,
//           contestant_id: user?.contestant_id,
//           contestant_name: user?.name,
//           card_index: index,
//           card_type: type,
//         },
//       }

//       await sendMessage(payload, "stage3_card_selection")
//       handleCard(
//         {
//           contestant_id: user?.contestant_id,
//           game_episode: Number(user?.game_episode),
//           pick: type?.toUpperCase(),
//         },
//         {
//           onSuccess: () => {
//             refetch()
//           },
//         },
//       )
//     } catch (error) {
//       openErrorModalWithMessage("Failed to send selection")
//     } finally {
//       setIsSending(false)
//     }
//   }

//   const handleCardClick = (index: number) => {
//     // Prevent clicks when not allowed or when any timer is showing
//     if (
//       cards[index].revealed ||
//       gameEnded ||
//       passFound ||
//       isSending ||
//       flippingCards?.length > 0 ||
//       !isMyTurn ||
//       globalTimer.show ||
//       activeTimerRef.current !== null // Block clicks when any timer is active
//     ) {
//       return
//     }

//     setFlippingCards([index])
//     const newAttempts = attempts + 1
//     setAttempts(newAttempts)
//     const clickedCard = cards[index]

//     // Apply the reveal after animation delay
//     setTimeout(() => {
//       let finalCardType = clickedCard.originalType

//       if (newAttempts <= 10) {
//         if (finalCardType === "PASS") {
//           finalCardType = "DUD"
//         }
//       } else if (newAttempts >= 10) {
//         Math.random() < 0.5 ? (finalCardType = CARD_TYPES.PASS) : finalCardType
//       } else if (newAttempts > 20) {
//         finalCardType = CARD_TYPES.PASS
//       }

//       const newCards = [...cards]
//       newCards[index] = {
//         ...newCards[index],
//         revealed: true,
//         type: finalCardType,
//         contestant_id: user?.contestant_id || null,
//         style:
//           finalCardType === CARD_TYPES.PASS
//             ? PASS_CARD_STYLE
//             : finalCardType === CARD_TYPES.FIVE_K
//               ? INSTANT_CASH_STYLES.FIVE_K
//               : finalCardType === CARD_TYPES.TEN_K
//                 ? INSTANT_CASH_STYLES.TEN_K
//                 : finalCardType === CARD_TYPES.TWENTY_K
//                   ? INSTANT_CASH_STYLES.TWENTY_K
//                   : newCards[index].style,
//       }

//       setCards(newCards)
//       setFlippingCards([])
//       setRecentlyUpdated([index])

//       // Handle different card types based on FINAL type
//       switch (finalCardType) {
//         case CARD_TYPES.FIVE_K:
//         case CARD_TYPES.TEN_K:
//         case CARD_TYPES.TWENTY_K:
//           console.log(`💰 Instant cash revealed: ${finalCardType}`)
//           const cashAmount = getCashAmount(finalCardType)
//           setLastCashWon(cashAmount)
//           setShowCashModal(true)

//           setTimeout(() => {
//             setShowCashModal(false)
//             // Check if we're in miss flip sequence
//             if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
//               handleMissFlipTurnComplete()
//             } else {
//               // Quick turn switch
//               setCurrentTurn(otherContestantId)
//               setIsMyTurn(false)
//               startTurnTransitionTimer(1, "Your turn!", otherContestantName, 8)
//             }
//           }, 1500)
//           sendCardSelection(index, finalCardType)
//           break

//         case CARD_TYPES.DUD:
//           console.log(`💀 DUD revealed, switching turns`)
//           if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
//             handleMissFlipTurnComplete()
//           } else {
//             setCurrentTurn(otherContestantId)
//             setIsMyTurn(false)
//             startTurnTransitionTimer(1, "Your turn!", otherContestantName, 8)
//           }
//           sendCardSelection(index, finalCardType)
//           break

//         case CARD_TYPES.BONUS_FLIP:
//           console.log(`🎯 Bonus flip revealed! Player gets 1 extra flip`)
//           setBonusModalInfo({
//             playerName: user?.name || "You",
//             cardIndex: index,
//           })
//           setShowBonusModal(true)
//           startBonusCardTimer(index, 3)

//           setTimeout(() => {
//             setShowBonusModal(false)
//           }, 3000)

//           setBonusFlipNotification({
//             show: true,
//             playerName: user?.name || "You",
//             isCurrentUser: true,
//           })

//           setTimeout(() => {
//             setBonusFlipNotification({
//               show: false,
//               playerName: "",
//               isCurrentUser: false,
//             })
//           }, 3000)

//           sendCardSelection(index, finalCardType)
//           break

//         case CARD_TYPES.MISS_FLIP:
//           console.log(`❌ Miss flip revealed! Opponent gets 2 separate turns`)
//           setRevealedCardInfo({
//             type: finalCardType,
//             index,
//             playerName: user?.name || "You",
//           })
//           setShowCardRevealModal(true)

//           setTimeout(() => {
//             setShowCardRevealModal(false)
//             if (otherContestantId) {
//               startMissFlipSequence(otherContestantId)
//             }
//           }, 3000)
//           sendCardSelection(index, finalCardType)
//           break

//         case CARD_TYPES.PASS:
//           console.log(`🏆 PASS card found! Game winner!`)
//           setRevealedCardInfo({
//             type: finalCardType,
//             index,
//             playerName: user?.name || "You",
//           })
//           setShowCardRevealModal(true)

//           setTimeout(() => {
//             setShowCardRevealModal(false)
//             setPassFinderName(user?.name || "You")
//             setPassFinderIsCurrentUser(true)
//             setPassFound(true)
//             setGameEnded(true)
//           }, 5000)
//           sendCardSelection(index, finalCardType)
//           break

//         default:
//           console.log(`❓ Unknown card type: ${finalCardType}`)
//           if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
//             handleMissFlipTurnComplete()
//           } else {
//             setCurrentTurn(otherContestantId)
//             setIsMyTurn(false)
//           }
//           sendCardSelection(index, finalCardType)
//       }

//       refetch()
//       setTimeout(() => setRecentlyUpdated([]), 1000)
//     }, 600)
//   }

//   // Check if game should end (PASS found or all valuable cards found)
//   useEffect(() => {
//     const revealedCards = cards.filter((card) => card.revealed)
//     const unrevealedCards = cards.filter((card) => !card.revealed)

//     if (passFound) {
//       console.log(`🏁 Game ended - PASS card found`)
//       setGameEnded(true)
//       return
//     }

//     if (unrevealedCards.length === 0 && !passFound) {
//       console.log(`🚨 All cards revealed but no PASS found - this shouldn't happen!`)
//       setGameEnded(true)
//     }
//   }, [cards, passFound])

//   // MQTT message handler with improved timer synchronization
//   useEffect(() => {
//     if (!isConnected) return

//     const handleMQTTMessage = (receivedMessage: any) => {
//       // Handle timer synchronization messages
//       if (receivedMessage?.event === "stage3_timer_sync") {
//         const { action, timer, timerId } = receivedMessage.payload
//         if (action === "start" && timer) {
//           startLocalTimerInterval(timer)
//         } else if (action === "stop" && timerId) {
//           stopCurrentTimer()
//         }
//         return
//       }

//       // Handle card selection messages
//       if (receivedMessage?.event === "stage3_card_selection") {
//         const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload
//         if (contestant_id === user?.contestant_id) return

//         setFlippingCards((prev) => [...prev, card_index])

//         setTimeout(() => {
//           setCards((prevCards) => {
//             const newCards = [...prevCards]
//             const finalCardType = card_type
//             console.log(`📡 MQTT: Card ${card_index} revealed as ${card_type}`)

//             newCards[card_index] = {
//               ...newCards[card_index],
//               revealed: true,
//               type: finalCardType,
//               contestant_id: contestant_id,
//               style:
//                 finalCardType === CARD_TYPES.PASS
//                   ? PASS_CARD_STYLE
//                   : finalCardType === CARD_TYPES.FIVE_K
//                     ? INSTANT_CASH_STYLES.FIVE_K
//                     : finalCardType === CARD_TYPES.TEN_K
//                       ? INSTANT_CASH_STYLES.TEN_K
//                       : finalCardType === CARD_TYPES.TWENTY_K
//                         ? INSTANT_CASH_STYLES.TWENTY_K
//                         : newCards[card_index].style,
//             }
//             return newCards
//           })

//           console.log(`📡 MQTT: Opponent revealed card ${card_index} as ${card_type}`)

//           // Handle opponent's card reveal based on the received card type
//           switch (card_type) {
//             case CARD_TYPES.FIVE_K:
//             case CARD_TYPES.TEN_K:
//             case CARD_TYPES.TWENTY_K:
//               console.log(`💰 Opponent got instant cash: ${card_type}`)
//               if (missFlipState.active && missFlipState.contestantId === contestant_id) {
//                 setTimeout(() => {
//                   handleMissFlipTurnComplete()
//                 }, 1000)
//               } else {
//                 setCurrentTurn(user?.contestant_id || null)
//                 setIsMyTurn(true)
//                 startTurnTransitionTimer(1, "Your turn!", user?.name || "You", 8)
//               }
//               break

//             case CARD_TYPES.DUD:
//               console.log(`💀 Opponent revealed ${card_type}`)
//               if (missFlipState.active && missFlipState.contestantId === contestant_id) {
//                 setTimeout(() => {
//                   handleMissFlipTurnComplete()
//                 }, 1000)
//               } else {
//                 setCurrentTurn(user?.contestant_id || null)
//                 setIsMyTurn(true)
//                 startTurnTransitionTimer(1, "Your turn!", user?.name || "You", 8)
//               }
//               break

//             case CARD_TYPES.BONUS_FLIP:
//               console.log(`🎯 Opponent got bonus flip, they get 1 extra flip`)
//               // No turn change, opponent keeps their turn
//               break

//             case CARD_TYPES.MISS_FLIP:
//               console.log(`❌ Opponent hit miss flip, I get 2 extra flips`)
//               if (user?.contestant_id) {
//                 startMissFlipSequence(user.contestant_id)
//               }
//               break

//             case CARD_TYPES.PASS:
//               console.log(`🏆 Opponent found PASS card!`)
//               const finderName = contestant_name || getContestantName(contestant_id)?.name
//               setPassFinderName(finderName)
//               setPassFinderIsCurrentUser(false)
//               setPassFound(true)
//               setGameEnded(true)
//               break

//             default:
//               console.log(`❓ Unknown card type from opponent: ${card_type}`)
//               if (missFlipState.active && missFlipState.contestantId === contestant_id) {
//                 setTimeout(() => {
//                   handleMissFlipTurnComplete()
//                 }, 1000)
//               } else {
//                 setCurrentTurn(user?.contestant_id || null)
//                 setIsMyTurn(true)
//               }
//           }

//           setFlippingCards((prev) => prev.filter((idx) => idx !== card_index))
//           setRecentlyUpdated([card_index])
//           setTimeout(() => setRecentlyUpdated([]), 1000)
//           refetch()
//         }, 600)
//       }
//     }

//     if (isConnected) {
//       addMessageListener(handleMQTTMessage)
//     }

//     return () => {
//       removeMessageListener(handleMQTTMessage)
//     }
//   }, [
//     isConnected,
//     addMessageListener,
//     removeMessageListener,
//     user?.contestant_id,
//     refetch,
//     otherContestantId,
//     otherContestantName,
//     missFlipState,
//   ])

//   // Render different card types
//   const renderCard = (card: Card, index: number) => {
//     if (!card.revealed) {
//       return (
//         <PickCardContainer
//           backgroundColor={"transparent"}
//           text={React.createElement(cardIcons[index % 3], {
//             className: "w-[103px]",
//           })}
//           textColor={card.style.textColor}
//           fontFamily={card.style.fontFamily}
//           containerLabel=""
//           className={cn(
//             "transition-transform w-full h-full duration-300 ease-in-out p-0",
//             recentlyUpdated.includes(index) ? "ring-2 ring-white" : "",
//             flippingCards.includes(index) ? "shadow-md" : "",
//           )}
//           textClassName="font-bold text-[1.2rem]"
//           labelClassName="hidden"
//         />
//       )
//     }

//     // Render revealed cards based on type
//     const cardElement = (() => {
//       switch (card.type) {
//         case CARD_TYPES.DUD:
//           return <DudCards className="w-[90px] h-full" />
//         case CARD_TYPES.FIVE_K:
//         case CARD_TYPES.TEN_K:
//         case CARD_TYPES.TWENTY_K:
//           return <InstantCashout className="w-[90px] h-full" />
//         case CARD_TYPES.BONUS_FLIP:
//           return <BonusFlip className="w-[90px] h-full" />
//         case CARD_TYPES.MISS_FLIP:
//           return <MissCardFlip className="w-[90px] h-full" />
//         case CARD_TYPES.PASS:
//           return <PassCard className="w-[90px]" />
//         default:
//           return <DudCards className="w-[90px] h-full" />
//       }
//     })()

//     return cardElement
//   }

//   // Show elimination modal if user is eliminated
//   if (isEliminated) {
//     return (
//       <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
//         <EliminatedModal
//           setShowEliminationModal={() => setIsEliminated(true)}
//           showEliminationModal={true}
//           balance={Number(getContestantInfo(Number(user?.contestant_id))?.actual_balance)}
//           image_url={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
//         />
//       </div>
//     )
//   }

//   const BonusFlipNotification = () => {
//     if (!bonusFlipNotification.show) return null

//     return (
//       <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
//         <motion.div
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -50 }}
//           className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-400"
//         >
//           <div className="text-center">
//             <div className="text-yellow-400 font-bold text-lg">🎯 BONUS FLIP!</div>
//             <div className="text-sm">
//               {bonusFlipNotification.isCurrentUser
//                 ? "You can flip again!"
//                 : `${bonusFlipNotification.playerName} can flip again!`}
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     )
//   }

//   return (
//     <>
//       <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
//         {/* Left Sidebar */}
//         <div className="flex flex-col justify-between">
//           <div className="flex justify-center items-center h-3.5 w-full mt-8">
//             <Logo />
//           </div>
//           <div>
//             <HustleStages activeStage={3} />
//           </div>
//           <div className="pb-4">
//             <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
//           </div>
//         </div>

//         {/* Center Content */}
//         <div className="flex flex-col justify-between items-center min-h-full">
//           <div className="flex flex-col w-full items-center">
//             <div className="w-full h-[100px] flex items-center justify-center">
//               <HeaderTitleContainer
//                 backgroundColor="#791192"
//                 color="#ed99ff"
//                 text="Pick-Pad"
//                 textGradientEnd="#8E17AA"
//                 textGradientStart="#8E17AA"
//                 borderGradientStart="#f712fc"
//                 borderGradientEnd="#e051fe"
//                 fontSize={45}
//                 fontFamily="Verdana"
//                 textStrokeColor="#a219c1"
//                 textStrokeWidth={4.4}
//               />
//             </div>

//             <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[65rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
//               {/* Animated border */}
//               <div className="absolute inset-0">
//                 <motion.div
//                   className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
//                   style={{
//                     background: `conic-gradient(from 0deg at 50% 50%,
//                         #d91fff 0deg,
//                         #d91fff 120deg,
//                         #00ffff 100deg,
//                         #00ffff 240deg,
//                         #FFD700 220deg,
//                         #FFD700 360deg,
//                         #d91fff 340deg
//                       )`,
//                   }}
//                   animate={{ rotate: [0, 360] }}
//                   transition={{
//                     duration: 4,
//                     ease: "linear",
//                     repeat: Number.POSITIVE_INFINITY,
//                   }}
//                 />
//               </div>

//               {/* Content container */}
//               <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
//               <div className="relative">
//                 <div className="flex justify-between items-center">
//                   <div className="flex justify-between items-center flex-col w-full">
//                     <GlowyStrokeText
//                       strokeWidth={2}
//                       strokeColor="#D91FFF"
//                       glowColor="#13051E"
//                       glowIntensity="low"
//                       textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
//                       fillColor="#000"
//                     >
//                       Stage 3: Card Collection Showdown
//                     </GlowyStrokeText>
//                   </div>
//                 </div>

//                 <div className="text-white flex justify-center items-center gap-5">
//                   {!passFound && <TurnIndicator />}
//                 </div>

//                 {isLoadingContestants ? (
//                   <div className="flex justify-center items-center h-full w-full">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//                   </div>
//                 ) : (
//                   <div className="mt-4 grid grid-cols-6 justify-center gap-4">
//                     {cards.map((card, index) => {
//                       const isFlipping = flippingCards.includes(index)
//                       const isRecentlyUpdated = recentlyUpdated.includes(index)
//                       let displayName = ""
//                       if (card.revealed && card.contestant_id) {
//                         displayName = getContestantName(card.contestant_id)?.name
//                       }

//                       return (
//                         <div
//                           key={index}
//                           onClick={() => handleCardClick(index)}
//                           className={cn(
//                             "relative transition-transform h-[90px]",
//                             card.revealed
//                               ? "cursor-default pointer-events-none opacity-70"
//                               : isMyTurn && !globalTimer.show && !activeTimerRef.current
//                                 ? "cursor-pointer hover:scale-105"
//                                 : "cursor-not-allowed opacity-80",
//                             isSending || flippingCards.length > 0 || globalTimer?.show || activeTimerRef.current
//                               ? "cursor-wait pointer-events-none"
//                               : "",
//                             isRecentlyUpdated ? "animate-pulse" : "",
//                           )}
//                         >
//                           <AnimatePresence mode="wait">
//                             <motion.div
//                               key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
//                               initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
//                               animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
//                               transition={{ duration: 0.3, ease: "easeInOut" }}
//                               style={{
//                                 transformStyle: "preserve-3d",
//                                 backfaceVisibility: "hidden",
//                               }}
//                               className="relative"
//                             >
//                               <div className="relative">
//                                 {card.revealed && (
//                                   <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
//                                     <span className="font-bold text-black text-xs bg-white px-2 py-1 rounded">
//                                       {displayName?.split(" ")[0]}
//                                     </span>
//                                   </div>
//                                 )}
//                                 <div className="relative w-full h-full">{renderCard(card, index)}</div>
//                               </div>
//                             </motion.div>
//                           </AnimatePresence>
//                         </div>
//                       )
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Sidebar */}
//         <div>
//           <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} />
//         </div>

//         {/* Global Timer */}
//         <GlobalTimer />

//         {/* Winner/Runner-up Modals */}
//         {passFound && passFinderIsCurrentUser && (
//           <StageThreeWinnerModal
//             name={passFinderName}
//             balance={String(getContestantInfo(Number(user?.contestant_id))?.actual_balance ?? 0)}
//             imgUrl={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
//           />
//         )}

//         {passFound && !passFinderIsCurrentUser && (
//           <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
//             <EliminatedModal
//               setShowEliminationModal={() => setIsEliminated(true)}
//               showEliminationModal={true}
//               balance={Number(getContestantInfo(Number(user?.contestant_id))?.actual_balance)}
//               image_url={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
//             />
//           </div>
//         )}

//         {/* Enhanced Card Reveal Modal */}
//         {showCardRevealModal && revealedCardInfo && (
//           <CardRevealModal
//             cardType={revealedCardInfo.type}
//             amount={revealedCardInfo.amount}
//             playerName={revealedCardInfo.playerName}
//             onClose={() => {
//               setShowCardRevealModal(false)
//               setShowCountdown(false)
//             }}
//           />
//         )}

//         <BonusFlipNotification />

//         {/* Bonus Modal */}
//         <BonusModal />
//       </div>
//     </>
//   )
// }

// export default Stage3CardSelection


"use client"
import Logo from "@/app/icons/Logo"
import HeaderTitleContainer from "@/app/shared/HeaderContainer"
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
import { GlowyStrokeText } from "@/components/core"
import { cn } from "@/utils/classNames"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState, useEffect, useRef } from "react"
import HustleSideBar from "../hustle/HustleSideBar"
import HustleStages from "../hustle/HustleStages"
import { useMQTT } from "@/hooks/useMqttService"
import { tokenStorage } from "@/utils/auth"
import PickCardContainer from "@/app/shared/PickCardContainer"
import { useErrorModalState } from "@/hooks"
import { useGetGameContestants } from "@/app/admin/misc/api"
import { type Card, CARD_STYLES } from "./CardStyles"
import { useCardSelection } from "../../api/stage3/sendCardSelection"
import PickCard1 from "@/app/icons/cards/PickCard1"
import PickCard2 from "@/app/icons/cards/PickCard2"
import PickCard3 from "@/app/icons/cards/PickCard3"
import DudCards from "@/app/icons/cards/DudCard"
import EliminatedModal from "@/app/shared/EliminatedModal"
import PassCard from "./PassCard"
import BonusFlip from "@/app/icons/cards/BonusFlip"
import InstantCashout from "@/app/icons/cards/InstantCashout"
import MissCardFlip from "@/app/icons/cards/MissCardFlip"
import StageThreeWinnerModal from "../StageThreeWinnerModal"
import { useCheckWhetherToRevealPass } from "../../api/stage3/postCheckRevealFlip"

// Deterministic random number generator using a seed
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max)
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

// Timer synchronization utilities
interface SyncedTimer {
  id: string
  type: "global" | "bonus" | "miss_flip"
  startTime: number
  duration: number
  message?: string
  nextPlayer?: string
  cardIndex?: number
  contestantId?: number
}

const Stage3CardSelection = () => {
  const user = tokenStorage.getUser()
  const { isConnected, sendMessage, addMessageListener, removeMessageListener } = useMQTT()
  const [isEliminated, setIsEliminated] = useState(false)
  const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number; name: string }>>([])
  const { isErrorModalOpen, setErrorModalState, openErrorModalWithMessage, errorModalMessage } = useErrorModalState()
  const [eveal_count, set_reveal_count] = useState(0)

  // Server time synchronization
  const [serverTimeOffset, setServerTimeOffset] = useState(0)
  const syncedTimersRef = useRef<Map<string, SyncedTimer>>(new Map())
  const timerIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Updated card types with instant cash
  const CARD_TYPES = {
    DUD: "DUD",
    FIVE_K: "FIVE_K",
    TEN_K: "TEN_K",
    TWENTY_K: "TWENTY_K",
    BONUS_FLIP: "BONUS_FLIP",
    MISS_FLIP: "MISS_FLIP",
    PASS: "PASS",
  }

  const BONUS_FLIP_STYLE = {
    backgroundColor: "#001144",
    rayColor: "#00BFFF",
    innerCircleColor: "#002266",
    textColor: "#00BFFF",
    cornerColor: "#0088CC",
    fontFamily: "Arial",
    fontSize: 16,
    labelBackgroundColor: "#000822",
    textStrokeWidth: 1,
    textStrokeColor: "#001133",
  }

  const MISS_FLIP_STYLE = {
    backgroundColor: "#440022",
    rayColor: "#FF1493",
    innerCircleColor: "#660033",
    textColor: "#FF1493",
    cornerColor: "#AA0055",
    fontFamily: "Arial",
    fontSize: 16,
    labelBackgroundColor: "#220011",
    textStrokeWidth: 1,
    textStrokeColor: "#330022",
  }

  const PASS_CARD_STYLE = {
    backgroundColor: "#FFD700",
    rayColor: "#FFF700",
    innerCircleColor: "#FFED4E",
    textColor: "#000000",
    cornerColor: "#FFB000",
    fontFamily: "Arial",
    fontSize: 18,
    labelBackgroundColor: "#FFE55C",
    textStrokeWidth: 2,
    textStrokeColor: "#B8860B",
  }

  // Instant cash card styles
  const INSTANT_CASH_STYLES = {
    FIVE_K: {
      backgroundColor: "#006600",
      rayColor: "#00FF00",
      innerCircleColor: "#008800",
      textColor: "#00FF00",
      cornerColor: "#00AA00",
      fontFamily: "Arial",
      fontSize: 16,
      labelBackgroundColor: "#004400",
      textStrokeWidth: 1,
      textStrokeColor: "#002200",
    },
    TEN_K: {
      backgroundColor: "#004400",
      rayColor: "#00DD00",
      innerCircleColor: "#006600",
      textColor: "#00DD00",
      cornerColor: "#008800",
      fontFamily: "Arial",
      fontSize: 16,
      labelBackgroundColor: "#002200",
      textStrokeWidth: 1,
      textStrokeColor: "#001100",
    },
    TWENTY_K: {
      backgroundColor: "#002200",
      rayColor: "#00BB00",
      innerCircleColor: "#004400",
      textColor: "#00BB00",
      cornerColor: "#006600",
      fontFamily: "Arial",
      fontSize: 16,
      labelBackgroundColor: "#001100",
      textStrokeWidth: 1,
      textStrokeColor: "#000800",
    },
  }

  // Function to get synchronized server time
  const getServerTime = () => {
    return Date.now() + serverTimeOffset
  }

  // Function to start a synchronized timer
  const startSyncedTimer = (timer: SyncedTimer) => {
    console.log(`⏰ Starting synced timer: ${timer.id}`)
    // Store the timer
    syncedTimersRef.current.set(timer.id, timer)
    // Broadcast timer start to all clients
    const payload = {
      event: "stage3_timer_sync",
      payload: {
        game_episode: user?.game_episode,
        action: "start",
        timer: timer,
      },
    }
    sendMessage(payload, "stage3_timer_sync")
    // Start local timer interval
    startLocalTimerInterval(timer)
  }

  // Function to start local timer interval based on synced timer
  const startLocalTimerInterval = (timer: SyncedTimer) => {
    // Clear existing interval if any
    const existingInterval = timerIntervalsRef.current.get(timer.id)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    const interval = setInterval(() => {
      const currentTime = getServerTime()
      const elapsed = currentTime - timer.startTime
      const remaining = Math.max(0, timer.duration - elapsed)
      const remainingSeconds = Math.ceil(remaining / 1000)

      // Update UI based on timer type
      switch (timer.type) {
        case "global":
          setGlobalTimer({
            show: remainingSeconds > 0,
            value: remainingSeconds,
            message: timer.message || "",
            nextPlayer: timer.nextPlayer || "",
          })
          break
        case "bonus":
          if (timer.cardIndex !== undefined) {
            setBonusCardTimers((prev) => ({
              ...prev,
              [timer.cardIndex!]: remainingSeconds,
            }))
          }
          break
        case "miss_flip":
          setMissFlipState((prev) => ({
            ...prev,
            showTimer: remainingSeconds > 0,
            timerValue: remainingSeconds,
          }))
          break
      }

      // Clean up when timer expires
      if (remainingSeconds <= 0) {
        clearInterval(interval)
        timerIntervalsRef.current.delete(timer.id)
        syncedTimersRef.current.delete(timer.id)
        // Handle timer completion
        handleTimerComplete(timer)
      }
    }, 50) // Update every 50ms for faster, smoother countdown

    timerIntervalsRef.current.set(timer.id, interval)
  }

  // Function to handle timer completion
  const handleTimerComplete = (timer: SyncedTimer) => {
    console.log(`⏰ Timer completed: ${timer.id}`)
    switch (timer.type) {
      case "global":
        setGlobalTimer({ show: false, value: 0, message: "", nextPlayer: "" })
        break
      case "bonus":
        if (timer.cardIndex !== undefined) {
          setBonusCardTimers((prev) => {
            const newTimers = { ...prev }
            delete newTimers[timer.cardIndex!]
            return newTimers
          })
        }
        break
      case "miss_flip":
        setMissFlipState((prev) => ({
          ...prev,
          showTimer: false,
          timerValue: 0,
        }))
        break
    }
  }

  // Function to stop a synchronized timer
  const stopSyncedTimer = (timerId: string) => {
    const interval = timerIntervalsRef.current.get(timerId)
    if (interval) {
      clearInterval(interval)
      timerIntervalsRef.current.delete(timerId)
    }
    syncedTimersRef.current.delete(timerId)
    // Broadcast timer stop to all clients
    const payload = {
      event: "stage3_timer_sync",
      payload: {
        game_episode: user?.game_episode,
        action: "stop",
        timerId: timerId,
      },
    }
    sendMessage(payload, "stage3_timer_sync")
  }

  // Function to generate deterministic card array using game episode as seed
  const generateDeterministicCards = (gameEpisode: number): Card[] => {
    const rng = new SeededRandom(gameEpisode)
    const cardArray: Card[] = []

    // Add 15 DUD cards (24 - 1 PASS - 3 BONUS - 2 MISS - 3 INSTANT = 15)
    for (let i = 0; i < 15; i++) {
      cardArray.push({
        type: CARD_TYPES.DUD,
        originalType: CARD_TYPES.DUD,
        revealed: false,
        style: CARD_STYLES[rng.nextInt(CARD_STYLES.length)],
        contestant_id: null,
      })
    }

    // Add exactly 3 instant cash cards
    cardArray.push({
      type: CARD_TYPES.FIVE_K,
      originalType: CARD_TYPES.FIVE_K,
      revealed: false,
      style: INSTANT_CASH_STYLES.FIVE_K,
      contestant_id: null,
    })
    cardArray.push({
      type: CARD_TYPES.TEN_K,
      originalType: CARD_TYPES.TEN_K,
      revealed: false,
      style: INSTANT_CASH_STYLES.TEN_K,
      contestant_id: null,
    })
    cardArray.push({
      type: CARD_TYPES.TWENTY_K,
      originalType: CARD_TYPES.TWENTY_K,
      revealed: false,
      style: INSTANT_CASH_STYLES.TWENTY_K,
      contestant_id: null,
    })

    // Add exactly 3 bonus flip cards
    for (let i = 0; i < 3; i++) {
      cardArray.push({
        type: CARD_TYPES.BONUS_FLIP,
        originalType: CARD_TYPES.BONUS_FLIP,
        revealed: false,
        style: BONUS_FLIP_STYLE,
        contestant_id: null,
      })
    }

    // Add exactly 2 miss flip cards
    for (let i = 0; i < 2; i++) {
      cardArray.push({
        type: CARD_TYPES.MISS_FLIP,
        originalType: CARD_TYPES.MISS_FLIP,
        revealed: false,
        style: MISS_FLIP_STYLE,
        contestant_id: null,
      })
    }

    // Shuffle the first 23 cards (everything except PASS) using seeded random
    const shuffledCards = rng.shuffle(cardArray)

    // Now add the PASS card at a deterministic position between index 10-23
    const passInsertPosition = rng.nextInt(14) + 10 // Deterministic position from 10 to 23
    const passCard = {
      type: CARD_TYPES.PASS,
      originalType: CARD_TYPES.PASS,
      revealed: false,
      style: PASS_CARD_STYLE,
      contestant_id: null,
    }

    // Insert PASS card at the calculated position
    shuffledCards.splice(passInsertPosition, 0, passCard)

    const passIndex = shuffledCards.findIndex((card) => card.originalType === CARD_TYPES.PASS)
    console.log(`🎯 PASS card is at index: ${passIndex} (deterministic)`)

    return shuffledCards
  }

  const { data: handlePassRevealed } = useCheckWhetherToRevealPass()
  const [passFound, setPassFound] = useState(false)
  const [passFinderName, setPassFinderName] = useState<string>("")
  const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false)
  const [showCardRevealModal, setShowCardRevealModal] = useState(false)
  const [revealedCardInfo, setRevealedCardInfo] = useState<{
    type: string
    amount?: number
    index: number
    playerName?: string
  } | null>(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownValue, setCountdownValue] = useState(3)
  const [bonusCardTimers, setBonusCardTimers] = useState<Record<number, number>>({})

  // Updated miss flip state management
  const [missFlipState, setMissFlipState] = useState<{
    active: boolean
    contestantId: number | null
    turnsRemaining: number
    showTimer: boolean
    timerValue: number
  }>({
    active: false,
    contestantId: null,
    turnsRemaining: 0,
    showTimer: false,
    timerValue: 0,
  })

  const [showBonusModal, setShowBonusModal] = useState(false)
  const [bonusModalInfo, setBonusModalInfo] = useState<{
    playerName: string
    cardIndex: number
  } | null>(null)

  const [globalTimer, setGlobalTimer] = useState<{
    show: boolean
    value: number
    message: string
    nextPlayer: string
  }>({ show: false, value: 0, message: "", nextPlayer: "" })

  const [bonusFlipNotification, setBonusFlipNotification] = useState<{
    show: boolean
    playerName: string
    isCurrentUser: boolean
  }>({ show: false, playerName: "", isCurrentUser: false })

  // Initialize cards with deterministic generation based on game episode
  const [cards, setCards] = useState<Card[]>(() => {
    if (user?.game_episode) {
      return generateDeterministicCards(Number(user.game_episode))
    }
    return []
  })

  // Re-generate cards if game episode changes
  useEffect(() => {
    if (user?.game_episode && cards.length === 0) {
      const deterministicCards = generateDeterministicCards(Number(user.game_episode))
      setCards(deterministicCards)
    }
  }, [user?.game_episode, cards.length])

  const [gameEnded, setGameEnded] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([])
  const [isSending, setIsSending] = useState(false)
  const [flippingCards, setFlippingCards] = useState<number[]>([])
  const [contestantNames, setContestantNames] = useState<Record<number, string>>({})
  const [currentTurn, setCurrentTurn] = useState<number | null>(null)
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false) // Changed to false initially
  const [otherContestantId, setOtherContestantId] = useState<number | null>(null)
  const [otherContestantName, setOtherContestantName] = useState<string>("")
  const [playerCash, setPlayerCash] = useState<Record<number, number>>({})
  const [showCashModal, setShowCashModal] = useState(false)
  const [lastCashWon, setLastCashWon] = useState<number>(0)

  // Add turn synchronization state
  const [turnSynced, setTurnSynced] = useState(false)

  const {
    data: contestantsData,
    isLoading: isLoadingContestants,
    refetch,
  } = useGetGameContestants(user?.game_episode as number)

  const cardIcons = [PickCard1, PickCard2, PickCard3]

  // Helper function to get cash amount from card type
  const getCashAmount = (cardType: string): number => {
    switch (cardType) {
      case CARD_TYPES.FIVE_K:
        return 5000
      case CARD_TYPES.TEN_K:
        return 10000
      case CARD_TYPES.TWENTY_K:
        return 20000
      default:
        return 0
    }
  }

  // Updated helper function to start global timer with synchronization
  const startGlobalTimer = (seconds: number, message: string, nextPlayer: string) => {
    const timer: SyncedTimer = {
      id: `global_${Date.now()}`,
      type: "global",
      startTime: getServerTime(),
      duration: seconds * 1000,
      message,
      nextPlayer,
    }
    startSyncedTimer(timer)
  }

  // Updated helper function to start bonus card timer with synchronization
  const startBonusCardTimer = (cardIndex: number) => {
    const timer: SyncedTimer = {
      id: `bonus_${cardIndex}_${Date.now()}`,
      type: "bonus",
      startTime: getServerTime(),
      duration: 5000, // 5 seconds
      cardIndex,
    }
    startSyncedTimer(timer)
  }

  // Updated miss flip timer function with synchronization
  const startMissFlipSequence = (contestantId: number) => {
    console.log(`❌ Starting miss flip sequence for contestant ${contestantId} - 2 separate turns`)
    setMissFlipState({
      active: true,
      contestantId: contestantId,
      turnsRemaining: 2,
      showTimer: false,
      timerValue: 0,
    })

    // Give the first turn immediately
    setCurrentTurn(contestantId)
    setIsMyTurn(contestantId === user?.contestant_id)

    // Broadcast turn change to sync with other clients
    broadcastTurnChange(contestantId)
  }

  // Function to broadcast turn changes
  const broadcastTurnChange = (nextContestantId: number) => {
    const payload = {
      event: "stage3_turn_change",
      payload: {
        game_episode: user?.game_episode,
        current_turn: nextContestantId,
        timestamp: Date.now(),
      },
    }
    sendMessage(payload, "stage3_turn_change")
  }

  // Function to handle turn completion during miss flip sequence with synchronized timer
  const handleMissFlipTurnComplete = () => {
    if (!missFlipState.active || !missFlipState.contestantId) return

    const remainingTurns = missFlipState.turnsRemaining - 1
    console.log(`❌ Miss flip turn completed. Remaining turns: ${remainingTurns}`)

    if (remainingTurns > 0) {
      // Show synchronized timer before next turn (3 seconds)
      setMissFlipState((prev) => ({
        ...prev,
        turnsRemaining: remainingTurns,
        showTimer: true,
        timerValue: 3,
      }))

      const timer: SyncedTimer = {
        id: `miss_flip_${Date.now()}`,
        type: "miss_flip",
        startTime: getServerTime(),
        duration: 3000, // 3 seconds
        contestantId: missFlipState.contestantId,
      }
      startSyncedTimer(timer)

      // Set up the next turn after timer completes
      setTimeout(() => {
        setCurrentTurn(missFlipState.contestantId)
        setIsMyTurn(missFlipState.contestantId === user?.contestant_id)
        broadcastTurnChange(missFlipState.contestantId!)
        setMissFlipState((prevState) => ({
          ...prevState,
          showTimer: false,
          timerValue: 0,
        }))
      }, 3100) // Slightly longer than timer to ensure completion
    } else {
      // All miss flip turns completed, return to original player
      console.log(`❌ Miss flip sequence completed, returning to original player`)
      setMissFlipState({
        active: false,
        contestantId: null,
        turnsRemaining: 0,
        showTimer: false,
        timerValue: 0,
      })

      // Show transition timer before switching back
      const originalPlayer =
        missFlipState.contestantId === user?.contestant_id ? otherContestantId : user?.contestant_id
      const originalPlayerName = originalPlayer === user?.contestant_id ? user?.name || "You" : otherContestantName

      startGlobalTimer(2, "Turn switching back...", originalPlayerName)

      setTimeout(() => {
        setCurrentTurn(originalPlayer as any)
        setIsMyTurn(originalPlayer === user?.contestant_id)
        broadcastTurnChange(originalPlayer!)
      }, 2100) // Slightly longer than timer
    }
  }

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      // Clear all timer intervals
      timerIntervalsRef.current.forEach((interval) => {
        clearInterval(interval)
      })
      timerIntervalsRef.current.clear()
      syncedTimersRef.current.clear()
    }
  }, [])

  // Helper function to get contestant name by ID
  const getContestantName = (contestantId: number): { name: string; balance?: string } => {
    if (contestantId === user?.contestant_id) {
      return { name: user?.name || "YOU", balance: String(0) }
    }
    if (contestantsData?.data) {
      const contestant = contestantsData.data.find((c: any) => c.id === contestantId)
      if (contestant?.name) {
        return {
          name: contestant.name,
          balance: contestant?.actual_balance,
        }
      }
    }
    if (contestantNames[contestantId]) {
      return { name: contestantNames[contestantId], balance: undefined }
    }
    return { name: `Contestant ${contestantId}`, balance: undefined }
  }

  // Check elimination status and set remaining contestants
  useEffect(() => {
    if (!contestantsData?.data || !user?.contestant_id) return

    const currentContestant = contestantsData.data.find((contestant: any) => contestant.id === user.contestant_id)
    if (currentContestant?.eliminated_stage !== null || currentContestant?.is_eliminated) {
      setIsEliminated(true)
    } else {
      setIsEliminated(false)
    }

    const remaining = contestantsData.data
      .filter((contestant) => contestant.eliminated_stage === null && !contestant.is_eliminated)
      .map((contestant) => ({
        id: contestant.id,
        name: contestant?.name || `Contestant ${contestant.id}`,
      }))

    setRemainingContestants(remaining)

    const namesMap: Record<number, string> = {}
    contestantsData.data.forEach((contestant: any) => {
      if (contestant.id && contestant.name) {
        namesMap[contestant.id] = contestant.name
      }
    })
    setContestantNames(namesMap)
  }, [contestantsData?.data, user?.contestant_id])

  // FIXED: Set up turn system for remaining contestants with proper synchronization
  useEffect(() => {
    if (!user?.contestant_id || !contestantsData?.data || isEliminated || turnSynced) return

    const showdownContestants = contestantsData.data.filter(
      (contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated,
    )

    if (showdownContestants.length >= 2) {
      const otherContestant = showdownContestants.find((contestant: any) => contestant.id !== user.contestant_id)
      if (otherContestant) {
        setOtherContestantId(otherContestant.id)
        setOtherContestantName(otherContestant.name as string)
      }

      // Only set initial turn if we haven't synced yet and current turn is null
      if (currentTurn === null) {
        // Lower contestant ID goes first
        const firstTurnId = Math.min(showdownContestants[0].id, showdownContestants[1].id)
        console.log(`🎮 Setting initial turn to contestant ${firstTurnId}`)

        setCurrentTurn(firstTurnId)
        setIsMyTurn(firstTurnId === user.contestant_id)

        // Broadcast initial turn to sync with other clients
        broadcastTurnChange(firstTurnId)
        setTurnSynced(true)
      }
    }
  }, [contestantsData?.data, user?.contestant_id, isEliminated, currentTurn, turnSynced])

  const getContestantInfo = (id: number) => {
    const allContestant = contestantsData?.data?.find((contestant) => contestant.id === id)
    return allContestant
  }

  // Updated TurnIndicator component to show miss flip status
  const TurnIndicator = () => {
    if (gameEnded) return null

    // Only show turn indicator, no timer here
    return (
      <div className="">
        <div
          className={cn(
            "mt-2 p-2 rounded-lg text-center",
            isMyTurn
              ? "bg-green-600 bg-opacity-20 border border-green-400"
              : "bg-red-600 bg-opacity-20 border border-red-400",
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", isMyTurn ? "bg-green-400" : "bg-red-400")}></div>
            <span className={cn("font-gilroyBold text-sm", isMyTurn ? "text-green-400" : "text-red-400")}>
              {missFlipState.active && missFlipState.contestantId
                ? `${missFlipState.contestantId === user?.contestant_id ? "Your" : `${otherContestantName}'s`} Extra Turn ${3 - missFlipState.turnsRemaining}/2`
                : isMyTurn
                  ? "Your turn to flip"
                  : `${otherContestantName}'s turn`}
            </span>
            <div className={cn("w-3 h-3 rounded-full", isMyTurn ? "bg-green-400" : "bg-red-400")}></div>
          </div>
        </div>
      </div>
    )
  }

  // Global Timer Component - only show for current player
  const GlobalTimer = () => {
    if (!globalTimer.show || globalTimer.value <= 0) return null

    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black  flex items-center justify-center !z-[99999999999999999999]">
          <motion.div
            // initial={{ scale: 0.5, opacity: 0 }}
            // animate={{ scale: 1, opacity: 1 }}
            // exit={{ scale: 0.5, opacity: 0 }}
            className="text-center p-8"
          >
            {globalTimer.nextPlayer && (
              <div className="text-green-400 text-2xl font-bold px-6 py-3 rounded-lg">
                {globalTimer.nextPlayer}'s turn next
              </div>
            )}
            <div className="text-[#04DA6A] text-9xl font-bold mb-4 drop-shadow-lg">{globalTimer.value}</div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  // Enhanced Card Reveal Modal Component matching the provided designs
  const CardRevealModal = ({
    cardType,
    amount,
    playerName,
    onClose,
  }: {
    cardType: string
    amount?: number
    playerName?: string
    onClose: () => void
  }) => {
    const getCardDisplay = () => {
      switch (cardType) {
        case CARD_TYPES.FIVE_K:
          return {
            title: "+₦5,000",
            Icon: <InstantCashout width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-green-500 to-green-700",
            cardBg: "bg-green-600",
          }
        case CARD_TYPES.TEN_K:
          return {
            title: "+₦10,000",
            Icon: <InstantCashout width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-green-500 to-green-700",
            cardBg: "bg-green-600",
          }
        case CARD_TYPES.TWENTY_K:
          return {
            title: "+₦20,000",
            Icon: <InstantCashout width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-green-500 to-green-700",
            cardBg: "bg-green-600",
          }
        case CARD_TYPES.MISS_FLIP:
          return {
            title: `${otherContestantName} gets 2 extra turns before your next turn`,
            Icon: <MissCardFlip width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
            cardBg: "bg-purple-600",
          }
        case CARD_TYPES.PASS:
          return {
            title: "🏆 PASS CARD! 🏆",
            Icon: <PassCard width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
            cardBg: "bg-yellow-400",
          }
        case CARD_TYPES.DUD:
        default:
          return {
            title: "DUD CARD",
            Icon: <DudCards width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
            cardBg: "bg-gray-500",
          }
      }
    }

    const cardDisplay = getCardDisplay()

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="text-center max-w-lg w-full mx-4"
        >
          {/* Top text for cash cards */}
          {(cardType.includes("K") ||
            cardType === CARD_TYPES.FIVE_K ||
            cardType === CARD_TYPES.TEN_K ||
            cardType === CARD_TYPES.TWENTY_K) && (
            <div className="text-green-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
          )}

          {/* Miss flip special text */}
          {cardType === CARD_TYPES.MISS_FLIP && (
            <div className="text-green-400 text-xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
          )}

          {/* Card container */}
          <div className="relative mb-8">
            <div className={`bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm `}>
              <div className="text-white text-4xl font-bold mb-2">{cardDisplay.Icon}</div>
            </div>
          </div>

          {/* Player name at bottom */}
          {playerName && (
            <div className="bg-red-800 text-white px-6 py-3 rounded-lg inline-block font-bold">{playerName}</div>
          )}

          {/* Countdown display */}
          {showCountdown && (
            <div className="mt-8">
              <div className="text-green-400 text-xl font-bold mb-4">{`${otherContestantName}'s turn to flip`}</div>
              <div className="text-green-400 text-8xl font-bold animate-pulse">{countdownValue}</div>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // Bonus Modal Component
  const BonusModal = () => {
    if (!showBonusModal || !bonusModalInfo) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="text-center max-w-lg w-full mx-4"
        >
          <div className="text-purple-400 text-3xl font-bold mb-6">🎯 BONUS FLIP!</div>
          <div className="relative mb-8">
            <div className="bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm">
              <BonusFlip width={300} height={300} />
            </div>
          </div>
          <div className="text-white text-xl font-bold mb-4">{bonusModalInfo.playerName} earned an extra flip!</div>
          <div className="bg-purple-800 text-white px-6 py-3 rounded-lg inline-block font-bold">
            {bonusModalInfo.playerName}
          </div>
        </motion.div>
      </div>
    )
  }

  const { mutate: handleCard } = useCardSelection()

  const sendCardSelection = async (index: number, type: string) => {
    if (!isConnected || !user?.contestant_id) {
      openErrorModalWithMessage("Not connected to game server")
      return
    }

    setIsSending(true)
    try {
      const payload = {
        event: "stage3_card_selection",
        payload: {
          game_episode: user?.game_episode,
          contestant_id: user?.contestant_id,
          contestant_name: user?.name,
          card_index: index,
          card_type: type,
        },
      }
      await sendMessage(payload, "stage3_card_selection")
      handleCard(
        {
          contestant_id: user?.contestant_id,
          game_episode: Number(user?.game_episode),
          pick: type?.toUpperCase(),
        },
        {
          onSuccess: () => {
            refetch()
          },
        },
      )
    } catch (error) {
      openErrorModalWithMessage("Failed to send selection")
    } finally {
      setIsSending(false)
    }
  }

  const handleCardClick = (index: number) => {
    // Prevent clicks when not allowed or when global timer is showing
    if (
      cards[index].revealed ||
      gameEnded ||
      passFound ||
      isSending ||
      flippingCards?.length > 0 ||
      !isMyTurn ||
      globalTimer.show ||
      missFlipState.showTimer
    ) {
      return
    }

    setFlippingCards([index])
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    const clickedCard = cards[index]

    // Apply the reveal after animation delay
    setTimeout(() => {
      let finalCardType = clickedCard.originalType

      if (newAttempts <= 10) {
        if (finalCardType === "PASS") {
          finalCardType = "DUD"
        }
      } else if (newAttempts >= 10) {
        // CARD_TYPES
        Math.random() < 0.5 ? (finalCardType = CARD_TYPES.PASS) : finalCardType
      } else if (newAttempts > 20) {
        finalCardType = CARD_TYPES.PASS
      }

      const newCards = [...cards]
      newCards[index] = {
        ...newCards[index],
        revealed: true,
        type: finalCardType,
        contestant_id: user?.contestant_id || null,
        style:
          finalCardType === CARD_TYPES.PASS
            ? PASS_CARD_STYLE
            : finalCardType === CARD_TYPES.FIVE_K
              ? INSTANT_CASH_STYLES.FIVE_K
              : finalCardType === CARD_TYPES.TEN_K
                ? INSTANT_CASH_STYLES.TEN_K
                : finalCardType === CARD_TYPES.TWENTY_K
                  ? INSTANT_CASH_STYLES.TWENTY_K
                  : newCards[index].style,
      }

      setCards(newCards)
      setFlippingCards([])
      setRecentlyUpdated([index])

      // Handle different card types based on FINAL type
      switch (finalCardType) {
        case CARD_TYPES.FIVE_K:
        case CARD_TYPES.TEN_K:
        case CARD_TYPES.TWENTY_K:
          console.log(`💰 Instant cash revealed: ${finalCardType}`)
          const cashAmount = getCashAmount(finalCardType)
          setLastCashWon(cashAmount)
          // Only show cash modal for current player
          setShowCashModal(true)
          setTimeout(() => {
            setShowCashModal(false)
            // Check if we're in miss flip sequence
            if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
              handleMissFlipTurnComplete()
            } else {
              // Quick turn switch without waiting modal
              setCurrentTurn(otherContestantId)
              setIsMyTurn(false)
              broadcastTurnChange(otherContestantId!)
              // Show brief timer only for next player
              startGlobalTimer(1, "Your turn!", otherContestantName)
            }
          }, 1500) // Shorter display time
          sendCardSelection(index, finalCardType)
          break

        case CARD_TYPES.DUD:
          console.log(`💀 DUD revealed, switching turns`)
          // Check if we're in miss flip sequence
          if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
            handleMissFlipTurnComplete()
          } else {
            // Immediate turn switch
            setCurrentTurn(otherContestantId)
            setIsMyTurn(false)
            broadcastTurnChange(otherContestantId!)
            // Show brief timer only for next player
            startGlobalTimer(1, "Your turn!", otherContestantName)
          }
          sendCardSelection(index, finalCardType)
          break

        case CARD_TYPES.BONUS_FLIP:
          console.log(`🎯 Bonus flip revealed! Player gets 1 extra flip`)
          // Show modal and start timer
          setBonusModalInfo({
            playerName: user?.name || "You",
            cardIndex: index,
          })
          setShowBonusModal(true)
          startBonusCardTimer(index)

          // Hide modal after 3 seconds
          setTimeout(() => {
            setShowBonusModal(false)
          }, 3000)

          // Show notification
          setBonusFlipNotification({
            show: true,
            playerName: user?.name || "You",
            isCurrentUser: true,
          })

          // Hide notification after 3 seconds
          setTimeout(() => {
            setBonusFlipNotification({
              show: false,
              playerName: "",
              isCurrentUser: false,
            })
          }, 3000)

          // IMPORTANT: Keep the turn with current player - they get 1 more flip
          sendCardSelection(index, finalCardType)
          break

        case CARD_TYPES.MISS_FLIP:
          console.log(`❌ Miss flip revealed! Opponent gets 2 separate turns`)
          setRevealedCardInfo({
            type: finalCardType,
            index,
            playerName: user?.name || "You",
          })
          setShowCardRevealModal(true)

          // Show card for 3 seconds, then start miss flip sequence
          setTimeout(() => {
            setShowCardRevealModal(false)
            startGlobalTimer(3, `${otherContestantName} gets 2 extra turns!`, otherContestantName)
            setTimeout(() => {
              if (otherContestantId) {
                startMissFlipSequence(otherContestantId)
              }
            }, 3100) // Slightly longer than timer
          }, 3000)
          sendCardSelection(index, finalCardType)
          break

        case CARD_TYPES.PASS:
          console.log(`🏆 PASS card found! Game winner!`)
          setRevealedCardInfo({
            type: finalCardType,
            index,
            playerName: user?.name || "You",
          })
          setShowCardRevealModal(true)

          // Show PASS card for 5 seconds before showing winner modal
          setTimeout(() => {
            setShowCardRevealModal(false)
            setPassFinderName(user?.name || "You")
            setPassFinderIsCurrentUser(true)
            setPassFound(true)
            setGameEnded(true)
          }, 5000)
          sendCardSelection(index, finalCardType)
          break

        default:
          console.log(`❓ Unknown card type: ${finalCardType}`)
          // Check if we're in miss flip sequence
          if (missFlipState.active && missFlipState.contestantId === user?.contestant_id) {
            handleMissFlipTurnComplete()
          } else {
            setCurrentTurn(otherContestantId)
            setIsMyTurn(false)
            broadcastTurnChange(otherContestantId!)
          }
          sendCardSelection(index, finalCardType)
      }

      refetch()
      // Clear recent update highlight
      setTimeout(() => setRecentlyUpdated([]), 1000)
    }, 600)
  }

  // Check if game should end (PASS found or all valuable cards found)
  useEffect(() => {
    const revealedCards = cards.filter((card) => card.revealed)
    const unrevealedCards = cards.filter((card) => !card.revealed)

    // Game ends if PASS is found
    if (passFound) {
      console.log(`🏁 Game ended - PASS card found`)
      setGameEnded(true)
      return
    }

    // Or if all cards are revealed and no PASS found (shouldn't happen)
    if (unrevealedCards.length === 0 && !passFound) {
      console.log(`🚨 All cards revealed but no PASS found - this shouldn't happen!`)
      setGameEnded(true)
    }
  }, [cards, passFound])

  // MQTT message handler with timer synchronization and turn sync
  useEffect(() => {
    if (!isConnected) return

    const handleMQTTMessage = (receivedMessage: any) => {
      // Handle turn synchronization messages
      if (receivedMessage?.event === "stage3_turn_change") {
        const { current_turn } = receivedMessage.payload
        console.log(`🔄 Received turn sync: ${current_turn}`)

        // Only update if the turn is different from current
        if (current_turn !== currentTurn) {
          setCurrentTurn(current_turn)
          setIsMyTurn(current_turn === user?.contestant_id)
          setTurnSynced(true)
        }
        return
      }

      // Handle timer synchronization messages
      if (receivedMessage?.event === "stage3_timer_sync") {
        const { action, timer, timerId } = receivedMessage.payload
        if (action === "start" && timer) {
          // Start the timer locally for synchronization
          startLocalTimerInterval(timer)
        } else if (action === "stop" && timerId) {
          // Stop the timer locally
          const interval = timerIntervalsRef.current.get(timerId)
          if (interval) {
            clearInterval(interval)
            timerIntervalsRef.current.delete(timerId)
          }
          syncedTimersRef.current.delete(timerId)
        }
        return
      }

      // Handle card selection messages
      if (receivedMessage?.event === "stage3_card_selection") {
        const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload
        if (contestant_id === user?.contestant_id) return

        setFlippingCards((prev) => [...prev, card_index])

        setTimeout(() => {
          setCards((prevCards) => {
            const newCards = [...prevCards]
            const finalCardType = card_type
            console.log(`📡 MQTT: Card ${card_index} revealed as ${card_type}`)

            newCards[card_index] = {
              ...newCards[card_index],
              revealed: true,
              type: finalCardType,
              contestant_id: contestant_id,
              style:
                finalCardType === CARD_TYPES.PASS
                  ? PASS_CARD_STYLE
                  : finalCardType === CARD_TYPES.FIVE_K
                    ? INSTANT_CASH_STYLES.FIVE_K
                    : finalCardType === CARD_TYPES.TEN_K
                      ? INSTANT_CASH_STYLES.TEN_K
                      : finalCardType === CARD_TYPES.TWENTY_K
                        ? INSTANT_CASH_STYLES.TWENTY_K
                        : newCards[card_index].style,
            }
            return newCards
          })

          console.log(`📡 MQTT: Opponent revealed card ${card_index} as ${card_type}`)

          // Handle opponent's card reveal based on the received card type
          switch (card_type) {
            case CARD_TYPES.FIVE_K:
            case CARD_TYPES.TEN_K:
            case CARD_TYPES.TWENTY_K:
              console.log(`💰 Opponent got instant cash: ${card_type}`)
              // Check if opponent is in miss flip sequence
              if (missFlipState.active && missFlipState.contestantId === contestant_id) {
                setTimeout(() => {
                  handleMissFlipTurnComplete()
                }, 1000)
              } else {
                // Quick turn switch to current player
                setCurrentTurn(user?.contestant_id || null)
                setIsMyTurn(true)
                broadcastTurnChange(user?.contestant_id!)
                // Show brief timer for current player
                startGlobalTimer(1, "Your turn!", user?.name || "You")
              }
              break

            case CARD_TYPES.DUD:
              console.log(`💀 Opponent revealed ${card_type}`)
              // Check if opponent is in miss flip sequence
              if (missFlipState.active && missFlipState.contestantId === contestant_id) {
                setTimeout(() => {
                  handleMissFlipTurnComplete()
                }, 1000)
              } else {
                // Quick turn switch to current player
                setCurrentTurn(user?.contestant_id || null)
                setIsMyTurn(true)
                broadcastTurnChange(user?.contestant_id!)
                // Show brief timer for current player
                startGlobalTimer(1, "Your turn!", user?.name || "You")
              }
              break

            case CARD_TYPES.BONUS_FLIP:
              console.log(`🎯 Opponent got bonus flip, they get 1 extra flip`)
              // No modal needed, opponent keeps their turn
              break

            case CARD_TYPES.MISS_FLIP:
              console.log(`❌ Opponent hit miss flip, I get 2 extra flips`)
              if (user?.contestant_id) {
                startMissFlipSequence(user.contestant_id)
                // Show brief timer for current player
                startGlobalTimer(1, "You get 2 extra turns!", user?.name || "You")
              }
              break

            case CARD_TYPES.PASS:
              console.log(`🏆 Opponent found PASS card!`)
              const finderName = contestant_name || getContestantName(contestant_id)?.name
              setPassFinderName(finderName)
              setPassFinderIsCurrentUser(false)
              setPassFound(true)
              setGameEnded(true)
              break

            default:
              console.log(`❓ Unknown card type from opponent: ${card_type}`)
              // Check if opponent is in miss flip sequence
              if (missFlipState.active && missFlipState.contestantId === contestant_id) {
                setTimeout(() => {
                  handleMissFlipTurnComplete()
                }, 1000)
              } else {
                setCurrentTurn(user?.contestant_id || null)
                setIsMyTurn(true)
                broadcastTurnChange(user?.contestant_id!)
              }
          }

          setFlippingCards((prev) => prev.filter((idx) => idx !== card_index))
          setRecentlyUpdated([card_index])
          setTimeout(() => setRecentlyUpdated([]), 1000)
          refetch()
        }, 600)
      }
    }

    if (isConnected) {
      addMessageListener(handleMQTTMessage)
    }

    return () => {
      removeMessageListener(handleMQTTMessage)
    }
  }, [
    isConnected,
    addMessageListener,
    removeMessageListener,
    user?.contestant_id,
    refetch,
    otherContestantId,
    otherContestantName,
    missFlipState,
    currentTurn,
  ])

  // Render different card types
  const renderCard = (card: Card, index: number) => {
    if (!card.revealed) {
      return (
        <PickCardContainer
          backgroundColor={"transparent"}
          text={React.createElement(cardIcons[index % 3], {
            className: "w-[103px]",
          })}
          textColor={card.style.textColor}
          fontFamily={card.style.fontFamily}
          containerLabel=""
          className={cn(
            "transition-transform w-full h-full duration-300 ease-in-out p-0",
            recentlyUpdated.includes(index) ? "ring-2 ring-white" : "",
            flippingCards.includes(index) ? "shadow-md" : "",
          )}
          textClassName="font-bold text-[1.2rem]"
          labelClassName="hidden"
        />
      )
    }

    // Render revealed cards based on type
    const cardElement = (() => {
      switch (card.type) {
        case CARD_TYPES.DUD:
          return <DudCards className="w-[90px] h-full" />
        case CARD_TYPES.FIVE_K:
        case CARD_TYPES.TEN_K:
        case CARD_TYPES.TWENTY_K:
          return <InstantCashout className="w-[90px] h-full" />
        case CARD_TYPES.BONUS_FLIP:
          return <BonusFlip className="w-[90px] h-full" />
        case CARD_TYPES.MISS_FLIP:
          return <MissCardFlip className="w-[90px] h-full" />
        case CARD_TYPES.PASS:
          return <PassCard className="w-[90px]" />
        default:
          return <DudCards className="w-[90px] h-full" />
      }
    })()

    return cardElement
  }

  // Show elimination modal if user is eliminated
  if (isEliminated) {
    return (
      <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
        <EliminatedModal
          setShowEliminationModal={() => setIsEliminated(true)}
          showEliminationModal={true}
          balance={Number(getContestantInfo(Number(user?.contestant_id))?.actual_balance)}
          image_url={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
        />
      </div>
    )
  }

  const BonusFlipNotification = () => {
    if (!bonusFlipNotification.show) return null

    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-400"
        >
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-lg">🎯 BONUS FLIP!</div>
            <div className="text-sm">
              {bonusFlipNotification.isCurrentUser
                ? "You can flip again!"
                : `${bonusFlipNotification.playerName} can flip again!`}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo />
          </div>
          <div>
            <HustleStages activeStage={3} />
          </div>
          <div className="pb-4">
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col justify-between items-center min-h-full">
          <div className="flex flex-col w-full items-center">
            <div className="w-full h-[100px] flex items-center justify-center">
              <HeaderTitleContainer
                backgroundColor="#791192"
                color="#ed99ff"
                text="Pick-Pad"
                textGradientEnd="#8E17AA"
                textGradientStart="#8E17AA"
                borderGradientStart="#f712fc"
                borderGradientEnd="#e051fe"
                fontSize={45}
                fontFamily="Verdana"
                textStrokeColor="#a219c1"
                textStrokeWidth={4.4}
              />
            </div>

            <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[65rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
                  transition={{
                    duration: 4,
                    ease: "linear",
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              </div>

              {/* Content container */}
              <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
              <div className="relative">
                <div className="flex justify-between items-center">
                  <div className="flex justify-between items-center flex-col w-full">
                    <GlowyStrokeText
                      strokeWidth={2}
                      strokeColor="#D91FFF"
                      glowColor="#13051E"
                      glowIntensity="low"
                      textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
                      fillColor="#000"
                    >
                      Stage 3: Card Collection Showdown
                    </GlowyStrokeText>
                  </div>
                </div>

                <div className="text-white flex justify-center items-center gap-5">
                  {/* New Turn Indicator - placed between header and cards */}
                  {!passFound && <TurnIndicator />}
                </div>

                {isLoadingContestants ? (
                  <div className="flex justify-center items-center h-full w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-6 justify-center gap-4">
                    {cards.map((card, index) => {
                      const isFlipping = flippingCards.includes(index)
                      const isRecentlyUpdated = recentlyUpdated.includes(index)

                      let displayName = ""
                      if (card.revealed && card.contestant_id) {
                        displayName = getContestantName(card.contestant_id)?.name
                      }

                      return (
                        <div
                          key={index}
                          onClick={() => handleCardClick(index)}
                          className={cn(
                            "relative transition-transform h-[90px]",
                            card.revealed
                              ? "cursor-default pointer-events-none opacity-70"
                              : isMyTurn && !globalTimer.show && !missFlipState.showTimer
                                ? "cursor-pointer hover:scale-105"
                                : "cursor-not-allowed opacity-80",
                            isSending || flippingCards.length > 0 || globalTimer?.show || missFlipState.showTimer
                              ? "cursor-wait pointer-events-none"
                              : "",
                            isRecentlyUpdated ? "animate-pulse" : "",
                          )}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
                              initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
                              animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              style={{
                                transformStyle: "preserve-3d",
                                backfaceVisibility: "hidden",
                              }}
                              className="relative"
                            >
                              <div className="relative">
                                {card.revealed && (
                                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
                                    <span className="font-bold text-black text-xs bg-white px-2 py-1 rounded">
                                      {displayName?.split(" ")[0]}
                                    </span>
                                  </div>
                                )}
                                <div className="relative w-full h-full">{renderCard(card, index)}</div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} />
        </div>

        {/* Global Timer */}
        <GlobalTimer />

        {/* Winner/Runner-up Modals */}
        {passFound && passFinderIsCurrentUser && (
          <StageThreeWinnerModal
            name={passFinderName}
            balance={String(getContestantInfo(Number(user?.contestant_id))?.actual_balance ?? 0)}
            imgUrl={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
          />
        )}

        {passFound && !passFinderIsCurrentUser && (
          <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
            <EliminatedModal
              setShowEliminationModal={() => setIsEliminated(true)}
              showEliminationModal={true}
              balance={Number(getContestantInfo(Number(user?.contestant_id))?.actual_balance)}
              image_url={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ?? "/")}
            />
          </div>
        )}

        {/* Enhanced Card Reveal Modal */}
        {showCardRevealModal && revealedCardInfo && (
          <CardRevealModal
            cardType={revealedCardInfo.type}
            amount={revealedCardInfo.amount}
            playerName={revealedCardInfo.playerName}
            onClose={() => {
              setShowCardRevealModal(false)
              setShowCountdown(false)
            }}
          />
        )}

        <BonusFlipNotification />

        {/* Bonus Modal */}
        <BonusModal />
      </div>
    </>
  )
}

export default Stage3CardSelection
