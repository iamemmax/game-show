// import Logo from "@/app/icons/Logo";
// import HeaderTitleContainer from "@/app/shared/HeaderContainer";
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
// import { GlowyStrokeText, Button } from "@/components/core";
// import { cn } from "@/utils/classNames";
// import { motion, AnimatePresence } from "framer-motion";
// import React, { useState, useEffect } from "react";
// import { useMQTT } from "@/hooks/useMqttService";
// import PickCardContainer from "@/app/shared/PickCardContainer";
// import { useGetGameContestants } from "@/app/admin/misc/api";
// import { Card, CARD_STYLES, PASS_CARD_STYLE } from "./CardStyles";
// import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
// import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
// import { useParams } from "next/navigation";
// import StageThreeWinnerModal from "@/app/components/stages/components/StageThreeWinnerModal";
// import HustleBoardStageTallyPage from "../HustleBoardStageTally";
// import PickCard1 from "@/app/icons/cards/PickCard1";
// import PickCard2 from "@/app/icons/cards/PickCard2";
// import PickCard3 from "@/app/icons/cards/PickCard3";
// import PassCard from "@/app/icons/cards/PassCard";
// import DudCards from "@/app/icons/cards/DudCard";
// import VersusIcon from "@/app/icons/Versus";

// interface prop {
//   onNext: () => void
// }
// const Stage3CardSelectionScreens = () => {
//   const { isConnected, addMessageListener, removeMessageListener } = useMQTT();
//   const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number, name: string }>>([]);

//   const MIN_CARDS_BEFORE_PASS = 10;

//   const CARD_TYPES = {
//     DUD: "DUD",
//     PASS: "PASS"
//   };

//   // Create cards with guaranteed one PASS card
//   const [cards, setCards] = useState<Card[]>(() => {
//     const cardArray = Array(23).fill(null).map(() => ({
//       type: CARD_TYPES.DUD,
//       originalType: CARD_TYPES.DUD,
//       revealed: false,
//       style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
//       contestant_id: null
//     }));

//     const passIndex = Math.floor(Math.random() * 24);
//     const passCard = {
//       type: CARD_TYPES.PASS,
//       originalType: CARD_TYPES.PASS,
//       revealed: false,
//       style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
//       contestant_id: null
//     };

//     cardArray.splice(passIndex, 0, passCard);
//     if (cardArray.length > 24) cardArray.length = 24;

//     return cardArray;
//   });
//   const params = useParams()
//   const [passFound, setPassFound] = useState(false);
//   const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([]);
//   const [flippingCards, setFlippingCards] = useState<number[]>([]);
//   const [contestantNames, setContestantNames] = useState<Record<number, string>>({});
//   const [passFinderName, setPassFinderName] = useState<string>("");
//   const [passFinderId, setPassFinderId] = useState<string>("");
//   const [passCardIndex, setPassCardIndex] = useState<number>(-1);
//   const [currentTurn, setCurrentTurn] = useState<number | null>(null);
//   const [currentTurnName, setCurrentTurnName] = useState<string>("");
//   const [showStageResult, setShowStageResult] = useState(false);
//   const cardIcons = [PickCard1, PickCard2, PickCard3];

//   const { data: contestantsData, isLoading: isLoadingContestants, refetch } = useGetGameContestants(Number(params?.episodeId));
//   // Helper function to get contestant name by ID

//   const getContestantName = (contestantId: number): string => {
//     // First try to find in contestantsData (most up-to-date)
//     if (contestantsData?.data) {
//       const contestant = contestantsData.data.find((c: any) => c.id === contestantId);
//       if (contestant?.name) {
//         return contestant.name;
//       }
//     }

//     // Then try the contestantNames map (cached data)
//     if (contestantNames[contestantId]) {
//       return contestantNames[contestantId];
//     }

//     // Only use fallback if no name is found anywhere
//     return `Contestant ${contestantId}`;
//   };
//   const getContestantInfo = (id: number) => {
//     const allconstestant = contestantsData?.data?.find(
//       (contestant) => contestant.id === id
//     );
//     return allconstestant;
//   };

//   // Set remaining contestants and contestant names
//   useEffect(() => {
//     if (!contestantsData?.data) return;

//     // Get remaining contestants (not eliminated)
    // const remaining = contestantsData.data
    //   .filter((contestant: any) =>
    //     contestant.eliminated_stage === null && !contestant.is_eliminated
    //   )
    //   .map((contestant: any) => ({
    //     id: contestant.id,
    //     name: contestant?.name || `Contestant ${contestant.id}`
    //   }));

    // setRemainingContestants(remaining);

//     // Create contestant names map
//     const namesMap: Record<number, string> = {};
//     contestantsData.data.forEach((contestant: any) => {
//       if (contestant.id && contestant.name) {
//         namesMap[contestant.id] = contestant.name;
//       }
//     });
//     setContestantNames(namesMap);

//   }, [contestantsData?.data]);

//   // Update current turn name when current turn changes
//   useEffect(() => {
//     if (currentTurn) {
//       setCurrentTurnName(getContestantName(currentTurn));
//     }
//   }, [currentTurn, contestantNames, contestantsData?.data]);



// const TurnIndicator = () => {
//    if (passFound || remainingContestants.length !== 2) return null;
//   return (
//     <div className="flex items-center justify-center gap-6 p-4">
//       {/* Main container with contestants */}
//       <div className="flex items-center w-full">
//         {remainingContestants?.map((contestant, index) => (
//           <React.Fragment key={contestant.id}>
//             {/* Contestant card */}
//             <div className={`
//               flex items-center border-[0.5px] border-opacity-70 bg-transparent justify-center gap-4 px-4 py-3 rounded-lg 
//               ${currentTurn === contestant?.id 
//                 ? ' border-[#04DA6A]' 
//                 : ' border-[#EB001B]'
//               }
//             `}>
//               <div className="flex items-center gap-6">
//                 <span className={`
//                   font-bold text-xl capitalize tracking-wide
//                   ${currentTurn === contestant.id ? 'text-white' : 'text-gray-300'}
//                 `}>
//                   {contestant.name?.split(" ")[0]}
//                 </span>
//                 {currentTurn === contestant.id && (
//                   <div className="flex items-center gap-3 bg-[#053F20] py-[7px] px-4 rounded-xl border border-[#04DA6A]">
//                     <span className="text-xl font-semibold font-verdana text-[#04DA6A]">Your turn</span>
//                     <div className="w-3 h-3 rounded-full bg-[#04DA6A] animate-pulse"></div>
//                   </div>
//                 )}
//                 {currentTurn !== contestant.id && (
//                   <div className="flex items-center gap-3 bg-[#38040A] py-[7px] px-4 rounded-xl">
//                     <span className="text-xl font-semibold font-verdana text-[#FF495E]">Waiting</span>
//                     <div className="w-3 h-3 rounded-full bg-[#FF495E]"></div>
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* VS indicator between contestants */}
//             {index === 0 && (
//              <div className="px-6"> <VersusIcon/></div>
//             )}
//           </React.Fragment>
//         ))}
//       </div>
//     </div>
//   );
// };

  
//   const CelebrationAnimation = ({ isVisible, finderName }: { isVisible: boolean, finderName?: string }) => {
//     if (!isVisible) return null;

//     return (
//       <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
//         {/* Ribbons falling from top */}
//         <div className="absolute inset-0 !z-[999999999999999999]">
//           {Array.from({ length: 40 }).map((_, i) => {
//             const width = Math.random() * 8 + 4;
//             const height = Math.random() * 200 + 100;
//             const color = ["#FFD700", "#FF6B6B", "#4ECDC4", "#FF8C42", "#A78BFA", "#34D399", "#F472B6"][
//               Math.floor(Math.random() * 7)
//             ];
//             const startX = Math.random() * 100;
//             const waveAmplitude = Math.random() * 100 + 50;
//             const waveSpeed = Math.random() * 2 + 1;

//             return (
//               <motion.div
//                 key={i}
//                 className="absolute rounded-sm"
//                 style={{
//                   width: `${width}px`,
//                   height: `${height}px`,
//                   backgroundColor: color,
//                   top: `-${height}px`,
//                   left: `${startX}%`,
//                   transformOrigin: "top center",
//                 }}
//                 initial={{ y: -height, rotate: 0, scaleY: 1 }}
//                 animate={{
//                   y: `${window.innerHeight + height}px`,
//                   rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
//                   x: [0, waveAmplitude, -waveAmplitude, waveAmplitude / 2, -waveAmplitude / 2, 0],
//                   scaleY: [1, 0.9, 1.1, 0.95, 1.05, 1]
//                 }}
//                 transition={{
//                   duration: Math.random() * 5 + 5,
//                   ease: "linear",
//                   repeat: Infinity,
//                   delay: Math.random() * 5,
//                   x: { duration: waveSpeed * 5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
//                   scaleY: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }
//                 }}
//               />
//             );
//           })}
//         </div>

//         {/* Celebration content */}
//       <StageThreeWinnerModal name={passFinderName} balance={String(getContestantInfo(Number(passFinderId))?.actual_balance ??0)} imgUrl={String(getContestantInfo(Number(passFinderId))?.contestant_photo_url ??"/")}/>
     
//       </div>
//     );
//   };

//   // MQTT message handler - Listen only
//   useEffect(() => {
//     if (!isConnected) return;

//     const handleMQTTMessage = (receivedMessage: any) => {
//       if (receivedMessage?.event === "stage3_card_selection") {
//         const { contestant_id, card_index, card_type: originalCardType, contestant_name } = receivedMessage.payload;

//         setFlippingCards(prev => [...prev, card_index]);

//         const revealedCount = cards.filter(card => card.revealed).length;
//         let card_type = originalCardType;

//         if (originalCardType === CARD_TYPES.PASS && revealedCount < MIN_CARDS_BEFORE_PASS - 1) {
//           card_type = CARD_TYPES.DUD;
//         }

//         setTimeout(() => {
//           setCards(prevCards => {
//             const newCards = [...prevCards];
//             newCards[card_index] = {
//               ...newCards[card_index],
//               revealed: true,
//               type: card_type,
//               contestant_id: contestant_id,
//               style: card_type === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style
//             };
//             return newCards;
//           });

//           if (card_type === CARD_TYPES.PASS) {
//             setPassCardIndex(card_index);

//             const finderName = contestant_name || getContestantName(contestant_id);
//             const finderId = contestant_id || getContestantName(contestant_id);
//             setPassFinderName(finderName);
//             setPassFinderId(finderId);
//             setTimeout(() => setPassFound(true), 300);
//             refetch()
//           } else {
//             // Update turn to next contestant
//             const nextContestant = remainingContestants.find(c => c.id !== contestant_id);
//             if (nextContestant) {
//               setCurrentTurn(nextContestant.id);
//             }
//           }
//         setFlippingCards(prev => prev.filter(idx => idx !== card_index));
//           setRecentlyUpdated([card_index]);
//           setTimeout(() => setRecentlyUpdated([]), 1000);
//         }, 600);
//       }
//       if (receivedMessage?.event === "game_s3_results_reveal") {
//         console.log("✅ Processing game_s3_results_reveal");
//         setShowStageResult(true);
//       }
//     };

//     if (isConnected) {
//       addMessageListener(handleMQTTMessage);
//     }

//     return () => {
//       removeMessageListener(handleMQTTMessage);
//     };
//   }, [isConnected, addMessageListener, removeMessageListener, cards, remainingContestants, contestantNames, contestantsData?.data]);

//   // Initialize turn system
//   useEffect(() => {
//     if (remainingContestants.length === 2 && !passFound) {
//       // Lower contestant ID goes first
//       const firstTurnId = Math.min(remainingContestants[0].id, remainingContestants[1].id);
//       setCurrentTurn(firstTurnId);
//     }
//   }, [remainingContestants, passFound]);


//   if (showStageResult) {
//     return (
//       <HustleBoardStageTallyPage
//         eliminationCount={5}
//         removeCount={2}
//         title="stage 3"
//         activeState={3}
//       />
//     );
//   }

//   return (
//     <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
//       {/* Left Sidebar */}
//       <div className="flex flex-col justify-between">
//         <div className="flex justify-center items-center h-3.5 w-full mt-8">
//           <Logo />
//         </div>
//         <div>
//           <HustleStages activeStage={3} />
//         </div>
//         <div className="pb-4">
//           <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
//         </div>
//       </div>

//       {/* Center Content */}
//       <div className="flex flex-col justify-between items-center min-h-full">
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

//           <div className="relative w-full py-[2rem] 2xl:py-[2.5rem]  px-6 -mt-3 rounded-[.875rem] 2xl:px-[2rem] overflow-hidden">
//             {/* Animated border */}
//             <div className="absolute inset-0">
//               <motion.div
//                 className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
//                 style={{
//                   background: `conic-gradient(from 0deg at 50% 50%,
//                       #d91fff 0deg,
//                       #d91fff 120deg,
//                       #00ffff 100deg,
//                       #00ffff 240deg,
//                       #FFD700 220deg,
//                       #FFD700 360deg,
//                       #d91fff 340deg
//                     )`,
//                 }}
//                 animate={{ rotate: [0, 360] }}
//                 transition={{ duration: 4, ease: "linear", repeat: Infinity }}
//               />
//             </div>

//             {/* Content container */}
//             <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
//             <div className="relative">
//               <div className="flex justify-between items-center">
//                 <div className="flex justify-between items-center flex-col w-full">
//                   <GlowyStrokeText
//                     strokeWidth={2}
//                     strokeColor="#D91FFF"
//                     glowColor="#13051E"
//                     glowIntensity="low"
//                     textclassName="text-[2.125rem] font-extrabold font-lucky"
//                     fillColor="#000"
//                   >
//                     Stage 3: Showdown for pass
//                   </GlowyStrokeText>

//                   <div className="text-white flex justify-center items-center  flex-col">
//                     <span className="font-gilroyBold text-[#D5B9FF] text-sm">
//                       Watch as contestants select business elements for their hustle
//                     </span>

//                     {/* Turn Indicator */}
//                     <TurnIndicator />
//                   </div>
//                 </div>
//               </div>
 
//               {isLoadingContestants ? (
//                 <div className="flex justify-center items-center h-full w-full">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//                 </div>
//               ) : (
//                 <>
       

// <div className="grid grid-cols-6 gap-y-3 justify-center items-center">
//   {cards.map((card, index) => {
//     const isFlipping = flippingCards.includes(index);
//     const style =
//       card.revealed && card.type === CARD_TYPES.PASS
//         ? PASS_CARD_STYLE
//         : card.style;
//     const isRecentlyUpdated = recentlyUpdated.includes(index);
//     const isRevealedPass = card.revealed && card.type === CARD_TYPES.PASS;

//     let displayName = "";
//     if (card.revealed && card.contestant_id) {
//       displayName = getContestantName(card.contestant_id);
//     }

//     return (
//       <div
//         key={index}
//         className={cn(
//           "relative pointer-events-none transition-transform h-[140px]",
//           card.revealed ? "opacity-70" : "opacity-100",
//           isRecentlyUpdated ? "animate-pulse" : "",
//           isRevealedPass ? "z-10 opacity-100" : ""
//         )}
//         style={{ perspective: "1000px" }}
//       >
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
//             initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
//             animate={
//               isFlipping
//                 ? { rotateY: 180, opacity: 0 }
//                 : { rotateY: 0, opacity: 1 }
//             }
//             transition={{
//               duration: isRevealedPass ? 0.5 : 0.3,
//               ease: "easeInOut",
//             }}
//             style={{
//               transformStyle: "preserve-3d",
//               backfaceVisibility: "hidden",
//             }}
//             className="relative w-full h-full"
//           >
//             <div className="relative w-full h-full">
//               {/* Display contestant name */}
//               {card.revealed && (
//                 <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
//                   <span className="font-bold text-black text-sm bg-white px-2 py-1 rounded">
//                     {displayName?.split(" ")[0]}
//                   </span>
//                 </div>
//               )}

//               {/* Render revealed card OR default card */}
//               {card.revealed ? (
//                 card.type === CARD_TYPES.DUD ? (
//                   <DudCards className="w-full h-full" />
//                 ) : (
//                   <PassCard className="w-full h-full" />
//                 )
//               ) : (
//                 <PickCardContainer
//                   backgroundColor={"transparent"}
                  // text={React.createElement(cardIcons[index % 3], {
                  //   className: "w-[120px] h-full",
                  // })}
//                   textColor={style.textColor}
//                   fontFamily={style.fontFamily}
//                   containerLabel=""
//                   className={cn(
//                     "transition-transform w-full h-full  duration-300 ease-in-out p-0",
//                     isRecentlyUpdated ? "ring-2 ring-white" : "",
//                     isFlipping ? "shadow-md" : "",
//                     isRevealedPass
//                       ? "ring-2 ring-yellow-400 shadow-md shadow-yellow-400/50"
//                       : ""
//                   )}
//                   textClassName="font-bold text-[1.2rem]"
//                   labelClassName="hidden"
//                 />
//               )}
//             </div>


//           </motion.div>
//         </AnimatePresence>
//       </div>
//     );
//   })}
// </div>




//                 </>
              
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Sidebar */}
//       <div className="flex flex-col">
//         <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} showStage3Reward={true} />
//         <div className="">


//         </div>
//       </div>

//       {/* Celebration Animation */}
//       <CelebrationAnimation
//         isVisible={passFound}
//         finderName={passFinderName}
//       />
//     </div>
//   );
// };

// export default Stage3CardSelectionScreens;



// "use client"

// import Logo from "@/app/icons/Logo"
// import HeaderTitleContainer from "@/app/shared/HeaderContainer"
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
// import { GlowyStrokeText } from "@/components/core"
// import { cn } from "@/utils/classNames"
// import { motion, AnimatePresence } from "framer-motion"
// import React, { useState, useEffect } from "react"
// import { useMQTT } from "@/hooks/useMqttService"
// import PickCardContainer from "@/app/shared/PickCardContainer"
// import { useGetGameContestants } from "@/app/admin/misc/api"
// import { type Card, CARD_STYLES } from "./CardStyles"
// import PickCard1 from "@/app/icons/cards/PickCard1"
// import PickCard2 from "@/app/icons/cards/PickCard2"
// import PickCard3 from "@/app/icons/cards/PickCard3"
// import DudCards from "@/app/icons/cards/DudCard"
// import VersusIcon from "@/app/icons/Versus"

// // Card components

// import PassCard from "@/app/icons/cards/PassCard"
// import { useParams } from "next/navigation"
// import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar"
// import HustleStages from "@/app/components/stages/components/hustle/HustleStages"
// import { CashCard5k, CashCard10k, CashCard20k, BonusFlipCard, MissFlipCard } from "@/app/components/stages/components/stage3/CardComponent"
// import StageThreeWinnerModal from "@/app/components/stages/components/StageThreeWinnerModal"

// const Stage3CardSelectionScreens = () => {
//   const { isConnected, addMessageListener, removeMessageListener } = useMQTT()
//   const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number; name: string }>>([])

//   const CARD_TYPES = {
//     DUD: "DUD",
//     CASH_5K: "CASH_5K",
//     CASH_10K: "CASH_10K",
//     CASH_20K: "CASH_20K",
//     BONUS_FLIP: "BONUS_FLIP",
//     MISS_FLIP: "MISS_FLIP",
//     PASS: "PASS",
//   }

//   // Updated card styles for new types with all required properties
//   const CASH_5K_STYLE = {
//     backgroundColor: "#004400",
//     rayColor: "#00FF00",
//     innerCircleColor: "#006600",
//     textColor: "#00FF00",
//     cornerColor: "#00AA00",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#002200",
//     textStrokeWidth: 1,
//     textStrokeColor: "#003300",
//   }

//   const CASH_10K_STYLE = {
//     backgroundColor: "#444400",
//     rayColor: "#FFD700",
//     innerCircleColor: "#666600",
//     textColor: "#FFD700",
//     cornerColor: "#AAAA00",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#222200",
//     textStrokeWidth: 1,
//     textStrokeColor: "#333300",
//   }

//   const CASH_20K_STYLE = {
//     backgroundColor: "#440000",
//     rayColor: "#FF6B35",
//     innerCircleColor: "#660000",
//     textColor: "#FF6B35",
//     cornerColor: "#AA0000",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#220000",
//     textStrokeWidth: 1,
//     textStrokeColor: "#330000",
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

//   // Add PASS card style
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

//   const [passFound, setPassFound] = useState(false)
//   const [passFinderName, setPassFinderName] = useState<string>("")
//   const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false)

//   // Create cards with new distribution: 12 DUD, 3 cash (5k,10k,20k), 3 bonus flip, 2 miss flip, 1 PASS = 21 total
//   const [cards, setCards] = useState<Card[]>(() => {
//     const cardArray: Card[] = []

//     // Add 12 DUD cards (reduced to make 21 total)
//     for (let i = 0; i < 12; i++) {
//       cardArray.push({
//         type: CARD_TYPES.DUD,
//         originalType: CARD_TYPES.DUD,
//         revealed: false,
//         style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
//         contestant_id: null,
//       })
//     }

//     // Add 3 instant cash cards (5k, 10k, 20k)
//     cardArray.push({
//       type: CARD_TYPES.CASH_5K,
//       originalType: CARD_TYPES.CASH_5K,
//       revealed: false,
//       style: CASH_5K_STYLE,
//       contestant_id: null,
//     })

//     cardArray.push({
//       type: CARD_TYPES.CASH_10K,
//       originalType: CARD_TYPES.CASH_10K,
//       revealed: false,
//       style: CASH_10K_STYLE,
//       contestant_id: null,
//     })

//     cardArray.push({
//       type: CARD_TYPES.CASH_20K,
//       originalType: CARD_TYPES.CASH_20K,
//       revealed: false,
//       style: CASH_20K_STYLE,
//       contestant_id: null,
//     })

//     // Add 3 bonus flip cards
//     for (let i = 0; i < 3; i++) {
//       cardArray.push({
//         type: CARD_TYPES.BONUS_FLIP,
//         originalType: CARD_TYPES.BONUS_FLIP,
//         revealed: false,
//         style: BONUS_FLIP_STYLE,
//         contestant_id: null,
//       })
//     }

//     // Add 2 miss flip cards
//     for (let i = 0; i < 2; i++) {
//       cardArray.push({
//         type: CARD_TYPES.MISS_FLIP,
//         originalType: CARD_TYPES.MISS_FLIP,
//         revealed: false,
//         style: MISS_FLIP_STYLE,
//         contestant_id: null,
//       })
//     }

//     // Add 1 PASS card
//     cardArray.push({
//       type: CARD_TYPES.PASS,
//       originalType: CARD_TYPES.PASS,
//       revealed: false,
//       style: PASS_CARD_STYLE,
//       contestant_id: null,
//     })

//     // Shuffle the array
//     for (let i = cardArray.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1))
//       ;[cardArray[i], cardArray[j]] = [cardArray[j], cardArray[i]]
//     }

//     console.log(`🎯 Cards created: ${cardArray.length} total`)
//     console.log(`DUD: ${cardArray.filter((c) => c.originalType === CARD_TYPES.DUD).length}`)
//     console.log(`Instant Cash cards: ${cardArray.filter((c) => c.originalType.includes("CASH")).length}`)
//     console.log(`Bonus flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.BONUS_FLIP).length}`)
//     console.log(`Miss flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.MISS_FLIP).length}`)
//     console.log(`PASS cards: ${cardArray.filter((c) => c.originalType === CARD_TYPES.PASS).length}`)

//     // Log where the PASS card is located
//     const passIndex = cardArray.findIndex((card) => card.originalType === CARD_TYPES.PASS)
//     console.log(`🎯 PASS card is at index: ${passIndex}`)

//     return cardArray
//   })

//   const [gameEnded, setGameEnded] = useState(false)
//   const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([])
//   const [flippingCards, setFlippingCards] = useState<number[]>([])
//   const [contestantNames, setContestantNames] = useState<Record<number, string>>({})
//   const [currentTurn, setCurrentTurn] = useState<number | null>(null)
//   const [otherContestantId, setOtherContestantId] = useState<number | null>(null)
//   const [otherContestantName, setOtherContestantName] = useState<string>("")
//   const [playerCash, setPlayerCash] = useState<Record<number, number>>({})

//   const params = useParams()
//   const {
//     data: contestantsData,
//     isLoading: isLoadingContestants,
//     refetch,
//   } = useGetGameContestants(Number(params?.episodeId))

//   const cardIcons = [PickCard1, PickCard2, PickCard3]

//   // Helper function to get contestant name by ID
//   const getContestantName = (contestantId: number): { name: string; balance?: string } => {
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

//   // Set remaining contestants and contestant names
//   useEffect(() => {
//     if (!contestantsData?.data) return

//     const remaining = contestantsData.data
//       .filter((contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated)
//       .map((contestant: any) => ({
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
//   }, [contestantsData?.data])

//   // Set up turn system for remaining contestants
//   useEffect(() => {
//     if (!contestantsData?.data) return

//     const showdownContestants = contestantsData.data.filter(
//       (contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated,
//     )

//     if (showdownContestants.length >= 2) {
//       const firstContestant = showdownContestants[0]
//       const secondContestant = showdownContestants[1]

//       setOtherContestantId(secondContestant.id)
//       setOtherContestantName(secondContestant.name as string)

//       // Lower contestant ID goes first
//       const firstTurnId = Math.min(firstContestant.id, secondContestant.id)
//       setCurrentTurn(firstTurnId)
//     }
//   }, [contestantsData?.data])

//   const getContestantInfo = (id: number) => {
//     const allContestant = contestantsData?.data?.find((contestant) => contestant.id === id)
//     return allContestant
//   }

//   // Update the TurnIndicator component to match your format:
//   const TurnIndicator = () => {
//     if (passFound || remainingContestants.length !== 2) return null

//     return (
//       <div className="flex items-center justify-center gap-6 p-4">
//         {/* Main container with contestants */}
//         <div className="flex items-center w-full">
//           {remainingContestants?.map((contestant, index) => (
//             <React.Fragment key={contestant.id}>
//               {/* Contestant card */}
//               <div
//                 className={`
//               flex items-center border-[0.5px] border-opacity-70 bg-transparent justify-center gap-4 px-4 py-3 rounded-lg 
//               ${currentTurn === contestant?.id ? " border-[#04DA6A]" : " border-[#EB001B]"}
//             `}
//               >
//                 <div className="flex items-center gap-6">
//                   <span
//                     className={`
//                   font-bold text-xl capitalize tracking-wide
//                   ${currentTurn === contestant.id ? "text-white" : "text-gray-300"}
//                 `}
//                   >
//                     {contestant.name?.split(" ")[0]}
//                   </span>
//                   {currentTurn === contestant.id && (
//                     <div className="flex items-center gap-3 bg-[#053F20] py-[7px] px-4 rounded-xl border border-[#04DA6A]">
//                       <span className="text-xl font-semibold font-verdana text-[#04DA6A]">Current turn</span>
//                       <div className="w-3 h-3 rounded-full bg-[#04DA6A] animate-pulse"></div>
//                     </div>
//                   )}
//                   {currentTurn !== contestant.id && (
//                     <div className="flex items-center gap-3 bg-[#38040A] py-[7px] px-4 rounded-xl">
//                       <span className="text-xl font-semibold font-verdana text-[#FF495E]">Waiting</span>
//                       <div className="w-3 h-3 rounded-full bg-[#FF495E]"></div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* VS indicator between contestants */}
//               {index === 0 && (
//                 <div className="px-6">
//                   <VersusIcon />
//                 </div>
//               )}
//             </React.Fragment>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   // MQTT message handler
//   useEffect(() => {
//     if (!isConnected) return

//     const handleMQTTMessage = (receivedMessage: any) => {
//       if (receivedMessage?.event === "stage3_card_selection") {
//         const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload

//         setFlippingCards((prev) => [...prev, card_index])

//         setTimeout(() => {
//           setCards((prevCards) => {
//             const newCards = [...prevCards]
//             // IMPORTANT: Set the card type to exactly what was sent via MQTT
//             newCards[card_index] = {
//               ...newCards[card_index],
//               revealed: true,
//               type: card_type, // Use the exact type from MQTT message
//               contestant_id: contestant_id,
//               style: card_type === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style,
//             }
//             return newCards
//           })

//           console.log(`📡 MQTT: ${contestant_name} revealed card ${card_index} as ${card_type}`)

//           // Handle card reveal based on the received card type
//           switch (card_type) {
//             case CARD_TYPES.DUD:
//               console.log(`💀 ${contestant_name} revealed DUD, switching turns`)
//               const nextContestantDud = remainingContestants.find((c) => c.id !== contestant_id)
//               if (nextContestantDud) {
//                 setCurrentTurn(nextContestantDud.id)
//               }
//               break

//             case CARD_TYPES.CASH_5K:
//             case CARD_TYPES.CASH_10K:
//             case CARD_TYPES.CASH_20K:
//               const cashAmount =
//                 card_type === CARD_TYPES.CASH_5K ? 5000 : card_type === CARD_TYPES.CASH_10K ? 10000 : 20000

//               console.log(`💰 ${contestant_name} won $${cashAmount}, switching turns`)
//               setPlayerCash((prev) => ({
//                 ...prev,
//                 [contestant_id]: (prev[contestant_id] || 0) + cashAmount,
//               }))
//               // Switch to next turn after opponent gets cash
//               const nextContestantCash = remainingContestants.find((c) => c.id !== contestant_id)
//               if (nextContestantCash) {
//                 setCurrentTurn(nextContestantCash.id)
//               }
//               break

//             case CARD_TYPES.BONUS_FLIP:
//               console.log(`🎯 ${contestant_name} got bonus flip, they continue`)
//               break

//             case CARD_TYPES.MISS_FLIP:
//               console.log(`❌ ${contestant_name} hit miss flip, switching turns`)
//               const nextContestantMiss = remainingContestants.find((c) => c.id !== contestant_id)
//               if (nextContestantMiss) {
//                 setCurrentTurn(nextContestantMiss.id)
//               }
//               break

//             case CARD_TYPES.PASS:
//               console.log(`🏆 ${contestant_name} found PASS card!`)
//               const finderName = contestant_name || getContestantName(contestant_id)?.name
//               setPassFinderName(finderName)
//               setPassFinderIsCurrentUser(false) // Always false for viewer
//               setPassFound(true)
//               setGameEnded(true)
//               break

//             default:
//               console.log(`❓ Unknown card type: ${card_type}`)
//               const nextContestantDefault = remainingContestants.find((c) => c.id !== contestant_id)
//               if (nextContestantDefault) {
//                 setCurrentTurn(nextContestantDefault.id)
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
//   }, [isConnected, addMessageListener, removeMessageListener, remainingContestants, refetch])

//   // Render different card types
//   const renderCard = (card: Card, index: number) => {
//     if (!card.revealed) {
//       return (
//         <PickCardContainer
//           backgroundColor={"transparent"}
//           text={React.createElement(cardIcons[index % 3], {
//                     className: "w-[120px] h-full",
//                   })}
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
//     switch (card.type) {
//       case CARD_TYPES.DUD:
//         return <DudCards className="w-[103px] h-full"  />
//       case CARD_TYPES.CASH_5K:
//         return <CashCard5k className="w-[103px]" />
//       case CARD_TYPES.CASH_10K:
//         return <CashCard10k className="w-[103px]" />
//       case CARD_TYPES.CASH_20K:
//         return <CashCard20k className="w-[103px]" />
//       case CARD_TYPES.BONUS_FLIP:
//         return <BonusFlipCard className="w-[103px]" />
//       case CARD_TYPES.MISS_FLIP:
//         return <MissFlipCard className="w-[103px]" />
//       case CARD_TYPES.PASS:
//         return <PassCard className="w-[103px] h-full"  />
//       default:
//         return <DudCards className="w-[103px] h-full"  />
//     }
//   }

//   return (
//     <>
//        <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
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

//             <div className="relative w-full py-[2rem] 2xl:py-[2.5rem]  px-6 -mt-3 rounded-[.875rem] 2xl:px-[2rem] overflow-hidden">              {/* Animated border */}
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
//                   transition={{ duration: 4, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
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

//                     <div className="text-white flex justify-center items-center gap-5">
//                       {/* <span className="font-gilroyBold text-[#D5B9FF] text-sm">
//                         Watch contestants collect instant cash, bonus flips, and avoid miss flips!
//                       </span> */}
//                       {!gameEnded && <TurnIndicator />}
//                     </div>

                 
//                   </div>
//                 </div>

//                 {isLoadingContestants ? (
//                   <div className="flex justify-center items-center h-full w-full">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//                   </div>
//                 ) : (
//                  <div className="grid grid-cols-6 gap-y-4 justify-center items-center">
//                     {cards.map((card, index) => {
//                       const isFlipping = flippingCards.includes(index)
//                       const isRecentlyUpdated = recentlyUpdated.includes(index)

//                       let displayName = ""
//                       if (card.revealed && card.contestant_id) {
//                         displayName = getContestantName(card.contestant_id)?.name
//                       }

//                       return (
                        // <div
                        //   key={index}
                        //   className={cn(
                        //     "relative transition-transform h-[140px]",
                        //     "cursor-default pointer-events-none opacity-70",
                        //     isRecentlyUpdated ? "animate-pulse" : "",
                        //   )}
                        //     style={{ perspective: "1000px" }}
                        // >
                          // <AnimatePresence mode="wait">
                          //   <motion.div
                          //     key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
                          //     initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
                          //     animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                          //     transition={{ duration: 0.3, ease: "easeInOut" }}
                          //     style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                          //     className="relative"
                          //   >
                          //     <div className="relative">
                          //       {card.revealed && (
                          //         <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
                          //           <span className="font-bold text-black text-xs bg-white px-2 py-1 rounded">
                          //             {displayName?.split(" ")[0]}
                          //           </span>
                          //         </div>
                          //       )}

                          //       <div className="relative w-full h-full">{renderCard(card, index)}</div>
                          //     </div>
                          //   </motion.div>
                          // </AnimatePresence>
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
//           <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} showStage3Reward={true} />
//         </div>

//         {/* Winner Modal */}
//         {passFound && (
//           <StageThreeWinnerModal
//             name={passFinderName}
//             balance={String(
//               getContestantInfo(Number(remainingContestants.find((c) => c.name === passFinderName)?.id))
//                 ?.actual_balance ?? 0,
//             )}
//             imgUrl={String(
//               getContestantInfo(Number(remainingContestants.find((c) => c.name === passFinderName)?.id))
//                 ?.contestant_photo_url ?? "/",
//             )}
//           />
//         )}
//       </div>
//     </>
//   )
// }

// export default Stage3CardSelectionScreens





// "use client"
// import Logo from "@/app/icons/Logo"
// import HeaderTitleContainer from "@/app/shared/HeaderContainer"
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
// import { GlowyStrokeText } from "@/components/core"
// import { cn } from "@/utils/classNames"
// import { motion, AnimatePresence } from "framer-motion"
// import React, { useState, useEffect } from "react"
// import { useMQTT } from "@/hooks/useMqttService"
// import { tokenStorage } from "@/utils/auth"
// import PickCardContainer from "@/app/shared/PickCardContainer"
// import { useGetGameContestants } from "@/app/admin/misc/api"
// import { type Card, CARD_STYLES } from "./CardStyles"
// import PickCard1 from "@/app/icons/cards/PickCard1"
// import PickCard2 from "@/app/icons/cards/PickCard2"
// import PickCard3 from "@/app/icons/cards/PickCard3"
// import DudCards from "@/app/icons/cards/DudCard"
// import BonusFlip from "@/app/icons/cards/BonusFlip"
// import MissCardFlip from "@/app/icons/cards/MissCardFlip"
// import PassCard from "@/app/icons/cards/PassCard"
// import VersusIcon from "@/app/icons/Versus"
// import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar"
// import StageThreeWinnerModal from "@/app/components/stages/components/StageThreeWinnerModal"
// import InstantCashout from "@/app/icons/cards/InstantCashout"
// import HustleStages from "@/app/components/stages/components/hustle/HustleStages"
// import { useParams } from "next/navigation"

// const Stage3CardSelectionScreens = () => {
//   const user = tokenStorage.getUser()
//   const { isConnected, addMessageListener, removeMessageListener } = useMQTT()
//   const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number; name: string }>>([])

//   // Updated card types
//   const CARD_TYPES = {
//     DUD: "DUD",
//     CASH_5K: "CASH_5K",
//     CASH_10K: "CASH_10K",
//     CASH_20K: "CASH_20K",
//     BONUS_FLIP: "BONUS_FLIP",
//     MISS_FLIP: "MISS_FLIP",
//     PASS: "PASS",
//   }

//   // Updated card styles for new types with all required properties
//   const CASH_5K_STYLE = {
//     backgroundColor: "#004400",
//     rayColor: "#00FF00",
//     innerCircleColor: "#006600",
//     textColor: "#00FF00",
//     cornerColor: "#00AA00",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#002200",
//     textStrokeWidth: 1,
//     textStrokeColor: "#003300",
//   }

//   const CASH_10K_STYLE = {
//     backgroundColor: "#444400",
//     rayColor: "#FFD700",
//     innerCircleColor: "#666600",
//     textColor: "#FFD700",
//     cornerColor: "#AAAA00",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#222200",
//     textStrokeWidth: 1,
//     textStrokeColor: "#333300",
//   }

//   const CASH_20K_STYLE = {
//     backgroundColor: "#440000",
//     rayColor: "#FF6B35",
//     innerCircleColor: "#660000",
//     textColor: "#FF6B35",
//     cornerColor: "#AA0000",
//     fontFamily: "Arial",
//     fontSize: 16,
//     labelBackgroundColor: "#220000",
//     textStrokeWidth: 1,
//     textStrokeColor: "#330000",
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

//   // Add PASS card style
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

//   const params = useParams()
//   const [passFound, setPassFound] = useState(false)
//   const [passFinderName, setPassFinderName] = useState<string>("")
//   const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false)

//   // Add timer and modal states
//   const [bonusCardTimers, setBonusCardTimers] = useState<Record<number, number>>({})
//   const [bonusCardIntervals, setBonusCardIntervals] = useState<Record<number, NodeJS.Timeout>>({})
//   const [missFlipTimers, setMissFlipTimers] = useState<Record<number, { flipsRemaining: number; timer: number }>>({})
//   const [missFlipIntervals, setMissFlipIntervals] = useState<Record<number, NodeJS.Timeout>>({})
//   const [showBonusModal, setShowBonusModal] = useState(false)
//   const [bonusModalInfo, setBonusModalInfo] = useState<{ playerName: string; cardIndex: number } | null>(null)
//   const [showCardRevealModal, setShowCardRevealModal] = useState(false)
//   const [revealedCardInfo, setRevealedCardInfo] = useState<{
//     type: string
//     amount?: number
//     index: number
//     playerName?: string
//   } | null>(null)
//   const [showCountdown, setShowCountdown] = useState(false)
//   const [countdownValue, setCountdownValue] = useState(3)

//   // Add global timer states
//   const [globalTimer, setGlobalTimer] = useState<{
//     show: boolean
//     value: number
//     message: string
//     nextPlayer: string
//   }>({ show: false, value: 0, message: "", nextPlayer: "" })
//   const [globalTimerInterval, setGlobalTimerInterval] = useState<NodeJS.Timeout | null>(null)

//   // Add bonus flip notification state
//   const [bonusFlipNotification, setBonusFlipNotification] = useState<{
//     show: boolean
//     playerName: string
//     isCurrentUser: boolean
//   }>({ show: false, playerName: "", isCurrentUser: false })

//   // Create cards with correct distribution: 18 DUD, 3 bonus flip, 2 miss flip, 1 PASS = 24 total
//   const [cards, setCards] = useState<Card[]>(() => {
//     const cardArray: Card[] = []
//     // Add 18 DUD cards
//     for (let i = 0; i < 18; i++) {
//       cardArray.push({
//         type: CARD_TYPES.DUD,
//         originalType: CARD_TYPES.DUD,
//         revealed: false,
//         style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
//         contestant_id: null,
//       })
//     }
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
//     // Add 2 miss flip cards
//     for (let i = 0; i < 2; i++) {
//       cardArray.push({
//         type: CARD_TYPES.MISS_FLIP,
//         originalType: CARD_TYPES.MISS_FLIP,
//         revealed: false,
//         style: MISS_FLIP_STYLE,
//         contestant_id: null,
//       })
//     }
//     // Add 1 PASS card
//     cardArray.push({
//       type: CARD_TYPES.PASS,
//       originalType: CARD_TYPES.PASS,
//       revealed: false,
//       style: PASS_CARD_STYLE,
//       contestant_id: null,
//     })

//     // Shuffle the array
//     for (let i = cardArray.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1))
//       ;[cardArray[i], cardArray[j]] = [cardArray[j], cardArray[i]]
//     }

//     console.log(`🎯 Viewer Cards created: ${cardArray.length} total`)
//     console.log(`DUD: ${cardArray.filter((c) => c.originalType === CARD_TYPES.DUD).length}`)
//     console.log(`Bonus flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.BONUS_FLIP).length}`)
//     console.log(`Miss flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.MISS_FLIP).length}`)
//     console.log(`PASS cards: ${cardArray.filter((c) => c.originalType === CARD_TYPES.PASS).length}`)
//     return cardArray
//   })

//   const [gameEnded, setGameEnded] = useState(false)
//   const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([])
//   const [flippingCards, setFlippingCards] = useState<number[]>([])
//   const [contestantNames, setContestantNames] = useState<Record<number, string>>({})
//   const [currentTurn, setCurrentTurn] = useState<number | null>(null)


//  const { data: contestantsData, isLoading: isLoadingContestants, refetch } = useGetGameContestants(Number(params?.episodeId));

//   const cardIcons = [PickCard1, PickCard2, PickCard3]

//   // Helper function to start bonus card timer
//   const startBonusCardTimer = (cardIndex: number) => {
//     console.log(`⏰ Starting bonus timer for card ${cardIndex}`)
//     setBonusCardTimers((prev) => ({ ...prev, [cardIndex]: 5 }))
//     const interval = setInterval(() => {
//       setBonusCardTimers((prev) => {
//         const newTime = (prev[cardIndex] || 0) - 1
//         if (newTime <= 0) {
//           console.log(`⏰ Bonus timer finished for card ${cardIndex}`)
//           clearInterval(interval)
//           setBonusCardIntervals((prev) => {
//             const newIntervals = { ...prev }
//             delete newIntervals[cardIndex]
//             return newIntervals
//           })
//           return { ...prev, [cardIndex]: 0 }
//         }
//         return { ...prev, [cardIndex]: newTime }
//       })
//     }, 1000)
//     setBonusCardIntervals((prev) => ({ ...prev, [cardIndex]: interval }))
//   }

//   // Helper function to start miss flip timer (opponent gets 2 extra flips)
//   const startMissFlipTimer = (contestantId: number) => {
//     console.log(`⏰ Starting miss flip timer for contestant ${contestantId} - 2 extra flips`)
//     setMissFlipTimers((prev) => ({ ...prev, [contestantId]: { flipsRemaining: 2, timer: 10 } }))
//     const interval = setInterval(() => {
//       setMissFlipTimers((prev) => {
//         const current = prev[contestantId]
//         if (!current) return prev
//         const newTimer = current.timer - 1
//         if (newTimer <= 0) {
//           console.log(`⏰ Miss flip timer finished for contestant ${contestantId}`)
//           clearInterval(interval)
//           setMissFlipIntervals((prev) => {
//             const newIntervals = { ...prev }
//             delete newIntervals[contestantId]
//             return newIntervals
//           })
//           const newState = { ...prev }
//           delete newState[contestantId]
//           return newState
//         }
//         return { ...prev, [contestantId]: { ...current, timer: newTimer } }
//       })
//     }, 1000)
//     setMissFlipIntervals((prev) => ({ ...prev, [contestantId]: interval }))
//   }

//   const startGlobalTimer = (seconds: number, message: string, nextPlayer: string) => {
//     console.log(`⏰ Starting global timer: ${seconds}s - ${message}`)
//     setGlobalTimer({ show: true, value: seconds, message, nextPlayer })
//     if (globalTimerInterval) {
//       clearInterval(globalTimerInterval)
//     }
//     const interval = setInterval(() => {
//       setGlobalTimer((prev) => {
//         const newValue = prev.value - 1
//         if (newValue <= 0) {
//           clearInterval(interval)
//           setGlobalTimerInterval(null)
//           return { show: false, value: 0, message: "", nextPlayer: "" }
//         }
//         return { ...prev, value: newValue }
//       })
//     }, 1000)
//     setGlobalTimerInterval(interval)
//   }

//   // Clean up intervals on unmount
//   useEffect(() => {
//     return () => {
//       Object.values(bonusCardIntervals).forEach((interval) => {
//         clearInterval(interval)
//       })
//       Object.values(missFlipIntervals).forEach((interval) => {
//         clearInterval(interval)
//       })
//       if (globalTimerInterval) {
//         clearInterval(globalTimerInterval)
//       }
//     }
//   }, [bonusCardIntervals, missFlipIntervals, globalTimerInterval])

//   // Helper function to get contestant name by ID
//   const getContestantName = (contestantId: number): { name: string; balance?: string } => {
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

//   // Set remaining contestants
//   useEffect(() => {
//     console.log(`🎯 Contestants data effect triggered:`, {
//       hasData: !!contestantsData?.data,
//       dataLength: contestantsData?.data?.length,
//     })

//     if (!contestantsData?.data) {
//       console.log(`🎯 No contestants data available`)
//       return
//     }

//     const remaining = contestantsData.data
//       .filter((contestant: any) =>
//         contestant.eliminated_stage === null && !contestant.is_eliminated
//       )
//       .map((contestant: any) => ({
//         id: contestant.id,
//         name: contestant?.name || `Contestant ${contestant.id}`
//       }));

//     setRemainingContestants(remaining);

//     const namesMap: Record<number, string> = {}
//     contestantsData.data.forEach((contestant: any) => {
//       if (contestant.id && contestant.name) {
//         namesMap[contestant.id] = contestant.name
//       }
//     })
//     setContestantNames(namesMap)

//     // Set initial turn to first contestant if no turn is set
//     if (remaining.length >= 1 && currentTurn === null) {
//       const firstTurnId = remaining[0].id
//       console.log(`🎯 Setting initial turn to contestant ${firstTurnId}`)
//       setCurrentTurn(firstTurnId)
//     }

//     // If current turn contestant is eliminated, switch to next available
//     if (currentTurn !== null && !remaining.find((c) => c.id === currentTurn)) {
//       const nextTurnId = remaining[0]?.id
//       if (nextTurnId) {
//         console.log(`🎯 Current turn contestant eliminated, switching to ${nextTurnId}`)
//         setCurrentTurn(nextTurnId)
//       }
//     }
//   }, [contestantsData?.data, currentTurn])

//   const getContestantInfo = (id: number) => {
//     const allContestant = contestantsData?.data?.find((contestant) => Number(contestant.id) === Number(id))
//     return allContestant
//   }

//   // Fixed Turn Indicator Component
//   const TurnIndicator = () => {
//     console.log(
//       `🎯 TurnIndicator: remainingContestants=${remainingContestants.length}, currentTurn=${currentTurn}, passFound=${passFound}`,
//     )

//     // // Only hide if game actually ended (pass found)
//     if (passFound) {
//       console.log(`🎯 TurnIndicator hidden: passFound=${passFound}`)
//       return null
//     }

//     // Show loading state if contestants haven't loaded yet
//     if (remainingContestants.length === 0) {
//       return (
//         <div className="flex items-center justify-center gap-6 p-4 w-full">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//           <span className="text-white">Loading contestants...</span>
//         </div>
//       )
//     }

//     return (
//       <div className="flex items-center justify-center gap-6 p-4 w-full">
//         {/* Main container with contestants */}
//         <div className="flex items-center justify-center w-full ">
//           {remainingContestants?.map((contestant, index) => {
//             const missFlipInfo = missFlipTimers[contestant.id]
//             const isCurrentTurn = currentTurn === contestant.id
//             return (
//               <React.Fragment key={contestant.id}>
//                 {/* Contestant card */}
//                 <div
//                   className={`
//                   flex items-center border-[0.5px] border-opacity-70 bg-transparent justify-center gap-4 px-4 py-3 rounded-lg min-w-[200px]
//                    ${isCurrentTurn ? " border-[#04DA6A]" : " border-[#EB001B]"}
//                 `}
//                 >
//                   <div className="flex items-center gap-6">
//                     <span
//                       className={`
//                       font-bold text-2xl capitalize tracking-wide
//                       ${isCurrentTurn ? "text-white" : "text-gray-300"}
//                     `}
//                     >
//                       {contestant.name?.split(" ")[0]}
//                     </span>
//                     {isCurrentTurn && !missFlipInfo && (
//                       <div className="flex items-center gap-3 bg-[#053F20] py-[7px] px-4 rounded-xl border border-[#04DA6A]">
//                         <span className="text-2xl font-semibold font-verdana text-[#04DA6A]">Your turn</span>
//                         <div className="w-3 h-3 rounded-full bg-[#04DA6A] animate-pulse"></div>
//                       </div>
//                     )}
//                     {isCurrentTurn && missFlipInfo && (
//                       <div className="flex items-center gap-3 bg-[#4A1A00] py-[7px] px-4 rounded-xl border border-[#FF8C00]">
//                         <span className="text-2xl font-semibold font-verdana text-[#FF8C00]">
//                           Extra Flips: {missFlipInfo.flipsRemaining}
//                         </span>
//                         <div className="text-[#FF8C00] text-2xl font-bold">{missFlipInfo.timer}s</div>
//                       </div>
//                     )}
//                     {!isCurrentTurn && (
//                       <div className="flex items-center gap-3 bg-[#38040A] py-[7px] px-4 rounded-xl">
//                         <span className="text-2xl font-semibold font-verdana text-[#FF495E]">Waiting</span>
//                         <div className="w-3 h-3 rounded-full bg-[#FF495E]"></div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {/* VS indicator between contestants */}
//                 {index === 0 && remainingContestants.length > 1 && (
//                   <div className="px-6">
//                     <VersusIcon />
//                   </div>
//                 )}
//               </React.Fragment>
//             )
//           })}
//         </div>
//       </div>
//     )
//   }

//   // Enhanced Global Timer Component with better visibility
//   const GlobalTimer = () => {
//     console.log(`🎯 GlobalTimer: show=${globalTimer.show}, value=${globalTimer.value}`)
//     if (!globalTimer.show || globalTimer.value <= 0) return null

//     return (
//       <AnimatePresence>
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.5, opacity: 0 }}
//             className="text-center p-8 bg-gray-900 rounded-2xl border-4 border-yellow-400"
//           >
//             <div className="text-white text-3xl font-bold mb-6">{globalTimer.message}</div>
//             <div className="text-yellow-400 text-9xl font-bold animate-pulse mb-6 drop-shadow-lg">
//               {globalTimer.value}
//             </div>
//             {globalTimer.nextPlayer && (
//               <div className="text-green-400 text-2xl font-bold bg-green-900 px-6 py-3 rounded-lg">
//                 {globalTimer.nextPlayer}'s turn next
//               </div>
//             )}
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   const BonusFlipNotification = () => {
//     if (!bonusFlipNotification.show) return null
//     return (
//       <AnimatePresence>
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
//           <motion.div
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -50 }}
//             className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-400"
//           >
//             <div className="text-center">
//               <div className="text-yellow-400 font-bold text-lg">🎯 BONUS FLIP!</div>
//               <div className="text-sm">
//                 {bonusFlipNotification.isCurrentUser
//                   ? "You can flip again!"
//                   : `${bonusFlipNotification.playerName} can flip again!`}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   // Enhanced Card Reveal Modal Component
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
//         case CARD_TYPES.CASH_5K:
//           return {
//             title: "+₦5,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.CASH_10K:
//           return {
//             title: "+₦10,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.CASH_20K:
//           return {
//             title: "+₦20,000",
//             Icon: <InstantCashout width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.MISS_FLIP:
//           return {
//             title: `Miss flip revealed!`,
//             icon: <MissCardFlip width={300} height={300} />,
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
//       <AnimatePresence>
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.5, opacity: 0 }}
//             className="text-center max-w-lg w-full mx-4"
//           >
//             {/* Top text for cash cards */}
//             {cardType.includes("K") && (
//               <div className="text-green-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//             )}
//             {/* Miss flip special text */}
//             {cardType === CARD_TYPES.MISS_FLIP && (
//               <div className="text-green-400 text-xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//             )}
//             {/* Card container */}
//             <div className="relative mb-8">
//               <div className={`bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm `}>
//                 <div className="text-white text-4xl font-bold mb-2">{cardDisplay.Icon}</div>
//               </div>
//             </div>
//             {/* Player name at bottom */}
//             {playerName && (
//               <div className="bg-red-800 text-white px-6 py-3 rounded-lg inline-block font-bold">{playerName}</div>
//             )}
//             {/* Countdown display */}
//             {showCountdown && (
//               <div className="mt-8">
//                 <div className="text-green-400 text-xl font-bold mb-4">Turn switching...</div>
//                 <div className="text-green-400 text-8xl font-bold animate-pulse">{countdownValue}</div>
//               </div>
//             )}
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   // Bonus Modal Component
//   const BonusModal = () => {
//     if (!showBonusModal || !bonusModalInfo) return null

//     return (
//       <AnimatePresence>
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.5, opacity: 0 }}
//             className="text-center max-w-lg w-full mx-4"
//           >
//             <div className="text-purple-400 text-3xl font-bold mb-6">🎯 BONUS FLIP!</div>
//             <div className="relative mb-8">
//               <div className="bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm">
//                 <BonusFlip width={300} height={300} />
//               </div>
//             </div>
//             <div className="text-white text-xl font-bold mb-4">{bonusModalInfo.playerName} earned an extra flip!</div>
//             <div className="bg-purple-800 text-white px-6 py-3 rounded-lg inline-block font-bold">
//               {bonusModalInfo.playerName}
//             </div>
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   // MQTT message handler for viewer screen
//   useEffect(() => {
//     if (!isConnected) return

//     const handleMQTTMessage = (receivedMessage: any) => {
//       if (receivedMessage?.event === "stage3_card_selection") {
//         const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload

//         setFlippingCards((prev) => [...prev, card_index])

//         setTimeout(() => {
//           // Get total revealed cards before this reveal for PASS logic
//           const totalRevealedCards = cards.filter((card) => card.revealed).length

//           setCards((prevCards) => {
//             const newCards = [...prevCards]
//             // Apply PASS logic - PASS is always visible
//             const finalCardType = card_type

//             console.log(`📡 Viewer MQTT: Card ${card_index} revealed as ${card_type} by contestant ${contestant_id}`)

//             newCards[card_index] = {
//               ...newCards[card_index],
//               revealed: true,
//               type: finalCardType,
//               contestant_id: contestant_id,
//               style: finalCardType === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style,
//             }

//             return newCards
//           })

//           // Handle turn switching and special effects based on card type
//           switch (card_type) {
//             case CARD_TYPES.DUD:
//               console.log(`🎯 DUD card revealed, starting turn switch sequence`)
//               // Show DUD modal for 3 seconds, then global timer
//               setRevealedCardInfo({
//                 type: card_type,
//                 index: card_index,
//                 playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
//               })
//               setShowCardRevealModal(true)

//               setTimeout(() => {
//                 setShowCardRevealModal(false)
//                 const otherContestant = remainingContestants.find((c) => c.id !== contestant_id)
//                 console.log(`🎯 Other contestant for turn switch:`, otherContestant)
//                 if (otherContestant) {
//                   console.log(`🎯 Starting global timer for turn switch`)
//                   startGlobalTimer(3, "Turn switching...", otherContestant.name)
//                   setTimeout(() => {
//                     console.log(`🎯 Switching turn to ${otherContestant.id}`)
//                     setCurrentTurn(otherContestant.id)
//                   }, 3000)
//                 }
//               }, 3000)
//               break

//             case CARD_TYPES.BONUS_FLIP:
//               // Current player continues, show modal and start timer
//               const playerName = contestant_name || getContestantName(contestant_id)?.name || "Player"
//               setBonusModalInfo({ playerName, cardIndex: card_index })
//               setShowBonusModal(true)
//               startBonusCardTimer(card_index)

//               // Hide modal after 3 seconds
//               setTimeout(() => {
//                 setShowBonusModal(false)
//               }, 3000)

//               // Show notification
//               setBonusFlipNotification({
//                 show: true,
//                 playerName: playerName,
//                 isCurrentUser: false,
//               })

//               // Hide notification after 3 seconds
//               setTimeout(() => {
//                 setBonusFlipNotification({ show: false, playerName: "", isCurrentUser: false })
//               }, 3000)
//               break

//             case CARD_TYPES.MISS_FLIP:
//               // Show miss flip modal, then global timer
//               setRevealedCardInfo({
//                 type: card_type,
//                 index: card_index,
//                 playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
//               })
//               setShowCardRevealModal(true)

//               setTimeout(() => {
//                 setShowCardRevealModal(false)
//                 const otherContestantForMiss = remainingContestants.find((c) => c.id !== contestant_id)
//                 if (otherContestantForMiss) {
//                   startGlobalTimer(5, `${otherContestantForMiss.name} gets 2 extra flips!`, otherContestantForMiss.name)
//                   setTimeout(() => {
//                     setCurrentTurn(otherContestantForMiss.id)
//                     startMissFlipTimer(otherContestantForMiss.id)
//                   }, 5000)
//                 }
//               }, 3000)
//               break

//             case CARD_TYPES.PASS:
//               // Show PASS modal for 5 seconds before winner modal
//               setRevealedCardInfo({
//                 type: card_type,
//                 index: card_index,
//                 playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
//               })
//               setShowCardRevealModal(true)

//               setTimeout(() => {
//                 setShowCardRevealModal(false)
//                 const finderName = contestant_name || getContestantName(contestant_id)?.name
//                 setPassFinderName(finderName)
//                 setPassFinderIsCurrentUser(false)
//                 setPassFound(true)
//                 setGameEnded(true)
//               }, 5000)
//               break
//           }

//           // Handle miss flip timer decrement
//           if (missFlipTimers[contestant_id]) {
//             setMissFlipTimers((prev) => {
//               const current = prev[contestant_id]
//               if (current && current.flipsRemaining > 1) {
//                 return { ...prev, [contestant_id]: { ...current, flipsRemaining: current.flipsRemaining - 1 } }
//               } else {
//                 // No more extra flips, switch turns
//                 const otherContestant = remainingContestants.find((c) => c.id !== contestant_id)
//                 if (otherContestant) {
//                   setCurrentTurn(otherContestant.id)
//                 }
//                 const newState = { ...prev }
//                 delete newState[contestant_id]
//                 return newState
//               }
//             })
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
//   }, [isConnected, addMessageListener, removeMessageListener, remainingContestants, refetch, cards, missFlipTimers])

//   // Render different card types
//   const renderCard = (card: Card, index: number) => {
//     if (!card.revealed) {
//       return (
//         <PickCardContainer
//           backgroundColor={"transparent"}
//           text={React.createElement(cardIcons[index % 3], {
//             className: "w-[130px] h-full",
//           })}
//           textColor={card.style.textColor}
//           fontFamily={card.style.fontFamily}
//           containerLabel=""
//           className={cn(
//             "transition-transform w-full h-full  duration-300 ease-in-out p-0 pointer-events-none cursor-default",
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
//           return <DudCards className="w-[130px] h-full" />
//         case CARD_TYPES.CASH_5K:
//         case CARD_TYPES.CASH_10K:
//         case CARD_TYPES.CASH_20K:
//           return <InstantCashout className="w-[130px] h-full" />
//         case CARD_TYPES.BONUS_FLIP:
//           return <BonusFlip className="w-[130px] h-full" />
//         case CARD_TYPES.MISS_FLIP:
//           return <MissCardFlip className="w-[130px] h-full" />
//         case CARD_TYPES.PASS:
//           return <PassCard className="w-[130px] h-full" />
//         default:
//           return <DudCards className="w-[130px] h-full" />
//       }
//     })()

//     // Add timer overlay for bonus cards
//     if (card.type === CARD_TYPES.BONUS_FLIP && bonusCardTimers[index] > 0) {
//       const playerName = card.contestant_id ? getContestantName(card.contestant_id)?.name : "Unknown"
//       return (
//         <div className="relative">
//           {cardElement}
//           <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg border-2 border-yellow-400">
//             <div className="text-center">
//               <div className="text-yellow-400 text-xs font-bold mb-1">BONUS FLIP</div>
//               <div className="text-yellow-400 text-2xl font-bold animate-pulse">{bonusCardTimers[index]}</div>
//               <div className="text-white text-xs font-bold">{playerName?.split(" ")[0]} can flip again!</div>
//             </div>
//           </div>
//         </div>
//       )
//     }

//     return cardElement
//   }

//   return (
//     <>
//       {/* Global Timer - moved outside main container */}
//       <GlobalTimer />

//       {/* Enhanced Card Reveal Modal */}
//       {showCardRevealModal && revealedCardInfo && (
//         <CardRevealModal
//           cardType={revealedCardInfo.type}
//           amount={revealedCardInfo.amount}
//           playerName={revealedCardInfo.playerName}
//           onClose={() => {
//             setShowCardRevealModal(false)
//             setShowCountdown(false)
//           }}
//         />
//       )}

//       {/* Bonus Flip Notification */}
//       <BonusFlipNotification />

//       {/* Bonus Modal */}
//       <BonusModal />

//       <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
//         {/* Left Sidebar */}
//         <div className="flex flex-col justify-between">
//           <div className="flex justify-center items-center h-3.5 w-full mt-1">
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
//             <div className="relative w-full py-[2rem] 2xl:py-[2.5rem]  px-6 -mt-3 rounded-[.875rem] 2xl:px-[2rem] overflow-hidden">              {/* Animated border */}
//               {/* Animated border */}
//               <div className="absolute inset-0">
//                 <motion.div
//                   className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
//                   style={{
//                     background: `conic-gradient(from 0deg at 50% 50%,
//                       #d91fff 0deg,
//                       #d91fff 120deg,
//                       #00ffff 100deg,
//                       #00ffff 240deg,
//                       #FFD700 220deg,
//                       #FFD700 360deg,
//                       #d91fff 340deg
//                     )`,
//                   }}
//                   animate={{ rotate: [0, 360] }}
//                   transition={{ duration: 4, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
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
//                 {/* Turn Indicator - moved here and always show when not game ended */}
//                 <div className="text-white flex justify-center items-center gap-5 mb-4">
//                   <TurnIndicator />
//                 </div>
//                 {isLoadingContestants ? (
//                   <div className="flex justify-center items-center h-full w-full">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//                   </div>
//                 ) : (
//                    <div className="grid grid-cols-6 gap-y-4 justify-center items-center">
//                     {cards.map((card, index) => {
//                       const isFlipping = flippingCards.includes(index)
//                       const isRecentlyUpdated = recentlyUpdated.includes(index)
//                       let displayName = ""
//                       if (card.revealed && card.contestant_id) {
//                         displayName = getContestantName(card.contestant_id)?.name
//                       }

//                       return (
//                          <div
//                           key={index}
//                           className={cn(
//                             "relative transition-transform h-[140px]",
//                             "cursor-default pointer-events-none opacity-70",
//                             isRecentlyUpdated ? "animate-pulse" : "",
//                           )}
//                             // style={{ perspective: "1000px" }}
//                         >
//                          <AnimatePresence mode="wait">
//                             <motion.div
//                               key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
//                               initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
//                               animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
//                               transition={{ duration: 0.3, ease: "easeInOut" }}
//                               style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
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
//           <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} showStage3Reward={true}/>
//         </div>

//         {/* Winner Modal for viewer */}
//         {passFound && (
//           <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
//             <StageThreeWinnerModal
//               name={passFinderName}
//               balance={String(
//                 getContestantInfo(Number(remainingContestants.find((c) => c.name === passFinderName)?.id))
//                   ?.actual_balance ?? 0,
//               )}
//               imgUrl={String(
//                 getContestantInfo(Number(remainingContestants.find((c) => c.name === passFinderName)?.id))
//                   ?.contestant_photo_url || "/",
//               )}
//             />
//           </div>
//         )}
//       </div>
//     </>
//   )
// }

// export default Stage3CardSelectionScreens



// "use client"
// import Logo from "@/app/icons/Logo"
// import HeaderTitleContainer from "@/app/shared/HeaderContainer"
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
// import { GlowyStrokeText } from "@/components/core"
// import { cn } from "@/utils/classNames"
// import { motion, AnimatePresence } from "framer-motion"
// import React, { useState, useEffect } from "react"
// import { useMQTT } from "@/hooks/useMqttService"
// import { tokenStorage } from "@/utils/auth"
// import PickCardContainer from "@/app/shared/PickCardContainer"
// import { useGetGameContestants } from "@/app/admin/misc/api"
// import { type Card, CARD_STYLES } from "./CardStyles"
// import PickCard1 from "@/app/icons/cards/PickCard1"
// import PickCard2 from "@/app/icons/cards/PickCard2"
// import PickCard3 from "@/app/icons/cards/PickCard3"
// import DudCards from "@/app/icons/cards/DudCard"
// import BonusFlip from "@/app/icons/cards/BonusFlip"
// import MissCardFlip from "@/app/icons/cards/MissCardFlip"
// import PassCard from "@/app/icons/cards/PassCard"
// import VersusIcon from "@/app/icons/Versus"
// import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar"
// import StageThreeWinnerModal from "@/app/components/stages/components/StageThreeWinnerModal"
// import InstantCashout from "@/app/icons/cards/InstantCashout"
// import HustleStages from "@/app/components/stages/components/hustle/HustleStages"
// import { useParams } from "next/navigation"
// import DudCardWithShadow from "@/app/icons/DudCardWithShadow"
// import InstantCashWithShadow from "./InstantCashWithShadow"

// const Stage3CardSelectionScreens = () => {
//   const user = tokenStorage.getUser()
//   const { isConnected, addMessageListener, removeMessageListener } = useMQTT()
//   const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number; name: string }>>([])

//   // Updated card types
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

//   // Add PASS card style
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

//   const params = useParams()
//   const [passFound, setPassFound] = useState(false)
//   const [passFinderName, setPassFinderName] = useState<string>("")
//   const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false)

//   // Add timer and modal states
//   const [bonusCardTimers, setBonusCardTimers] = useState<Record<number, number>>({})
//   const [bonusCardIntervals, setBonusCardIntervals] = useState<Record<number, NodeJS.Timeout>>({})
//   const [missFlipTimers, setMissFlipTimers] = useState<Record<number, { flipsRemaining: number; timer: number }>>({})
//   const [missFlipIntervals, setMissFlipIntervals] = useState<Record<number, NodeJS.Timeout>>({})
//   const [showBonusModal, setShowBonusModal] = useState(false)
//   const [bonusModalInfo, setBonusModalInfo] = useState<{ playerName: string; cardIndex: number } | null>(null)
//   const [showCardRevealModal, setShowCardRevealModal] = useState(false)
//   const [revealedCardInfo, setRevealedCardInfo] = useState<{
//     type: string
//     amount?: number
//     index: number
//     playerName?: string
//   } | null>(null)
//   const [showCountdown, setShowCountdown] = useState(false)
//   const [countdownValue, setCountdownValue] = useState(3)

//   // Add global timer states
//   const [globalTimer, setGlobalTimer] = useState<{
//     show: boolean
//     value: number
//     message: string
//     nextPlayer: string
//   }>({ show: false, value: 0, message: "", nextPlayer: "" })
//   const [globalTimerInterval, setGlobalTimerInterval] = useState<NodeJS.Timeout | null>(null)

//   // Add bonus flip notification state
//   const [bonusFlipNotification, setBonusFlipNotification] = useState<{
//     show: boolean
//     playerName: string
//     isCurrentUser: boolean
//   }>({ show: false, playerName: "", isCurrentUser: false })

//   // Create cards with correct distribution: 18 DUD, 3 bonus flip, 2 miss flip, 1 PASS = 24 total
//   const [cards, setCards] = useState<Card[]>(() => {
//     const cardArray: Card[] = []
//     // Add 18 DUD cards
//     for (let i = 0; i < 18; i++) {
//       cardArray.push({
//         type: CARD_TYPES.DUD,
//         originalType: CARD_TYPES.DUD,
//         revealed: false,
//         style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
//         contestant_id: null,
//       })
//     }
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
//     // Add 2 miss flip cards
//     for (let i = 0; i < 2; i++) {
//       cardArray.push({
//         type: CARD_TYPES.MISS_FLIP,
//         originalType: CARD_TYPES.MISS_FLIP,
//         revealed: false,
//         style: MISS_FLIP_STYLE,
//         contestant_id: null,
//       })
//     }
//     // Add 1 PASS card
//     cardArray.push({
//       type: CARD_TYPES.PASS,
//       originalType: CARD_TYPES.PASS,
//       revealed: false,
//       style: PASS_CARD_STYLE,
//       contestant_id: null,
//     })

//     // Shuffle the array
//     for (let i = cardArray.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1))
//       ;[cardArray[i], cardArray[j]] = [cardArray[j], cardArray[i]]
//     }

//     console.log(`🎯 Viewer Cards created: ${cardArray.length} total`)
//     console.log(`DUD: ${cardArray.filter((c) => c.originalType === CARD_TYPES.DUD).length}`)
//     console.log(`Bonus flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.BONUS_FLIP).length}`)
//     console.log(`Miss flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.MISS_FLIP).length}`)
//     console.log(`PASS cards: ${cardArray.filter((c) => c.originalType === CARD_TYPES.PASS).length}`)

//     return cardArray
//   })

//   const [gameEnded, setGameEnded] = useState(false)
//   const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([])
//   const [flippingCards, setFlippingCards] = useState<number[]>([])
//   const [contestantNames, setContestantNames] = useState<Record<number, string>>({})
//   const [currentTurn, setCurrentTurn] = useState<number | null>(null)

//   const {
//     data: contestantsData,
//     isLoading: isLoadingContestants,
//     refetch,
//   } = useGetGameContestants(Number(params?.episodeId))

//   const cardIcons = [PickCard1, PickCard2, PickCard3]

//   // Helper function to start bonus card timer
//   const startBonusCardTimer = (cardIndex: number) => {
//     console.log(`⏰ Starting bonus timer for card ${cardIndex}`)
//     setBonusCardTimers((prev) => ({ ...prev, [cardIndex]: 5 }))
//     const interval = setInterval(() => {
//       setBonusCardTimers((prev) => {
//         const newTime = (prev[cardIndex] || 0) - 1
//         if (newTime <= 0) {
//           console.log(`⏰ Bonus timer finished for card ${cardIndex}`)
//           clearInterval(interval)
//           setBonusCardIntervals((prev) => {
//             const newIntervals = { ...prev }
//             delete newIntervals[cardIndex]
//             return newIntervals
//           })
//           return { ...prev, [cardIndex]: 0 }
//         }
//         return { ...prev, [cardIndex]: newTime }
//       })
//     }, 1000)
//     setBonusCardIntervals((prev) => ({ ...prev, [cardIndex]: interval }))
//   }

//   // Helper function to start miss flip timer (opponent gets 2 extra flips)
//   const startMissFlipTimer = (contestantId: number) => {
//     console.log(`⏰ Starting miss flip timer for contestant ${contestantId} - 2 extra flips`)
//     setMissFlipTimers((prev) => ({ ...prev, [contestantId]: { flipsRemaining: 2, timer: 10 } }))
//     const interval = setInterval(() => {
//       setMissFlipTimers((prev) => {
//         const current = prev[contestantId]
//         if (!current) return prev
//         const newTimer = current.timer - 1
//         if (newTimer <= 0) {
//           console.log(`⏰ Miss flip timer finished for contestant ${contestantId}`)
//           clearInterval(interval)
//           setMissFlipIntervals((prev) => {
//             const newIntervals = { ...prev }
//             delete newIntervals[contestantId]
//             return newIntervals
//           })
//           const newState = { ...prev }
//           delete newState[contestantId]
//           return newState
//         }
//         return { ...prev, [contestantId]: { ...current, timer: newTimer } }
//       })
//     }, 1000)
//     setMissFlipIntervals((prev) => ({ ...prev, [contestantId]: interval }))
//   }

//   const startGlobalTimer = (seconds: number, message: string, nextPlayer: string) => {
//     console.log(`⏰ Starting global timer: ${seconds}s - ${message}`)
//     setGlobalTimer({ show: true, value: seconds, message, nextPlayer })
//     if (globalTimerInterval) {
//       clearInterval(globalTimerInterval)
//     }
//     const interval = setInterval(() => {
//       setGlobalTimer((prev) => {
//         const newValue = prev.value - 1
//         if (newValue <= 0) {
//           clearInterval(interval)
//           setGlobalTimerInterval(null)
//           return { show: false, value: 0, message: "", nextPlayer: "" }
//         }
//         return { ...prev, value: newValue }
//       })
//     }, 1000)
//     setGlobalTimerInterval(interval)
//   }

//   // Clean up intervals on unmount
//   useEffect(() => {
//     return () => {
//       Object.values(bonusCardIntervals).forEach((interval) => {
//         clearInterval(interval)
//       })
//       Object.values(missFlipIntervals).forEach((interval) => {
//         clearInterval(interval)
//       })
//       if (globalTimerInterval) {
//         clearInterval(globalTimerInterval)
//       }
//     }
//   }, [bonusCardIntervals, missFlipIntervals, globalTimerInterval])

//   // Helper function to get contestant name by ID
//   const getContestantName = (contestantId: number): { name: string; balance?: string } => {
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

//   // Set remaining contestants
//   useEffect(() => {
//     console.log(`🎯 Contestants data effect triggered:`, {
//       hasData: !!contestantsData?.data,
//       dataLength: contestantsData?.data?.length,
//     })
//     if (!contestantsData?.data) {
//       console.log(`🎯 No contestants data available`)
//       return
//     }

//     const remaining = contestantsData.data
//       .filter((contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated)
//       .map((contestant: any) => ({
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

//     // Set initial turn to first contestant if no turn is set
//     if (remaining.length >= 1 && currentTurn === null) {
//       const firstTurnId = remaining[0].id
//       console.log(`🎯 Setting initial turn to contestant ${firstTurnId}`)
//       setCurrentTurn(firstTurnId)
//     }

//     // If current turn contestant is eliminated, switch to next available
//     if (currentTurn !== null && !remaining.find((c) => c.id === currentTurn)) {
//       const nextTurnId = remaining[0]?.id
//       if (nextTurnId) {
//         console.log(`🎯 Current turn contestant eliminated, switching to ${nextTurnId}`)
//         setCurrentTurn(nextTurnId)
//       }
//     }
//   }, [contestantsData?.data, currentTurn])

//   const getContestantInfo = (id: number) => {
//     const allContestant = contestantsData?.data?.find((contestant) => Number(contestant.id) === Number(id))
//     return allContestant
//   }

//   // Fixed Turn Indicator Component
//   const TurnIndicator = () => {
//     console.log(
//       `🎯 TurnIndicator: remainingContestants=${remainingContestants.length}, currentTurn=${currentTurn}, passFound=${passFound}`,
//     )
//     // // Only hide if game actually ended (pass found)
//     if (passFound) {
//       console.log(`🎯 TurnIndicator hidden: passFound=${passFound}`)
//       return null
//     }

//     // Show loading state if contestants haven't loaded yet
//     if (remainingContestants.length === 0) {
//       return (
//         <div className="flex items-center justify-center gap-6 p-4 w-full">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//           <span className="text-white">Loading contestants...</span>
//         </div>
//       )
//     }

//     return (
//       <div className="flex items-center justify-center gap-6 p-4 w-full">
//         {/* Main container with contestants */}
//         <div className="flex items-center justify-center w-full ">
//           {remainingContestants?.map((contestant, index) => {
//             const missFlipInfo = missFlipTimers[contestant.id]
//             const isCurrentTurn = currentTurn === contestant.id
//             return (
//               <React.Fragment key={contestant.id}>
//                 {/* Contestant card */}
//                 <div
//                   className={`
//                   flex items-center border-[0.5px] border-opacity-70 bg-transparent justify-center gap-4 px-4 py-3 rounded-lg min-w-[200px]
//                    ${isCurrentTurn ? " border-[#04DA6A]" : " border-[#EB001B]"}
//                 `}
//                 >
//                   <div className="flex items-center gap-6">
//                     <span
//                       className={`
//                       font-bold text-2xl capitalize tracking-wide
//                       ${isCurrentTurn ? "text-white" : "text-gray-300"}
//                     `}
//                     >
//                       {contestant.name?.split(" ")[0]}
//                     </span>
//                     {isCurrentTurn && !missFlipInfo && (
//                       <div className="flex items-center gap-3 bg-[#053F20] py-[7px] px-4 rounded-xl border border-[#04DA6A]">
//                         <span className="text-2xl font-semibold font-verdana text-[#04DA6A]">Your turn</span>
//                         <div className="w-3 h-3 rounded-full bg-[#04DA6A] animate-pulse"></div>
//                       </div>
//                     )}
//                     {isCurrentTurn && missFlipInfo && (
//                       <div className="flex items-center gap-3 bg-[#4A1A00] py-[7px] px-4 rounded-xl border border-[#FF8C00]">
//                         <span className="text-2xl font-semibold font-verdana text-[#FF8C00]">
//                           Extra Flips: {missFlipInfo.flipsRemaining}
//                         </span>
//                         <div className="text-[#FF8C00] text-2xl font-bold">{missFlipInfo.timer}s</div>
//                       </div>
//                     )}
//                     {!isCurrentTurn && (
//                       <div className="flex items-center gap-3 bg-[#38040A] py-[7px] px-4 rounded-xl">
//                         <span className="text-2xl font-semibold font-verdana text-[#FF495E]">Waiting</span>
//                         <div className="w-3 h-3 rounded-full bg-[#FF495E]"></div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {/* VS indicator between contestants */}
//                 {index === 0 && remainingContestants.length > 1 && (
//                   <div className="px-6">
//                     <VersusIcon />
//                   </div>
//                 )}
//               </React.Fragment>
//             )
//           })}
//         </div>
//       </div>
//     )
//   }

//   // Enhanced Global Timer Component with better visibility
//   const GlobalTimer = () => {
//     if (!globalTimer.show || globalTimer.value <= 0) return null

//     return (
//       <AnimatePresence>
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.5, opacity: 0 }}
//             className="text-center p-8 "
//           >
//             {/* <div className="text-white text-3xl font-bold mb-6">{globalTimer.message}</div> */}
//             {globalTimer.nextPlayer && (
//               <div className="text-green-400 text-2xl font-bold  px-6 py-3 rounded-lg">
//                 {globalTimer.nextPlayer}'s turn next
//               </div>
//             )}
//             <div className="text-[#04DA6A] text-9xl font-bold animate-pulse mb-4 drop-shadow-lg">
//               {globalTimer.value}
//             </div>
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   const BonusFlipNotification = () => {
//     if (!bonusFlipNotification.show) return null

//     return (
//       <AnimatePresence>
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
//           <motion.div
//             initial={{ opacity: 0, y: -50 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -50 }}
//             className="bg-gradient-to-r  text-white px-6 py-3 rounded-lg shadow-lg border-2"
//           >
//             <div className="text-center">
//               <div className="text-yellow-400 font-bold text-lg">🎯 BONUS FLIP!</div>
//               <div className="text-sm">
//                 {bonusFlipNotification.isCurrentUser
//                   ? "You can flip again!"
//                   : `${bonusFlipNotification.playerName} can flip again!`}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   // Enhanced Card Reveal Modal Component
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
//             Icon: <InstantCashWithShadow width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.TEN_K:
//           return {
//             title: "+₦10,000",
//             Icon: <InstantCashWithShadow width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.TWENTY_K:
//           return {
//             title: "+₦20,000",
//             Icon: <InstantCashWithShadow width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-green-500 to-green-700",
//             cardBg: "bg-green-600",
//           }
//         case CARD_TYPES.MISS_FLIP:
//           return {
//             title: `Miss flip revealed!`,
//             Icon: <MissCardFlip width={300} height={300} />, // Fixed: Changed from subtitle to Icon
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
//             Icon: <DudCardWithShadow width={300} height={300} />,
//             bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
//             cardBg: "bg-gray-500",
//           }
//       }
//     }

//     const cardDisplay = getCardDisplay()

//     return (
//       <AnimatePresence>
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.5, opacity: 0 }}
//             className="text-center max-w-lg w-full mx-4"
//           >
//             {/* Top text for cash cards */}
//             {cardType.includes("K") && (
//               <div className="text-green-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}
              
//               </div>
//             )}
//             {/* Miss flip special text */}
//             {cardType === CARD_TYPES.MISS_FLIP && (
//               <div className="text-purple-400 text-xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//             )}
//             {/* PASS card special text */}
//             {cardType === CARD_TYPES.PASS && (
//               <div className="text-yellow-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//             )}
//             {/* DUD card text */}
//             {cardType === CARD_TYPES.DUD && (
//               <div className="text-gray-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
//             )}

//             {/* Card container */}
//             <div className="relative mb-8">
//               <div className={`bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm `}>
//                 <div className="text-white text-4xl font-bold mb-2">{cardDisplay.Icon}</div>
//               </div>
//             </div>

//             {/* Player name at bottom */}
//             {playerName && (
//               <div className="bg-red-800 text-white px-6 py-3 rounded-lg inline-block font-bold">{playerName}</div>
//             )}

//             {/* Countdown display */}
//             {showCountdown && (
//               <div className="mt-8">
//                 <div className="text-green-400 text-xl font-bold mb-4">Turn switching...</div>
//                 <div className="text-green-400 text-8xl font-bold animate-pulse">{countdownValue}</div>
//               </div>
//             )}
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   // Bonus Modal Component
//   const BonusModal = () => {
//     if (!showBonusModal || !bonusModalInfo) return null

//     return (
//       <AnimatePresence>
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.5, opacity: 0 }}
//             className="text-center max-w-lg w-full mx-4"
//           >
//             <div className="text-purple-400 text-3xl font-bold mb-6">🎯 BONUS FLIP!</div>
//             <div className="relative mb-8">
//               <div className="bg-transparent rounded-3xl p-8 flex justify-center items-center mx-auto max-w-sm">
//                 <BonusFlip width={300} height={300} />
//               </div>
//             </div>
//             <div className="text-white text-xl font-bold mb-4">{bonusModalInfo.playerName} earned an extra flip!</div>
//             <div className="bg-purple-800 text-white px-6 py-3 rounded-lg inline-block font-bold">
//               {bonusModalInfo.playerName}
//             </div>
//           </motion.div>
//         </div>
//       </AnimatePresence>
//     )
//   }

//   // MQTT message handler for viewer screen
//   useEffect(() => {
//     if (!isConnected) return

//     const handleMQTTMessage = (receivedMessage: any) => {
//       if (receivedMessage?.event === "stage3_card_selection") {
//         const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload

//         setFlippingCards((prev) => [...prev, card_index])

//         setTimeout(() => {
//           // Get total revealed cards before this reveal for PASS logic
//           const totalRevealedCards = cards.filter((card) => card.revealed).length

//           setCards((prevCards) => {
//             const newCards = [...prevCards]
//             // Apply PASS logic - PASS is always visible
//             const finalCardType = card_type

//             console.log(`📡 Viewer MQTT: Card ${card_index} revealed as ${card_type} by contestant ${contestant_id}`)

//             newCards[card_index] = {
//               ...newCards[card_index],
//               revealed: true,
//               type: finalCardType,
//               contestant_id: contestant_id,
//               style: finalCardType === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style,
//             }

//             return newCards
//           })

//           // Handle turn switching and special effects based on card type
//           switch (card_type) {
//             case CARD_TYPES.DUD:
//               console.log(`🎯 DUD card revealed, starting turn switch sequence`)
//               // Show DUD modal for 3 seconds, then global timer
//               setRevealedCardInfo({
//                 type: card_type,
//                 index: card_index,
//                 playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
//               })
//               setShowCardRevealModal(true)

//               setTimeout(() => {
//                 setShowCardRevealModal(false)
//                 const otherContestant = remainingContestants.find((c) => c.id !== contestant_id)
//                 console.log(`🎯 Other contestant for turn switch:`, otherContestant)
//                 if (otherContestant) {
//                   console.log(`🎯 Starting global timer for turn switch`)
//                   startGlobalTimer(3, "Turn switching...", otherContestant.name)
//                   setTimeout(() => {
//                     console.log(`🎯 Switching turn to ${otherContestant.id}`)
//                     setCurrentTurn(otherContestant.id)
//                   }, 3000)
//                 }
//               }, 3000)
//               break

//             case CARD_TYPES.BONUS_FLIP:
//               // Current player continues, show modal and start timer
//               const playerName = contestant_name || getContestantName(contestant_id)?.name || "Player"
//               setBonusModalInfo({ playerName, cardIndex: card_index })
//               setShowBonusModal(true)
//               startBonusCardTimer(card_index)

//               // Hide modal after 3 seconds
//               setTimeout(() => {
//                 setShowBonusModal(false)
//               }, 3000)

//               // Show notification
//               setBonusFlipNotification({
//                 show: true,
//                 playerName: playerName,
//                 isCurrentUser: false,
//               })

//               // Hide notification after 3 seconds
//               setTimeout(() => {
//                 setBonusFlipNotification({ show: false, playerName: "", isCurrentUser: false })
//               }, 3000)
//               break

//             case CARD_TYPES.MISS_FLIP:
//               // Show miss flip modal, then global timer
//               setRevealedCardInfo({
//                 type: card_type,
//                 index: card_index,
//                 playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
//               })
//               setShowCardRevealModal(true)

//               setTimeout(() => {
//                 setShowCardRevealModal(false)
//                 const otherContestantForMiss = remainingContestants.find((c) => c.id !== contestant_id)
//                 if (otherContestantForMiss) {
//                   startGlobalTimer(5, `${otherContestantForMiss.name} gets 2 extra flips!`, otherContestantForMiss.name)
//                   setTimeout(() => {
//                     setCurrentTurn(otherContestantForMiss.id)
//                     startMissFlipTimer(otherContestantForMiss.id)
//                   }, 5000)
//                 }
//               }, 3000)
//               break

//             case CARD_TYPES.PASS:
//               // Show PASS modal for 5 seconds before winner modal
//               setRevealedCardInfo({
//                 type: card_type,
//                 index: card_index,
//                 playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
//               })
//               setShowCardRevealModal(true)

//               setTimeout(() => {
//                 setShowCardRevealModal(false)
//                 const finderName = contestant_name || getContestantName(contestant_id)?.name
//                 setPassFinderName(finderName)
//                 setPassFinderIsCurrentUser(false)
//                 setPassFound(true)
//                 setGameEnded(true)
//               }, 5000)
//               break
//           }

//           // Handle miss flip timer decrement
//           if (missFlipTimers[contestant_id]) {
//             setMissFlipTimers((prev) => {
//               const current = prev[contestant_id]
//               if (current && current.flipsRemaining > 1) {
//                 return { ...prev, [contestant_id]: { ...current, flipsRemaining: current.flipsRemaining - 1 } }
//               } else {
//                 // No more extra flips, switch turns
//                 const otherContestant = remainingContestants.find((c) => c.id !== contestant_id)
//                 if (otherContestant) {
//                   setCurrentTurn(otherContestant.id)
//                 }
//                 const newState = { ...prev }
//                 delete newState[contestant_id]
//                 return newState
//               }
//             })
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
//   }, [isConnected, addMessageListener, removeMessageListener, remainingContestants, refetch, cards, missFlipTimers])

//   // Render different card types
//   const renderCard = (card: Card, index: number) => {
//     if (!card.revealed) {
//       return (
//         <PickCardContainer
//           backgroundColor={"transparent"}
//           text={React.createElement(cardIcons[index % 3], {
//             className: "w-[130px] h-[140px]",
//           })}
//           textColor={card.style.textColor}
//           fontFamily={card.style.fontFamily}
//           containerLabel=""
//           className={cn(
//             "transition-transform w-full h-full duration-300 ease-in-out p-0 pointer-events-none cursor-default",
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
//           return <DudCards className="w-[130px] h-full" />
//         case CARD_TYPES.FIVE_K:
//         case CARD_TYPES.TEN_K:
//         case CARD_TYPES.TWENTY_K:
//           return <InstantCashout className="w-[130px] h-full" />
//         case CARD_TYPES.BONUS_FLIP:
//           return <BonusFlip className="w-[130px] h-full" />
//         case CARD_TYPES.MISS_FLIP:
//           return <MissCardFlip className="w-[130px] h-full" />
//         case CARD_TYPES.PASS:
//           return <PassCard className="w-[130px] h-full" />
//         default:
//           return <DudCards className="w-[130px] h-full" />
//       }
//     })()

//     // Add timer overlay for bonus cards
//     if (card.type === CARD_TYPES.BONUS_FLIP && bonusCardTimers[index] > 0) {
//       const playerName = card.contestant_id ? getContestantName(card.contestant_id)?.name : "Unknown"
//       return (
//         <div className="relative">
//           {cardElement}
//           <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg border-2 border-yellow-400">
//             <div className="text-center">
//               <div className="text-yellow-400 text-xs font-bold mb-1">BONUS FLIP</div>
//               <div className="text-yellow-400 text-2xl font-bold animate-pulse">{bonusCardTimers[index]}</div>
//               <div className="text-white text-xs font-bold">{playerName?.split(" ")[0]} can flip again!</div>
//             </div>
//           </div>
//         </div>
//       )
//     }

//     return cardElement
//   }

//   return (
//     <>
//       {/* Global Timer - moved outside main container */}
//       <GlobalTimer />

//       {/* Enhanced Card Reveal Modal */}
//       {showCardRevealModal && revealedCardInfo && (
//         <CardRevealModal
//           cardType={revealedCardInfo.type}
//           amount={revealedCardInfo.amount}
//           playerName={revealedCardInfo.playerName}
//           onClose={() => {
//             setShowCardRevealModal(false)
//             setShowCountdown(false)
//           }}
//         />
//       )}

//       {/* Bonus Flip Notification */}
//       <BonusFlipNotification />

//       {/* Bonus Modal */}
//       <BonusModal />

//       <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
//         {/* Left Sidebar */}
//         <div className="flex flex-col justify-between">
//           <div className="flex justify-center items-center h-3.5 w-full mt-1">
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

//             <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[2rem] overflow-hidden">
//               {/* Animated border */}
//               <div className="absolute inset-0">
//                 <motion.div
//                   className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
//                   style={{
//                     background: `conic-gradient(from 0deg at 50% 50%,
//                       #d91fff 0deg,
//                       #d91fff 120deg,
//                       #00ffff 100deg,
//                       #00ffff 240deg,
//                       #FFD700 220deg,
//                       #FFD700 360deg,
//                       #d91fff 340deg
//                     )`,
//                   }}
//                   animate={{ rotate: [0, 360] }}
//                   transition={{ duration: 4, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
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

//                 {/* Turn Indicator - moved here and always show when not game ended */}
//                 <div className="text-white flex justify-center items-center gap-5 mb-4">
//                   <TurnIndicator />
//                 </div>

//                 {isLoadingContestants ? (
//                   <div className="flex justify-center items-center h-full w-full">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-6 gap-4 justify-items-center items-center">
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
//                           className={cn(
//                             "relative transition-transform h-[140px] w-full flex justify-center items-center",
//                             "cursor-default pointer-events-none opacity-70",
//                             isRecentlyUpdated ? "animate-pulse" : "",
//                           )}
//                         >
//                           <AnimatePresence mode="wait">
//                             <motion.div
//                               key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
//                               initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
//                               animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
//                               transition={{ duration: 0.3, ease: "easeInOut" }}
//                               style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
//                               className="relative w-full h-full flex justify-center items-center"
//                             >
//                               <div className="relative w-full h-full flex justify-center items-center">
//                                 {card.revealed && (
//                                   <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
//                                     <span className="font-bold text-black text-xs bg-white px-2 py-1 rounded">
//                                       {displayName?.split(" ")[0]}
//                                     </span>
//                                   </div>
//                                 )}
//                                 <div className="relative w-full h-full flex justify-center items-center">
//                                   {renderCard(card, index)}
//                                 </div>
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
//           <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} showStage3Reward={true} />
//         </div>

//         {/* Winner Modal for viewer */}
//         {passFound && (
//           <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
//             <StageThreeWinnerModal
//               name={passFinderName}
//               balance={String(
//                 getContestantInfo(Number(remainingContestants.find((c) => c.name === passFinderName)?.id))
//                   ?.actual_balance ?? 0,
//               )}
//               imgUrl={String(
//                 getContestantInfo(Number(remainingContestants.find((c) => c.name === passFinderName)?.id))
//                   ?.contestant_photo_url || "/",
//               )}
//             />
//           </div>
//         )}
//       </div>
//     </>
//   )
// }

// export default Stage3CardSelectionScreens




"use client"
import Logo from "@/app/icons/Logo"
import HeaderTitleContainer from "@/app/shared/HeaderContainer"
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
import { GlowyStrokeText } from "@/components/core"
import { cn } from "@/utils/classNames"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState, useEffect } from "react"
import { useMQTT } from "@/hooks/useMqttService"
import { tokenStorage } from "@/utils/auth"
import PickCardContainer from "@/app/shared/PickCardContainer"
import { useGetGameContestants } from "@/app/admin/misc/api"
import { type Card, CARD_STYLES } from "./CardStyles"
import PickCard1 from "@/app/icons/cards/PickCard1"
import PickCard2 from "@/app/icons/cards/PickCard2"
import PickCard3 from "@/app/icons/cards/PickCard3"
import DudCards from "@/app/icons/cards/DudCard"
import BonusFlip from "@/app/icons/cards/BonusFlip"
import MissCardFlip from "@/app/icons/cards/MissCardFlip"
import PassCard from "@/app/icons/cards/PassCard"
import VersusIcon from "@/app/icons/Versus"
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar"
import StageThreeWinnerModal from "@/app/components/stages/components/StageThreeWinnerModal"
import InstantCashout from "@/app/icons/cards/InstantCashout"
import HustleStages from "@/app/components/stages/components/hustle/HustleStages"
import { useParams } from "next/navigation"
import DudCardWithShadow from "@/app/icons/DudCardWithShadow"
import InstantCashWithShadow from "./InstantCashWithShadow"

const Stage3CardSelectionScreens = () => {
  const user = tokenStorage.getUser()
  const { isConnected, addMessageListener, removeMessageListener } = useMQTT()
  const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number; name: string }>>([])

  // Updated card types
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

  // Add PASS card style
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

  const params = useParams()
  const [passFound, setPassFound] = useState(false)
  const [passFinderName, setPassFinderName] = useState<string>("")
  const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false)

  // Add timer and modal states
  const [bonusCardTimers, setBonusCardTimers] = useState<Record<number, number>>({})
  const [bonusCardIntervals, setBonusCardIntervals] = useState<Record<number, NodeJS.Timeout>>({})
  const [missFlipTimers, setMissFlipTimers] = useState<Record<number, { flipsRemaining: number; timer: number }>>({})
  const [missFlipIntervals, setMissFlipIntervals] = useState<Record<number, NodeJS.Timeout>>({})
  const [showBonusModal, setShowBonusModal] = useState(false)
  const [bonusModalInfo, setBonusModalInfo] = useState<{ playerName: string; cardIndex: number } | null>(null)
  const [showCardRevealModal, setShowCardRevealModal] = useState(false)
  const [revealedCardInfo, setRevealedCardInfo] = useState<{
    type: string
    amount?: number
    index: number
    playerName?: string
  } | null>(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownValue, setCountdownValue] = useState(3)

  // Add global timer states
  const [globalTimer, setGlobalTimer] = useState<{
    show: boolean
    value: number
    message: string
    nextPlayer: string
  }>({ show: false, value: 0, message: "", nextPlayer: "" })
  const [globalTimerInterval, setGlobalTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Add bonus flip notification state
  const [bonusFlipNotification, setBonusFlipNotification] = useState<{
    show: boolean
    playerName: string
    isCurrentUser: boolean
  }>({ show: false, playerName: "", isCurrentUser: false })

  // Create cards with correct distribution: 18 DUD, 3 bonus flip, 2 miss flip, 1 PASS = 24 total
  const [cards, setCards] = useState<Card[]>(() => {
    const cardArray: Card[] = []
    // Add 18 DUD cards
    for (let i = 0; i < 18; i++) {
      cardArray.push({
        type: CARD_TYPES.DUD,
        originalType: CARD_TYPES.DUD,
        revealed: false,
        style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
        contestant_id: null,
      })
    }
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
    // Add 2 miss flip cards
    for (let i = 0; i < 2; i++) {
      cardArray.push({
        type: CARD_TYPES.MISS_FLIP,
        originalType: CARD_TYPES.MISS_FLIP,
        revealed: false,
        style: MISS_FLIP_STYLE,
        contestant_id: null,
      })
    }
    // Add 1 PASS card
    cardArray.push({
      type: CARD_TYPES.PASS,
      originalType: CARD_TYPES.PASS,
      revealed: false,
      style: PASS_CARD_STYLE,
      contestant_id: null,
    })

    // Shuffle the array
    for (let i = cardArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cardArray[i], cardArray[j]] = [cardArray[j], cardArray[i]]
    }

    console.log(`🎯 Viewer Cards created: ${cardArray.length} total`)
    console.log(`DUD: ${cardArray.filter((c) => c.originalType === CARD_TYPES.DUD).length}`)
    console.log(`Bonus flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.BONUS_FLIP).length}`)
    console.log(`Miss flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.MISS_FLIP).length}`)
    console.log(`PASS cards: ${cardArray.filter((c) => c.originalType === CARD_TYPES.PASS).length}`)

    return cardArray
  })

  const [gameEnded, setGameEnded] = useState(false)
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([])
  const [flippingCards, setFlippingCards] = useState<number[]>([])
  const [contestantNames, setContestantNames] = useState<Record<number, string>>({})
  const [currentTurn, setCurrentTurn] = useState<number | null>(null)

  const {
    data: contestantsData,
    isLoading: isLoadingContestants,
    refetch,
  } = useGetGameContestants(Number(params?.episodeId))

  const cardIcons = [PickCard1, PickCard2, PickCard3]

  // Helper function to start bonus card timer
  const startBonusCardTimer = (cardIndex: number) => {
    console.log(`⏰ Starting bonus timer for card ${cardIndex}`)
    setBonusCardTimers((prev) => ({ ...prev, [cardIndex]: 5 }))
    const interval = setInterval(() => {
      setBonusCardTimers((prev) => {
        const newTime = (prev[cardIndex] || 0) - 1
        if (newTime <= 0) {
          console.log(`⏰ Bonus timer finished for card ${cardIndex}`)
          clearInterval(interval)
          setBonusCardIntervals((prev) => {
            const newIntervals = { ...prev }
            delete newIntervals[cardIndex]
            return newIntervals
          })
          return { ...prev, [cardIndex]: 0 }
        }
        return { ...prev, [cardIndex]: newTime }
      })
    }, 1000)
    setBonusCardIntervals((prev) => ({ ...prev, [cardIndex]: interval }))
  }

  // Helper function to start miss flip timer (opponent gets 2 extra flips)
  const startMissFlipTimer = (contestantId: number) => {
    console.log(`⏰ Starting miss flip timer for contestant ${contestantId} - 2 extra flips`)
    setMissFlipTimers((prev) => ({ ...prev, [contestantId]: { flipsRemaining: 2, timer: 10 } }))
    const interval = setInterval(() => {
      setMissFlipTimers((prev) => {
        const current = prev[contestantId]
        if (!current) return prev
        const newTimer = current.timer - 1
        if (newTimer <= 0) {
          console.log(`⏰ Miss flip timer finished for contestant ${contestantId}`)
          clearInterval(interval)
          setMissFlipIntervals((prev) => {
            const newIntervals = { ...prev }
            delete newIntervals[contestantId]
            return newIntervals
          })
          const newState = { ...prev }
          delete newState[contestantId]
          return newState
        }
        return { ...prev, [contestantId]: { ...current, timer: newTimer } }
      })
    }, 1000)
    setMissFlipIntervals((prev) => ({ ...prev, [contestantId]: interval }))
  }

  const startGlobalTimer = (seconds: number, message: string, nextPlayer: string) => {
    console.log(`⏰ Starting global timer: ${seconds}s - ${message}`)
    setGlobalTimer({ show: true, value: seconds, message, nextPlayer })
    if (globalTimerInterval) {
      clearInterval(globalTimerInterval)
    }
    const interval = setInterval(() => {
      setGlobalTimer((prev) => {
        const newValue = prev.value - 1
        if (newValue <= 0) {
          clearInterval(interval)
          setGlobalTimerInterval(null)
          return { show: false, value: 0, message: "", nextPlayer: "" }
        }
        return { ...prev, value: newValue }
      })
    }, 1000)
    setGlobalTimerInterval(interval)
  }

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(bonusCardIntervals).forEach((interval) => {
        clearInterval(interval)
      })
      Object.values(missFlipIntervals).forEach((interval) => {
        clearInterval(interval)
      })
      if (globalTimerInterval) {
        clearInterval(globalTimerInterval)
      }
    }
  }, [bonusCardIntervals, missFlipIntervals, globalTimerInterval])

  // Helper function to get contestant name by ID
  const getContestantName = (contestantId: number): { name: string; balance?: string } => {
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

  // Set remaining contestants
  useEffect(() => {
    console.log(`🎯 Contestants data effect triggered:`, {
      hasData: !!contestantsData?.data,
      dataLength: contestantsData?.data?.length,
    })
    if (!contestantsData?.data) {
      console.log(`🎯 No contestants data available`)
      return
    }

    const remaining = contestantsData.data
      .filter((contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated)
      .map((contestant: any) => ({
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

    // Set initial turn to first contestant if no turn is set
    if (remaining.length >= 1 && currentTurn === null) {
      const firstTurnId = remaining[0].id
      console.log(`🎯 Setting initial turn to contestant ${firstTurnId}`)
      setCurrentTurn(firstTurnId)
    }

    // If current turn contestant is eliminated, switch to next available
    if (currentTurn !== null && !remaining.find((c) => c.id === currentTurn)) {
      const nextTurnId = remaining[0]?.id
      if (nextTurnId) {
        console.log(`🎯 Current turn contestant eliminated, switching to ${nextTurnId}`)
        setCurrentTurn(nextTurnId)
      }
    }
  }, [contestantsData?.data, currentTurn])

  const getContestantInfo = (id: number) => {
    const allContestant = contestantsData?.data?.find((contestant) => Number(contestant.id) === Number(id))
    return allContestant
  }

  // Fixed Turn Indicator Component
  const TurnIndicator = () => {
    console.log(
      `🎯 TurnIndicator: remainingContestants=${remainingContestants.length}, currentTurn=${currentTurn}, passFound=${passFound}`,
    )
    // // Only hide if game actually ended (pass found)
    if (passFound) {
      console.log(`🎯 TurnIndicator hidden: passFound=${passFound}`)
      return null
    }

    // Show loading state if contestants haven't loaded yet
    if (remainingContestants.length === 0) {
      return (
        <div className="flex items-center justify-center gap-6 p-4 w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <span className="text-white">Loading contestants...</span>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center gap-6 p-4 w-full">
        {/* Main container with contestants */}
        <div className="flex items-center justify-center w-full ">
          {remainingContestants?.map((contestant, index) => {
            const missFlipInfo = missFlipTimers[contestant.id]
            const isCurrentTurn = currentTurn === contestant.id
            return (
              <React.Fragment key={contestant.id}>
                {/* Contestant card */}
                <div
                  className={`
                  flex items-center border-[0.5px] border-opacity-70 bg-transparent justify-center gap-4 px-4 py-3 rounded-lg min-w-[200px]
                   ${isCurrentTurn ? " border-[#04DA6A]" : " border-[#EB001B]"}
                `}
                >
                  <div className="flex items-center gap-6">
                    <span
                      className={`
                      font-bold text-2xl capitalize tracking-wide
                      ${isCurrentTurn ? "text-white" : "text-gray-300"}
                    `}
                    >
                      {contestant.name?.split(" ")[0]}
                    </span>
                    {isCurrentTurn && !missFlipInfo && (
                      <div className="flex items-center gap-3 bg-[#053F20] py-[7px] px-4 rounded-xl border border-[#04DA6A]">
                        <span className="text-2xl font-semibold font-verdana text-[#04DA6A]">Your turn</span>
                        <div className="w-3 h-3 rounded-full bg-[#04DA6A] animate-pulse"></div>
                      </div>
                    )}
                    {isCurrentTurn && missFlipInfo && (
                      <div className="flex items-center gap-3 bg-[#4A1A00] py-[7px] px-4 rounded-xl border border-[#FF8C00]">
                        <span className="text-2xl font-semibold font-verdana text-[#FF8C00]">
                          Extra Flips: {missFlipInfo.flipsRemaining}
                        </span>
                        <div className="text-[#FF8C00] text-2xl font-bold">{missFlipInfo.timer}s</div>
                      </div>
                    )}
                    {!isCurrentTurn && (
                      <div className="flex items-center gap-3 bg-[#38040A] py-[7px] px-4 rounded-xl">
                        <span className="text-2xl font-semibold font-verdana text-[#FF495E]">Waiting</span>
                        <div className="w-3 h-3 rounded-full bg-[#FF495E]"></div>
                      </div>
                    )}
                  </div>
                </div>
                {/* VS indicator between contestants */}
                {index === 0 && remainingContestants.length > 1 && (
                  <div className="px-6">
                    <VersusIcon />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  // Enhanced Global Timer Component with better visibility
  const GlobalTimer = () => {
    if (!globalTimer.show || globalTimer.value <= 0) return null

    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-center p-8 "
          >
            {/* <div className="text-white text-3xl font-bold mb-6">{globalTimer.message}</div> */}
            {globalTimer.nextPlayer && (
              <div className="text-green-400 text-2xl font-bold  px-6 py-3 rounded-lg">
                {globalTimer.nextPlayer}'s turn next
              </div>
            )}
            <div className="text-[#04DA6A] text-9xl font-bold animate-pulse mb-4 drop-shadow-lg">
              {globalTimer.value}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  const BonusFlipNotification = () => {
    if (!bonusFlipNotification.show) return null

    return (
      <AnimatePresence>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-gradient-to-r  text-white px-6 py-3 rounded-lg shadow-lg border-2"
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
      </AnimatePresence>
    )
  }

  // Enhanced Card Reveal Modal Component
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
            Icon: <InstantCashWithShadow width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-green-500 to-green-700",
            cardBg: "bg-green-600",
          }
        case CARD_TYPES.TEN_K:
          return {
            title: "+₦10,000",
            Icon: <InstantCashWithShadow width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-green-500 to-green-700",
            cardBg: "bg-green-600",
          }
        case CARD_TYPES.TWENTY_K:
          return {
            title: "+₦20,000",
            Icon: <InstantCashWithShadow width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-green-500 to-green-700",
            cardBg: "bg-green-600",
          }
        case CARD_TYPES.MISS_FLIP:
          return {
            title: `Miss flip revealed!`,
            Icon: <MissCardFlip width={300} height={300} />, // Fixed: Changed from subtitle to Icon
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
            Icon: <DudCardWithShadow width={300} height={300} />,
            bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
            cardBg: "bg-gray-500",
          }
      }
    }

    const cardDisplay = getCardDisplay()

    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-center max-w-lg w-full mx-4"
          >
            {/* Top text for cash cards */}
            {cardType.includes("K") && (
              <div className="text-green-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
            )}
            {/* Miss flip special text */}
            {cardType === CARD_TYPES.MISS_FLIP && (
              <div className="text-purple-400 text-xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
            )}
            {/* PASS card special text */}
            {cardType === CARD_TYPES.PASS && (
              <div className="text-yellow-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
            )}
            {/* DUD card text */}
            {cardType === CARD_TYPES.DUD && (
              <div className="text-gray-400 text-2xl font-bold mb-6 text-shadow-lg">{cardDisplay.title}</div>
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
                <div className="text-green-400 text-xl font-bold mb-4">Turn switching...</div>
                <div className="text-green-400 text-8xl font-bold animate-pulse">{countdownValue}</div>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  // Bonus Modal Component
  const BonusModal = () => {
    if (!showBonusModal || !bonusModalInfo) return null

    return (
      <AnimatePresence>
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
      </AnimatePresence>
    )
  }

  // MQTT message handler for viewer screen
  useEffect(() => {
    if (!isConnected) return

    const handleMQTTMessage = (receivedMessage: any) => {
      if (receivedMessage?.event === "stage3_card_selection") {
        const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload

        setFlippingCards((prev) => [...prev, card_index])

        setTimeout(() => {
          // Get total revealed cards before this reveal for PASS logic
          const totalRevealedCards = cards.filter((card) => card.revealed).length

          setCards((prevCards) => {
            const newCards = [...prevCards]
            // Apply PASS logic - PASS is always visible
            const finalCardType = card_type

            console.log(`📡 Viewer MQTT: Card ${card_index} revealed as ${card_type} by contestant ${contestant_id}`)

            newCards[card_index] = {
              ...newCards[card_index],
              revealed: true,
              type: finalCardType,
              contestant_id: contestant_id,
              style: finalCardType === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style,
            }

            return newCards
          })

          // Handle turn switching and special effects based on card type
          switch (card_type) {
            case CARD_TYPES.FIVE_K:
            case CARD_TYPES.TEN_K:
            case CARD_TYPES.TWENTY_K:
              // Show cash modal for 3 seconds, then continue with same player
              console.log(`💰 Cash card revealed: ${card_type}`)
              setRevealedCardInfo({
                type: card_type,
                index: card_index,
                playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
              })
              setShowCardRevealModal(true)
              setTimeout(() => {
                setShowCardRevealModal(false)
                // Player continues their turn - no turn switch for cash cards
              }, 3000)
              break

            case CARD_TYPES.DUD:
              console.log(`🎯 DUD card revealed, starting turn switch sequence`)
              // Show DUD modal for 3 seconds, then global timer
              setRevealedCardInfo({
                type: card_type,
                index: card_index,
                playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
              })
              setShowCardRevealModal(true)
              setTimeout(() => {
                setShowCardRevealModal(false)
                const otherContestant = remainingContestants.find((c) => c.id !== contestant_id)
                console.log(`🎯 Other contestant for turn switch:`, otherContestant)
                if (otherContestant) {
                  console.log(`🎯 Starting global timer for turn switch`)
                  startGlobalTimer(3, "Turn switching...", otherContestant.name)
                  setTimeout(() => {
                    console.log(`🎯 Switching turn to ${otherContestant.id}`)
                    setCurrentTurn(otherContestant.id)
                  }, 3000)
                }
              }, 3000)
              break

            case CARD_TYPES.BONUS_FLIP:
              // Current player continues, show modal and start timer
              const playerName = contestant_name || getContestantName(contestant_id)?.name || "Player"
              setBonusModalInfo({ playerName, cardIndex: card_index })
              setShowBonusModal(true)
              startBonusCardTimer(card_index)

              // Hide modal after 3 seconds
              setTimeout(() => {
                setShowBonusModal(false)
              }, 3000)

              // Show notification
              setBonusFlipNotification({
                show: true,
                playerName: playerName,
                isCurrentUser: false,
              })

              // Hide notification after 3 seconds
              setTimeout(() => {
                setBonusFlipNotification({ show: false, playerName: "", isCurrentUser: false })
              }, 3000)
              break

            case CARD_TYPES.MISS_FLIP:
              // Show miss flip modal, then global timer
              setRevealedCardInfo({
                type: card_type,
                index: card_index,
                playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
              })
              setShowCardRevealModal(true)
              setTimeout(() => {
                setShowCardRevealModal(false)
                const otherContestantForMiss = remainingContestants.find((c) => c.id !== contestant_id)
                if (otherContestantForMiss) {
                  startGlobalTimer(5, `${otherContestantForMiss.name} gets 2 extra flips!`, otherContestantForMiss.name)
                  setTimeout(() => {
                    setCurrentTurn(otherContestantForMiss.id)
                    startMissFlipTimer(otherContestantForMiss.id)
                  }, 5000)
                }
              }, 3000)
              break

            case CARD_TYPES.PASS:
              // Show PASS modal for 5 seconds before winner modal
              setRevealedCardInfo({
                type: card_type,
                index: card_index,
                playerName: contestant_name || getContestantName(contestant_id)?.name || "Player",
              })
              setShowCardRevealModal(true)
              setTimeout(() => {
                setShowCardRevealModal(false)
                const finderName = contestant_name || getContestantName(contestant_id)?.name
                setPassFinderName(finderName)
                setPassFinderIsCurrentUser(false)
                setPassFound(true)
                setGameEnded(true)
              }, 5000)
              break
          }

          // Handle miss flip timer decrement
          if (missFlipTimers[contestant_id]) {
            setMissFlipTimers((prev) => {
              const current = prev[contestant_id]
              if (current && current.flipsRemaining > 1) {
                return { ...prev, [contestant_id]: { ...current, flipsRemaining: current.flipsRemaining - 1 } }
              } else {
                // No more extra flips, switch turns
                const otherContestant = remainingContestants.find((c) => c.id !== contestant_id)
                if (otherContestant) {
                  setCurrentTurn(otherContestant.id)
                }
                const newState = { ...prev }
                delete newState[contestant_id]
                return newState
              }
            })
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
  }, [isConnected, addMessageListener, removeMessageListener, remainingContestants, refetch, cards, missFlipTimers])

  // Render different card types
  const renderCard = (card: Card, index: number) => {
    if (!card.revealed) {
      return (
        <PickCardContainer
          backgroundColor={"transparent"}
          text={React.createElement(cardIcons[index % 3], {
            className: "w-[130px] h-[140px]",
          })}
          textColor={card.style.textColor}
          fontFamily={card.style.fontFamily}
          containerLabel=""
          className={cn(
            "transition-transform w-full h-full duration-300 ease-in-out p-0 pointer-events-none cursor-default",
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
          return <DudCards className="w-[130px] h-full" />
        case CARD_TYPES.FIVE_K:
        case CARD_TYPES.TEN_K:
        case CARD_TYPES.TWENTY_K:
          return <InstantCashout className="w-[130px] h-full" />
        case CARD_TYPES.BONUS_FLIP:
          return <BonusFlip className="w-[130px] h-full" />
        case CARD_TYPES.MISS_FLIP:
          return <MissCardFlip className="w-[130px] h-full" />
        case CARD_TYPES.PASS:
          return <PassCard className="w-[130px] h-full" />
        default:
          return <DudCards className="w-[130px] h-full" />
      }
    })()

    // Add timer overlay for bonus cards
    if (card.type === CARD_TYPES.BONUS_FLIP && bonusCardTimers[index] > 0) {
      const playerName = card.contestant_id ? getContestantName(card.contestant_id)?.name : "Unknown"
      return (
        <div className="relative">
          {cardElement}
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg border-2 border-yellow-400">
            <div className="text-center">
              <div className="text-yellow-400 text-xs font-bold mb-1">BONUS FLIP</div>
              <div className="text-yellow-400 text-2xl font-bold animate-pulse">{bonusCardTimers[index]}</div>
              <div className="text-white text-xs font-bold">{playerName?.split(" ")[0]} can flip again!</div>
            </div>
          </div>
        </div>
      )
    }

    return cardElement
  }

  return (
    <>
      {/* Global Timer - moved outside main container */}
      <GlobalTimer />

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

      {/* Bonus Flip Notification */}
      <BonusFlipNotification />

      {/* Bonus Modal */}
      <BonusModal />

      <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center h-3.5 w-full mt-1">
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

            <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[2rem] overflow-hidden">
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
                  transition={{ duration: 4, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
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

                {/* Turn Indicator - moved here and always show when not game ended */}
                <div className="text-white flex justify-center items-center gap-5 mb-4">
                  <TurnIndicator />
                </div>

                {isLoadingContestants ? (
                  <div className="flex justify-center items-center h-full w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-4 justify-items-center items-center">
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
                          className={cn(
                            "relative transition-transform h-[140px] w-full flex justify-center items-center",
                            "cursor-default pointer-events-none opacity-70",
                            isRecentlyUpdated ? "animate-bounce" : "",
                          )}
                          style={{
                            animationIterationCount: isRecentlyUpdated ? "1" : "infinite"
                          }}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
                              initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
                              animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                              className="relative w-full h-full flex justify-center items-center"
                            >
                              <div className="relative w-full h-full flex justify-center items-center">
                                {card.revealed && (
                                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
                                    <span className="font-bold text-black text-xs bg-white px-2 py-1 rounded">
                                      {displayName?.split(" ")[0]}
                                    </span>
                                  </div>
                                )}
                                <div className="relative w-full h-full flex justify-center items-center">
                                  {renderCard(card, index)}
                                </div>
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
          <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} showStage3Reward={true} />
        </div>

        {/* Winner Modal for viewer */}
        {passFound && (
          <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
            <StageThreeWinnerModal
              name={passFinderName}
              balance={String(
                getContestantInfo(Number(remainingContestants.find((c) => c.name === passFinderName)?.id))
                  ?.actual_balance ?? 0,
              )}
              imgUrl={String(
                getContestantInfo(Number(remainingContestants.find((c) => c.name === passFinderName)?.id))
                  ?.contestant_photo_url || "/",
              )}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default Stage3CardSelectionScreens
