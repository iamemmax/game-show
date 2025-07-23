


// import Logo from "@/app/icons/Logo";
// import HeaderTitleContainer from "@/app/shared/HeaderContainer";
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
// import { GlowyStrokeText, Button } from "@/components/core";
// import { cn } from "@/utils/classNames";
// import { motion, AnimatePresence } from "framer-motion";
// import React, { useState, useEffect } from "react";
// import HustleSideBar from "../hustle/HustleSideBar";
// import HustleStages from "../hustle/HustleStages";
// import { useMQTT } from "@/hooks/useMqttService";
// import { tokenStorage } from "@/utils/auth";
// import PickCardContainer from "@/app/shared/PickCardContainer";
// import { useErrorModalState } from "@/hooks";
// import { useGetGameContestants } from "@/app/admin/misc/api";
// import { Card, CARD_STYLES, PASS_CARD_STYLE } from "./CardStyles";
// import { useCardSelection } from "../../api/stage3/sendCardSelection";
// import StageThreeWinnerModal from "../StageThreeWinnerModal";
// import PickCard1 from "@/app/icons/cards/PickCard1";
// import PickCard2 from "@/app/icons/cards/PickCard2";
// import PickCard3 from "@/app/icons/cards/PickCard3";
// // import PickCard4 from "@/app/icons/cards/PickCard4";
// import DudCards from "@/app/icons/cards/DudCard";
// import PassCard from "@/app/icons/cards/PassCard";
// import EliminatedModal from "@/app/shared/EliminatedModal";

// const Stage3CardSelection = () => {
//   const user = tokenStorage.getUser();
//   const { isConnected, sendMessage, addMessageListener, removeMessageListener } = useMQTT();
//   const [isEliminated, setIsEliminated] = useState(false);
//   const [remainingContestants, setRemainingContestants] = useState<Array<{id: number, name: string}>>([]);
// const [passRevealThreshold] = useState(() => Math.floor(Math.random() * 10) + 11); // Random between 11–20

//   const {
//     isErrorModalOpen,
//     setErrorModalState,
//     openErrorModalWithMessage,
//     errorModalMessage,
//   } = useErrorModalState();
  
//   const MIN_CARDS_BEFORE_PASS = 10;

//   const CARD_TYPES = {
//     DUD: "DUD",
//     PASS: "PASS"
//   };

//   // Create cards with guaranteed one PASS card
// // / 1. FIXED CARD INITIALIZATION
// const [cards, setCards] = useState<Card[]>(() => {
//   // Create 23 DUD cards
//   const cardArray = Array(23).fill(null).map(() => ({
//     type: CARD_TYPES.DUD,
//     originalType: CARD_TYPES.DUD,
//     revealed: false,
//     style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
//     contestant_id: null
//   }));
  
//   // Add 1 PASS card at random position
//   const passIndex = Math.floor(Math.random() * 24);
//   const passCard = {
//     type: CARD_TYPES.DUD, // Display as DUD initially
//     originalType: CARD_TYPES.PASS, // But it's actually a PASS
//     revealed: false,
//     style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
//     contestant_id: null
//   };
  
//   // Insert pass card
//   cardArray.splice(passIndex, 0, passCard);
  
//   // Ensure exactly 24 cards
//   if (cardArray.length > 24) cardArray.length = 24;
  
//   console.log(`🎯 PASS CARD PLACED AT INDEX: ${passIndex}`);
//   console.log(`Total cards: ${cardArray.length}`);
//   console.log(`Pass cards: ${cardArray.filter(c => c.originalType === CARD_TYPES.PASS).length}`);
  
//   return cardArray;
// });

//   const [passFound, setPassFound] = useState(false);
//   const [attempts, setAttempts] = useState(0);
//   const [passRevealed, setPassRevealed] = useState(false);
//   const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([]);
//   const [isSending, setIsSending] = useState(false);
//   const [flippingCards, setFlippingCards] = useState<number[]>([]);
//   const [contestantNames, setContestantNames] = useState<Record<number, string>>({});
//   const [passFinderName, setPassFinderName] = useState<string>("");
//   const [passFinderBal, setPassFinderBal] = useState<string>("");
//   const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false);
//   const [passCardIndex, setPassCardIndex] = useState<number>(-1);
//   const [currentTurn, setCurrentTurn] = useState<number | null>(null);
//   const [isMyTurn, setIsMyTurn] = useState<boolean>(true);
//   const [otherContestantId, setOtherContestantId] = useState<number | null>(null);
//   const [otherContestantName, setOtherContestantName] = useState<string>("");

//   const { data: contestantsData, isLoading: isLoadingContestants, refetch } = useGetGameContestants(user?.game_episode as number);
// const cardIcons = [PickCard1, PickCard2, PickCard3];


//   // Helper function to get contestant name by ID
//  // Helper function to get contestant name by ID
// const getContestantName = (contestantId: number): { name: string; balance?: string } => {
//   if (contestantId === user?.contestant_id) {
//     return { name: user?.name || "YOU", balance:String(0) };
//   }
  
//   // First try to find in contestantsData (most up-to-date)
//   if (contestantsData?.data) {
//     const contestant = contestantsData.data.find((c: any) => c.id === contestantId);
//     if (contestant?.name) {
//       return {
//         name: contestant.name,
//         balance: contestant?.actual_balance
//       };
//     }
//   }
  
//   // Then try the contestantNames map (cached data)
//   if (contestantNames[contestantId]) {
//     return { name: contestantNames[contestantId], balance: undefined };
//   }
  
//   // Only use fallback if no name is found anywhere
//   return { name: `Contestant ${contestantId}`, balance: undefined };
// };
// // Check elimination status and set remaining contestants
// useEffect(() => {
//   if (!contestantsData?.data || !user?.contestant_id) return;
  
//   const currentContestant = contestantsData.data.find(
//     (contestant: any) => contestant.id === user.contestant_id
//   );
  
//   // Check if current user is eliminated
//   if (currentContestant?.eliminated_stage !== null || currentContestant?.is_eliminated) {
//     setIsEliminated(true);
//   } else {
//     setIsEliminated(false);
//   }
  
//   // Get remaining contestants (not eliminated)
//   const remaining = contestantsData.data
//     .filter((contestant) => 
//       contestant.eliminated_stage === null && !contestant.is_eliminated
//     )
//     .map((contestant) => ({
//       id: contestant.id,
//       name: contestant?.name || `Contestant ${contestant.id}`
//     }));
  
//   setRemainingContestants(remaining);
  
//   // Create contestant names map - only include contestants with actual names
//   const namesMap: Record<number, string> = {};
//   contestantsData.data.forEach((contestant: any) => {
//     if (contestant.id && contestant.name) {
//       namesMap[contestant.id] = contestant.name;    
//     }
//   });
//   setContestantNames(namesMap);
  
// }, [contestantsData?.data, user?.contestant_id]);

//   // Set up turn system for remaining two contestants
//   useEffect(() => {
//     if (!user?.contestant_id || !contestantsData?.data || isEliminated) return;
    
//     const showdownContestants = contestantsData.data.filter(
//       (contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated
//     );
    
//     if (showdownContestants.length === 2) {
//       const otherContestant = showdownContestants.find(
//         (contestant: any) => contestant.id !== user.contestant_id
//       );
      
//       if (otherContestant) {
//         setOtherContestantId(otherContestant.id);
//         setOtherContestantName(otherContestant.name as string);
//       }
      
//       // Lower contestant ID goes first
//       const firstTurnId = Math.min(showdownContestants[0].id, showdownContestants[1].id);
//       setCurrentTurn(firstTurnId);
//       setIsMyTurn(firstTurnId === user.contestant_id);
//     }
//   }, [contestantsData?.data, user?.contestant_id, isEliminated]);
// const getContestantInfo = (id: number) => {
//     const allconstestant = contestantsData?.data?.find(
//       (contestant) => contestant.id === id
//     );
//     return allconstestant;
//   };



//   const TurnIndicator = () => {
//   if (passFound) return null;
  
//   return (
//     <div className="">
    
      
//       {/* Turn Status */}
//       <div className={cn(
//         "mt-2 p-2 rounded-lg text-center",
//         isMyTurn 
//           ? "bg-green-600 bg-opacity-20 border border-green-400" 
//           : "bg-red-600 bg-opacity-20 border border-red-400"
//       )}>
//         <div className="flex items-center justify-center gap-2">
//           <div className={cn(
//             "w-3 h-3 rounded-full animate-pulse",
//             isMyTurn ? "bg-green-400" : "bg-red-400"
//           )}></div>
//           <span className={cn(
//             "font-gilroyBold text-sm",
//             isMyTurn ? "text-green-400" : "text-red-400"
//           )}>
//             {isMyTurn ? "Your turn to flip" : `${otherContestantName}'s turn`}
//           </span>
//           <div className={cn(
//             "w-3 h-3 rounded-full animate-pulse",
//             isMyTurn ? "bg-green-400" : "bg-red-400"
//           )}></div>
//         </div>
//       </div>
//     </div>
//   );
// };
//   // Elimination Modal Component


//   // Celebration Animation Component
//   const CelebrationAnimation = ({ isVisible, finderName, }: { isVisible: boolean, finderBalance:string, finderName?: string }) => {
//     if (!isVisible) return null;

//     return (
//       <div className="">
//    {passFinderIsCurrentUser&&   <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
       
        
//         {/* Celebration content */}
    // {passFinderIsCurrentUser && <StageThreeWinnerModal name={passFinderName} balance={String(getContestantInfo(Number(user?.contestant_id))?.actual_balance ??0)} imgUrl={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ??"/")}/>
// }
          


        
//       </div>}
      
          // {!passFinderIsCurrentUser&&
          // <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">

          //   <EliminatedModal
          //  setShowEliminationModal={()=>setIsEliminated(true)} 
          //  showEliminationModal={true}
          //  balance={Number(getContestantInfo(Number(user?.contestant_id))?.actual_balance)} image_url={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ??"/")}/>
           
          // </div>
          // }
//       </div>
//     );
//   };

//   // MQTT message handler



//   const {mutate:handleCard} = useCardSelection()
//   const sendCardSelection = async (index: number, type: string) => {
//     if (!isConnected || !user?.contestant_id) {
//       openErrorModalWithMessage("Not connected to game server");
//       return;
//     }
    
//     setIsSending(true);
    
//     try {
//       const payload = {
//         event: "stage3_card_selection",
//         payload: {
//           game_episode: user?.game_episode,
//           contestant_id: user?.contestant_id,
//           contestant_name: user?.name,
//           card_index: index,
//           card_type: type
//         }
//       };
      
//       await sendMessage(payload, "stage3_card_selection");
//       handleCard({
//         contestant_id:user?.contestant_id,
//         game_episode:Number(user?.game_episode),
//         pick:type?.toUpperCase()
//       },{
//         onSuccess:()=>{
//           refetch()
//         }
//       })
//     } catch (error) {
//       openErrorModalWithMessage("Failed to send selection");
//     } finally {
//       setIsSending(false);
//     }
//   };
  



// // Replace your handleCardClick function with this improved version:

// const handleCardClick = (index: number) => {
//   // Prevent clicks when not allowed
//   if (
//     cards[index].revealed ||
//     passFound ||
//     isSending ||
//     flippingCards?.length > 0 ||
//     !isMyTurn
//   ) {
//     return;
//   }

  
//   setFlippingCards([index]);
//   const newAttempts = attempts + 1;
//   setAttempts(newAttempts);

//   const clickedCard = cards[index];
//   const isOriginallyPass = clickedCard.originalType === CARD_TYPES.PASS;
//   const revealedCardsCount = cards.filter(card => card.revealed).length;
  
//   // Check if any pass has been found yet
//   const anyPassRevealed = cards.some(card => 
//     card.revealed && card.type === CARD_TYPES.PASS
//   );

 
//   let finalCardType = clickedCard.originalType; // Default to original type

//   // MAIN LOGIC: Determine what to reveal
//   if (isOriginallyPass && !anyPassRevealed) {
//     // Calculate remaining unrevealed cards after this click
//     const cardsRemainingAfterClick = 24 - revealedCardsCount - 1;
    
//     if (newAttempts <= 10) {
//       // Hide pass for first 10 attempts
//       finalCardType = CARD_TYPES.DUD;
//       console.log(`🔒 Hiding pass as DUD (attempt ${newAttempts} ≤ 10)`);
//     } else if (newAttempts >= 11 && newAttempts <= 18 && cardsRemainingAfterClick > 3) {
//       // Progressive reveal chance between attempts 11-18, but ensure we don't run out of cards
//       const attemptInRange = newAttempts - 11; // 0 to 7
//       const baseChance = 0.5; // 50% base chance
//       const bonus = (attemptInRange / 7) * 0.3; // Up to 30% bonus
//       const revealChance = baseChance + bonus; // 50% to 80%
      
//       const shouldRevealPass = Math.random() < revealChance;
//       finalCardType = shouldRevealPass ? CARD_TYPES.PASS : CARD_TYPES.DUD;
      
//       console.log(`🎲 Attempt ${newAttempts}: ${(revealChance * 100).toFixed(1)}% chance → ${finalCardType}`);
//     } else if (cardsRemainingAfterClick <= 3 || newAttempts >= 19) {
//       // CRITICAL: Force reveal if we're running out of cards or after attempt 18
//       finalCardType = CARD_TYPES.PASS;
//       console.log(`⚡ Force revealing pass (cards remaining: ${cardsRemainingAfterClick}, attempt: ${newAttempts})`);
//     } else {
//       // Fallback - reveal the pass
//       finalCardType = CARD_TYPES.PASS;
//       console.log(`⚡ Fallback: revealing pass`);
//     }
//   } else if (!isOriginallyPass && !anyPassRevealed) {
//     // DUD card logic - emergency pass conversion
//     const cardsRemainingAfterClick = 24 - revealedCardsCount - 1;
    
//     if (cardsRemainingAfterClick <= 2) {
//       // EMERGENCY: If we're down to last 2 cards and no pass found, convert this DUD to pass
//       finalCardType = CARD_TYPES.PASS;
//       console.log(`🚨 EMERGENCY: Converting DUD to pass (only ${cardsRemainingAfterClick} cards left)`);
//     } else if (newAttempts >= 16 && newAttempts <= 22 && cardsRemainingAfterClick > 2) {
//       // Regular emergency pass chance for DUD cards
//       const emergencyChance = 0.1 + ((newAttempts - 16) / 6) * 0.2; // 10% to 30%
//       const shouldBecomePass = Math.random() < emergencyChance;
//       finalCardType = shouldBecomePass ? CARD_TYPES.PASS : CARD_TYPES.DUD;
      
//       if (shouldBecomePass) {
//         console.log(`🚨 Emergency pass conversion on DUD (attempt ${newAttempts})`);
//       }
//     } else {
//       finalCardType = CARD_TYPES.DUD;
//     }
//   } else {
//     // Pass already found or other edge cases
//     finalCardType = clickedCard.originalType;
//     console.log(`🔄 Using original type: ${finalCardType}`);
//   }

//   // ULTIMATE SAFETY: Force pass if this is the last unrevealed card and no pass found
//   const cardsRemainingAfterClick = 24 - revealedCardsCount - 1;
//   if (cardsRemainingAfterClick === 0 && !anyPassRevealed) {
//     finalCardType = CARD_TYPES.PASS;
//     console.log(`🆘 LAST CARD SAFETY: This is the final card, forcing pass reveal`);
//   }

//   console.log(`🎯 FINAL DECISION: Card ${index} will be revealed as ${finalCardType}`);

//   // Apply the reveal after animation delay
//   setTimeout(() => {
//     console.log(`🔄 Updating card ${index} to ${finalCardType}`);
    
//     const newCards = [...cards];
//     newCards[index] = {
//       ...newCards[index],
//       revealed: true,
//       type: finalCardType,
//       contestant_id: user?.contestant_id || null,
//       style: finalCardType === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[index].style,
//     };
    
//     setCards(newCards);
//     setFlippingCards([]);
//     setRecentlyUpdated([index]);
    
//     // Handle pass found
//     if (finalCardType === CARD_TYPES.PASS) {
//       console.log(`🎉 PASS FOUND! Setting winner state...`);
//       setPassCardIndex(index);
//       setPassFinderName(user?.name || "You");
//       setPassFinderBal(String(getContestantInfo(Number(user?.contestant_id))?.actual_balance ?? 0));
//       setPassFinderIsCurrentUser(true);
//       setPassRevealed(true);
      
//       // Send to server
//       sendCardSelection(index, finalCardType);
      
//       // Trigger winner state
//       refetch();
//       setTimeout(() => {
//         console.log(`🎊 Setting passFound to true`);
//         setPassFound(true);
//       }, 300);
//     } else {
//       console.log(`💀 DUD revealed, switching turns`);
//       // DUD - switch turns
//       setCurrentTurn(otherContestantId);
//       setIsMyTurn(false);
//       sendCardSelection(index, finalCardType);
//       refetch();
//     }
    
//     // Clear recent update highlight
//     setTimeout(() => setRecentlyUpdated([]), 1000);
//   }, 600);
// };

// // Also add this additional safety check as a useEffect:
// useEffect(() => {
//   const revealedCards = cards.filter(card => card.revealed);
//   const unrevealedCards = cards.filter(card => !card.revealed);
//   const anyPassRevealed = cards.some(card => card.revealed && card.type === CARD_TYPES.PASS);
  
//   // Safety check: if all cards are revealed and no pass found, force convert the last DUD to pass
//   if (revealedCards.length === 24 && !anyPassRevealed && !passFound) {
//     // Find the last revealed DUD and convert it to pass
//     const lastDudIndex = cards.findIndex((card, index) => 
//       card.revealed && card.type === CARD_TYPES.DUD
//     );
    
//     if (lastDudIndex !== -1) {
//       console.log(`🚨 Converting card ${lastDudIndex} from DUD to PASS`);
      
//       setCards(prevCards => {
//         const newCards = [...prevCards];
//         newCards[lastDudIndex] = {
//           ...newCards[lastDudIndex],
//           type: CARD_TYPES.PASS,
//           style: PASS_CARD_STYLE
//         };
//         return newCards;
//       });
      
//       // Set winner state
//       setPassCardIndex(lastDudIndex);
//       setPassFinderName(getContestantName(cards[lastDudIndex].contestant_id || user?.contestant_id || 0)?.name || "Unknown");
//       setPassFinderBal(String(getContestantInfo(Number(user?.contestant_id))?.actual_balance ?? 0));
//       setPassFinderIsCurrentUser(cards[lastDudIndex].contestant_id === user?.contestant_id);
//       setPassRevealed(true);
      
//       setTimeout(() => {
//         setPassFound(true);
//       }, 300);
//     }
//   }
  
//   // Debug logging
//   console.log(`📊 Card Status: ${revealedCards.length}/24 revealed, Pass found: ${anyPassRevealed}, Game ended: ${passFound}`);
  
// }, [cards, user?.contestant_id, passFound, getContestantInfo, getContestantName]);

// // Also improve the MQTT handler to apply the same safety logic:
// useEffect(() => {
//   if (!isConnected) return;
  
//   const handleMQTTMessage = (receivedMessage: any) => {
//     if (receivedMessage?.event === "stage3_card_selection") {
//       const { contestant_id, card_index, card_type: originalCardType, contestant_name } = receivedMessage.payload;
      
//       if (contestant_id === user?.contestant_id) return;
//       setFlippingCards(prev => [...prev, card_index]);
//       const revealedCount = cards.filter(card => card.revealed).length;
//       const anyPassRevealed = cards.some(card => card.revealed && card.type === CARD_TYPES.PASS);
//       const cardsRemainingAfterClick = 24 - revealedCount - 1;
      
//       let card_type = originalCardType;
      
//       // Apply safety logic for other players too
//       if (originalCardType === CARD_TYPES.PASS && !anyPassRevealed) {
//         if (revealedCount < MIN_CARDS_BEFORE_PASS - 1 && cardsRemainingAfterClick > 3) {
//           card_type = CARD_TYPES.DUD;
//         } else {
//           card_type = CARD_TYPES.PASS;
//         }
//       } else if (originalCardType === CARD_TYPES.DUD && !anyPassRevealed && cardsRemainingAfterClick <= 2) {
//         // Emergency conversion for other player's DUD
//         card_type = CARD_TYPES.PASS;
//       }
      
//       setTimeout(() => {
//         setCards(prevCards => {
//           const newCards = [...prevCards];
//           newCards[card_index] = {
//             ...newCards[card_index],
//             revealed: true,
//             type: card_type,
//             contestant_id: contestant_id,
//             style: card_type === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style
//           };
//           return newCards;
//         });
        
//         if (card_type === CARD_TYPES.PASS) {
//           setPassCardIndex(card_index);
//           const finderName = contestant_name || getContestantName(contestant_id)?.name;
//           const finderBalance = getContestantName(contestant_id)?.balance;
          
//           setPassFinderName(finderName);
//           setPassFinderBal(finderBalance as string);
//           setPassFinderIsCurrentUser(false);
          
//           refetch();
//           setTimeout(() => setPassFound(true), 300);
//         } else {
//           setCurrentTurn(user?.contestant_id || null);
//           setIsMyTurn(true);
//           refetch();
//         }
        
//         setFlippingCards(prev => prev.filter(idx => idx !== card_index));
//         setRecentlyUpdated([card_index]);
//         setTimeout(() => setRecentlyUpdated([]), 1000);
//       }, 600);
//     }
//   };
  
//   if (isConnected) {
//     addMessageListener(handleMQTTMessage);
//   }

//   return () => {
//     removeMessageListener(handleMQTTMessage);
//   };
// }, [isConnected, addMessageListener, removeMessageListener, cards, user?.contestant_id, contestantNames, contestantsData?.data, refetch]);


//   // Show elimination modal if user is eliminated
//   if (isEliminated) {
//     return(
//      <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
//         <EliminatedModal
//       setShowEliminationModal={()=>setIsEliminated(true)} 
//       showEliminationModal={true}
//       balance={Number(getContestantInfo(Number(user?.contestant_id))?.actual_balance)} image_url={String(getContestantInfo(Number(user?.contestant_id))?.contestant_photo_url ??"/")}/>
      
//       </div>

//     )
//   }
   
//   return (
//     <>
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
//               text="Pick-Pad"
//               textGradientEnd="#8E17AA"
//               textGradientStart="#8E17AA"
//               borderGradientStart="#f712fc"
//               borderGradientEnd="#e051fe"
//               fontSize={45}
//               fontFamily="Verdana"
//               textStrokeColor="#a219c1"
//               textStrokeWidth={4.4}
//             />
//           </div>

//           <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[65rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
//                     textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
//                     fillColor="#000"
//                   >
//                     Stage 3: Showdown for pass
//                   </GlowyStrokeText>
                  
//                   <div className="text-white flex justify-center   items-center gap-5">
//                     <span className="font-gilroyBold text-[#D5B9FF]  text-sm">
//                       Select business elements you want for your hustle
//                     </span>
//                      {/* New Turn Indicator - placed between header and cards */}
//               {!passFound && <TurnIndicator />}
//                   </div>
//                 </div>
//               </div>

//               {isLoadingContestants ? (
//                 <div className="flex justify-center items-center h-full w-full">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//                 </div>
//               ) : (
//                 <div className="mt-1 grid grid-cols-6 justify-center gap-4">
//                   {cards.map((card, index) => {
//                     const isFlipping = flippingCards.includes(index);
//                     const cardText = card.revealed ? card.type : "?";
//                     const style = card.revealed && card.type === CARD_TYPES.PASS ? PASS_CARD_STYLE : card.style;
//                     const isRecentlyUpdated = recentlyUpdated.includes(index);
//                     const isRevealedPass = card.revealed && card.type === CARD_TYPES.PASS;
                    
//                     // Use the helper function to get the correct display name
//                     let displayName = "";
//                     if (card.revealed && card.contestant_id) {
//                       displayName = getContestantName(card.contestant_id)?.name;
//                     }
                    
//                     return (
//                       <div 
//                         key={index} 
//                         onClick={() => handleCardClick(index)}
//                         className={cn(
//                           "relative transition-transform h-[98px]",
//                           card.revealed ? "cursor-default pointer-events-none opacity-70" : 
//                             isMyTurn ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-80",
//                           (isSending || flippingCards.length > 0) ? "cursor-wait pointer-events-none" : "",
//                           isRecentlyUpdated ? "animate-pulse" : "",
//                           isRevealedPass ? "z-10 opacity-100" : ""
//                         )}
//                         // style={{ perspective: "1000px" }}
//                       >
//                         <AnimatePresence mode="wait">
//                           <motion.div
//                             key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
//                             initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
//                             animate={
//                               isFlipping 
//                                 ? { rotateY: 180, opacity: 0 } 
//                                 : { rotateY: 0, opacity: 1 }
//                             }
//                             transition={{ duration: isRevealedPass ? 0.3 : 0.3, ease: "easeInOut" }}
//                             style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
//                             className="relative"
//                           >
                          
// <div className="relative">
//   {/* This div will sit on top of everything */}
//   {card.revealed && (
//     <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
//       <span className="font-bold text-white text-xs  px-4 py-1 rounded">
//         {displayName?.split(" ")[0]}
//       </span>
//     </div>
//   )}

  
//  <div className="relative w-full h-full">
//               {/* Display contestant name */}
//               {card.revealed && (
//                 <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
//                   <span className="font-bold text-black text-xxs bg-[#fff] px-2 py-1 rounded">
//                     {displayName?.split(" ")[0]}
//                   </span>
//                 </div>
//               )}

//               {/* Render revealed card OR default card */}
//               {card.revealed ? (
//                 card.type === CARD_TYPES.DUD ? (
//                   <DudCards className="w-[103px]" />
//                 ) : (
//                   <PassCard className="w-[103px] " />
//                 )
//               ) : (
//                 <div className="flex flex-col">
//                 <PickCardContainer
//                   backgroundColor={"transparent"}
//                   text={React.createElement(cardIcons[index % 3], {
//                     className: "w-[103px] ",
//                   })}
//                   textColor={style.textColor}
//                   fontFamily={style.fontFamily}
//                   containerLabel=""
//                   className={cn(
//                     "transition-transform w-full h-full duration-300 ease-in-out p-0",
//                     isRecentlyUpdated ? "ring-2 ring-white" : "",
//                     isFlipping ? "shadow-md" : "",
//                     isRevealedPass
//                       ? "ring-2 ring-yellow-400 shadow-md shadow-yellow-400/50"
//                       : ""
//                   )}
//                   textClassName="font-bold text-[1.2rem]"
//                   labelClassName="hidden"
//                 />
//                {/* <p className="text-white"> {card?.type}</p> */}
//                 </div>
//               )}
//             </div>
// </div>

                            
//                           </motion.div>
//                         </AnimatePresence>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Sidebar */}
//       <div>
//         <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} />
//       </div>
      
//       {/* Celebration Animation */}
//       <CelebrationAnimation 
//         isVisible={passFound} 
//         finderName={passFinderIsCurrentUser ? undefined : passFinderName} 
//         finderBalance={String(getContestantInfo(Number(user?.contestant_id))?.actual_balance)}
//       />
      
//       {/* Error Modal */}
//       {isErrorModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-[#13051E] border-2 border-[#D91FFF] p-6 rounded-lg max-w-md">
//             <h3 className="text-white text-xl font-bold mb-4">Error</h3>
//             <p className="text-white mb-4">{errorModalMessage}</p>
//             <Button 
//               onClick={() => setErrorModalState(false)}
//               className="bg-[#D91FFF] text-white hover:bg-[#B017D7]"
//             >
//               Close
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>

//     </>
//   );
// };

// export default Stage3CardSelection;

"use client"

import Logo from "@/app/icons/Logo"
import HeaderTitleContainer from "@/app/shared/HeaderContainer"
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy"
import { GlowyStrokeText, Button } from "@/components/core"
import { cn } from "@/utils/classNames"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState, useEffect } from "react"
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

import PassCard from "@/app/icons/cards/PassCard"
import StageThreeWinnerModal from "../StageThreeWinnerModal"
import { CashCard5k, CashCard10k, CashCard20k, BonusFlipCard, MissFlipCard } from "./CardComponent"

const Stage3CardSelection = () => {
  const user = tokenStorage.getUser()
  const { isConnected, sendMessage, addMessageListener, removeMessageListener } = useMQTT()
  const [isEliminated, setIsEliminated] = useState(false)
  const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number; name: string }>>([])

  const { isErrorModalOpen, setErrorModalState, openErrorModalWithMessage, errorModalMessage } = useErrorModalState()

  // Updated card types
  const CARD_TYPES = {
    DUD: "DUD",
    CASH_5K: "CASH_5K",
    CASH_10K: "CASH_10K",
    CASH_20K: "CASH_20K",
    BONUS_FLIP: "BONUS_FLIP",
    MISS_FLIP: "MISS_FLIP",
    PASS: "PASS",
  }

  // Updated card styles for new types with all required properties
  const CASH_5K_STYLE = {
    backgroundColor: "#004400",
    rayColor: "#00FF00",
    innerCircleColor: "#006600",
    textColor: "#00FF00",
    cornerColor: "#00AA00",
    fontFamily: "Arial",
    fontSize: 16,
    labelBackgroundColor: "#002200",
    textStrokeWidth: 1,
    textStrokeColor: "#003300",
  }

  const CASH_10K_STYLE = {
    backgroundColor: "#444400",
    rayColor: "#FFD700",
    innerCircleColor: "#666600",
    textColor: "#FFD700",
    cornerColor: "#AAAA00",
    fontFamily: "Arial",
    fontSize: 16,
    labelBackgroundColor: "#222200",
    textStrokeWidth: 1,
    textStrokeColor: "#333300",
  }

  const CASH_20K_STYLE = {
    backgroundColor: "#440000",
    rayColor: "#FF6B35",
    innerCircleColor: "#660000",
    textColor: "#FF6B35",
    cornerColor: "#AA0000",
    fontFamily: "Arial",
    fontSize: 16,
    labelBackgroundColor: "#220000",
    textStrokeWidth: 1,
    textStrokeColor: "#330000",
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

  const [passFound, setPassFound] = useState(false)
  const [passFinderName, setPassFinderName] = useState<string>("")
  const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false)

  // Create cards with new distribution: 12 DUD, 3 cash (5k,10k,20k), 3 bonus flip, 2 miss flip, 1 PASS = 21 total
  const [cards, setCards] = useState<Card[]>(() => {
    const cardArray: Card[] = []

    // Add 12 DUD cards (reduced to make 21 total)
    for (let i = 0; i < 12; i++) {
      cardArray.push({
        type: CARD_TYPES.DUD,
        originalType: CARD_TYPES.DUD,
        revealed: false,
        style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
        contestant_id: null,
      })
    }

    // Add 3 instant cash cards (5k, 10k, 20k)
    cardArray.push({
      type: CARD_TYPES.CASH_5K,
      originalType: CARD_TYPES.CASH_5K,
      revealed: false,
      style: CASH_5K_STYLE,
      contestant_id: null,
    })

    cardArray.push({
      type: CARD_TYPES.CASH_10K,
      originalType: CARD_TYPES.CASH_10K,
      revealed: false,
      style: CASH_10K_STYLE,
      contestant_id: null,
    })

    cardArray.push({
      type: CARD_TYPES.CASH_20K,
      originalType: CARD_TYPES.CASH_20K,
      revealed: false,
      style: CASH_20K_STYLE,
      contestant_id: null,
    })

    // Add 3 bonus flip cards
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

    console.log(`🎯 Cards created: ${cardArray.length} total`)
    console.log(`DUD: ${cardArray.filter((c) => c.originalType === CARD_TYPES.DUD).length}`)
    console.log(`Instant Cash cards: ${cardArray.filter((c) => c.originalType.includes("CASH")).length}`)
    console.log(`Bonus flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.BONUS_FLIP).length}`)
    console.log(`Miss flips: ${cardArray.filter((c) => c.originalType === CARD_TYPES.MISS_FLIP).length}`)
    console.log(`PASS cards: ${cardArray.filter((c) => c.originalType === CARD_TYPES.PASS).length}`)

    // Log where the PASS card is located
    const passIndex = cardArray.findIndex((card) => card.originalType === CARD_TYPES.PASS)
    console.log(`🎯 PASS card is at index: ${passIndex}`)

    return cardArray
  })

  const [gameEnded, setGameEnded] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([])
  const [isSending, setIsSending] = useState(false)
  const [flippingCards, setFlippingCards] = useState<number[]>([])
  const [contestantNames, setContestantNames] = useState<Record<number, string>>({})
  const [currentTurn, setCurrentTurn] = useState<number | null>(null)
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true)
  const [otherContestantId, setOtherContestantId] = useState<number | null>(null)
  const [otherContestantName, setOtherContestantName] = useState<string>("")
  const [playerCash, setPlayerCash] = useState<Record<number, number>>({})
  const [showCashModal, setShowCashModal] = useState(false)
  const [lastCashWon, setLastCashWon] = useState<number>(0)

  const {
    data: contestantsData,
    isLoading: isLoadingContestants,
    refetch,
  } = useGetGameContestants(user?.game_episode as number)

  const cardIcons = [PickCard1, PickCard2, PickCard3]

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

  // Set up turn system for remaining contestants
  useEffect(() => {
    if (!user?.contestant_id || !contestantsData?.data || isEliminated) return

    const showdownContestants = contestantsData.data.filter(
      (contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated,
    )

    if (showdownContestants.length >= 2) {
      const otherContestant = showdownContestants.find((contestant: any) => contestant.id !== user.contestant_id)

      if (otherContestant) {
        setOtherContestantId(otherContestant.id)
        setOtherContestantName(otherContestant.name as string)
      }

      // Lower contestant ID goes first (unless they have bonus flips)
      const firstTurnId = Math.min(showdownContestants[0].id, showdownContestants[1].id)
      setCurrentTurn(firstTurnId)
      setIsMyTurn(firstTurnId === user.contestant_id)
    }
  }, [contestantsData?.data, user?.contestant_id, isEliminated])

  const getContestantInfo = (id: number) => {
    const allContestant = contestantsData?.data?.find((contestant) => contestant.id === id)
    return allContestant
  }

  // Update the TurnIndicator component to remove bonus flip display:
  const TurnIndicator = () => {
    if (gameEnded) return null

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
            <div className={cn("w-3 h-3 rounded-full animate-pulse", isMyTurn ? "bg-green-400" : "bg-red-400")}></div>
            <span className={cn("font-gilroyBold text-sm", isMyTurn ? "text-green-400" : "text-red-400")}>
              {isMyTurn ? "Your turn to flip" : `${otherContestantName}'s turn`}
            </span>
            <div className={cn("w-3 h-3 rounded-full animate-pulse", isMyTurn ? "bg-green-400" : "bg-red-400")}></div>
          </div>
        </div>
      </div>
    )
  }

  // Cash Modal Component
  const CashModal = ({ amount, onClose }: { amount: number; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-8 rounded-lg text-center">
        <h2 className="text-4xl font-bold text-black mb-4">🎉 CASH WON! 🎉</h2>
        <p className="text-6xl font-bold text-green-800 mb-4">${amount.toLocaleString()}</p>
        <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
          Continue Game
        </Button>
      </div>
    </div>
  )

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
    // Prevent clicks when not allowed
    if (cards[index].revealed || gameEnded || passFound || isSending || flippingCards?.length > 0 || !isMyTurn) {
      return
    }

    setFlippingCards([index])
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    const clickedCard = cards[index]

    // Apply the reveal after animation delay
    setTimeout(() => {
      const totalRevealedCards = cards.filter((card) => card.revealed).length

      // PASS LOGIC: Make PASS available immediately after 10 total picks
      let finalCardType = clickedCard.originalType

      if (clickedCard.originalType === CARD_TYPES.PASS) {
        if (totalRevealedCards >= 10) {
          // Reveal the PASS immediately if 10+ cards have been revealed total
          finalCardType = CARD_TYPES.PASS
          console.log(`🎉 PASS card revealed! (${totalRevealedCards} total cards revealed)`)
        } else {
          // Hide the PASS as a DUD if less than 10 cards revealed total
          finalCardType = CARD_TYPES.DUD
          console.log(`🔒 PASS card hidden as DUD (only ${totalRevealedCards} total cards revealed, need 10+)`)
        }
      }

      console.log(
        `🎯 Card ${index}: Original=${clickedCard.originalType}, Final=${finalCardType}, Total revealed=${totalRevealedCards}`,
      )

      const newCards = [...cards]
      newCards[index] = {
        ...newCards[index],
        revealed: true,
        type: finalCardType,
        contestant_id: user?.contestant_id || null,
        style: finalCardType === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[index].style,
      }

      setCards(newCards)
      setFlippingCards([])
      setRecentlyUpdated([index])

      // Handle different card types based on FINAL type
      switch (finalCardType) {
        case CARD_TYPES.DUD:
          console.log(`💀 DUD revealed, switching turns`)
          setCurrentTurn(otherContestantId)
          setIsMyTurn(false)
          sendCardSelection(index, finalCardType)
          break

        case CARD_TYPES.CASH_5K:
        case CARD_TYPES.CASH_10K:
        case CARD_TYPES.CASH_20K:
          const cashAmount =
            finalCardType === CARD_TYPES.CASH_5K ? 5000 : finalCardType === CARD_TYPES.CASH_10K ? 10000 : 20000

          console.log(`💰 Instant cash card revealed: $${cashAmount}, switching turns`)
          setPlayerCash((prev) => ({
            ...prev,
            [user?.contestant_id || 0]: (prev[user?.contestant_id || 0] || 0) + cashAmount,
          }))
          setLastCashWon(cashAmount)
          setShowCashModal(true)

          // Switch turns after instant cash (opponent gets to pick next)
          setCurrentTurn(otherContestantId)
          setIsMyTurn(false)
          sendCardSelection(index, finalCardType)
          break

        case CARD_TYPES.BONUS_FLIP:
          console.log(`🎯 Bonus flip revealed! Player gets to flip again`)
          sendCardSelection(index, finalCardType)
          break

        case CARD_TYPES.MISS_FLIP:
          console.log(`❌ Miss flip revealed! Turn switches to opponent`)
          setCurrentTurn(otherContestantId)
          setIsMyTurn(false)
          sendCardSelection(index, finalCardType)
          break

        case CARD_TYPES.PASS:
          console.log(`🏆 PASS card found! Game winner!`)
          setPassFinderName(user?.name || "You")
          setPassFinderIsCurrentUser(true)
          setPassFound(true)
          setGameEnded(true)
          sendCardSelection(index, finalCardType)
          break

        default:
          console.log(`❓ Unknown card type: ${finalCardType}`)
          setCurrentTurn(otherContestantId)
          setIsMyTurn(false)
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

  // MQTT message handler
  useEffect(() => {
    if (!isConnected) return

    const handleMQTTMessage = (receivedMessage: any) => {
      if (receivedMessage?.event === "stage3_card_selection") {
        const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload

        if (contestant_id === user?.contestant_id) return

        setFlippingCards((prev) => [...prev, card_index])

        setTimeout(() => {
          setCards((prevCards) => {
            const newCards = [...prevCards]
            // IMPORTANT: Set the card type to exactly what was sent via MQTT
            newCards[card_index] = {
              ...newCards[card_index],
              revealed: true,
              type: card_type, // Use the exact type from MQTT message
              contestant_id: contestant_id,
              style: card_type === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style,
            }
            return newCards
          })

          console.log(`📡 MQTT: Opponent revealed card ${card_index} as ${card_type}`)

          // Handle opponent's card reveal based on the received card type
          switch (card_type) {
            case CARD_TYPES.DUD:
              console.log(`💀 Opponent revealed DUD, switching to my turn`)
              setCurrentTurn(user?.contestant_id || null)
              setIsMyTurn(true)
              break

            case CARD_TYPES.CASH_5K:
            case CARD_TYPES.CASH_10K:
            case CARD_TYPES.CASH_20K:
              const cashAmount =
                card_type === CARD_TYPES.CASH_5K ? 5000 : card_type === CARD_TYPES.CASH_10K ? 10000 : 20000

              console.log(`💰 Opponent won $${cashAmount}, switching to my turn`)
              setPlayerCash((prev) => ({
                ...prev,
                [contestant_id]: (prev[contestant_id] || 0) + cashAmount,
              }))
              // Switch to my turn after opponent gets cash
              setCurrentTurn(user?.contestant_id || null)
              setIsMyTurn(true)
              break

            case CARD_TYPES.BONUS_FLIP:
              console.log(`🎯 Opponent got bonus flip, they continue`)
              break

            case CARD_TYPES.MISS_FLIP:
              console.log(`❌ Opponent hit miss flip, switching to my turn`)
              setCurrentTurn(user?.contestant_id || null)
              setIsMyTurn(true)
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
              setCurrentTurn(user?.contestant_id || null)
              setIsMyTurn(true)
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
  }, [isConnected, addMessageListener, removeMessageListener, user?.contestant_id, refetch])

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
    switch (card.type) {
      case CARD_TYPES.DUD:
        return <DudCards className="w-[103px]" />
      case CARD_TYPES.CASH_5K:
        return <CashCard5k className="w-[103px]" />
      case CARD_TYPES.CASH_10K:
        return <CashCard10k className="w-[103px]" />
      case CARD_TYPES.CASH_20K:
        return <CashCard20k className="w-[103px]" />
      case CARD_TYPES.BONUS_FLIP:
        return <BonusFlipCard className="w-[103px]" />
      case CARD_TYPES.MISS_FLIP:
        return <MissFlipCard className="w-[103px]" />
      case CARD_TYPES.PASS:
        return <PassCard className="w-[103px]" />
      default:
        return <DudCards className="w-[103px]" />
    }
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

                    <div className="text-white flex justify-center items-center gap-5">
                      <span className="font-gilroyBold text-[#D5B9FF] text-sm">
                        Collect instant cash, bonus flips, and avoid miss flips!
                      </span>
                      {!gameEnded && <TurnIndicator />}
                    </div>

                    {/* Player cash display */}
                    {/* <div className="mt-2 flex gap-4 text-white">
                      <div className="bg-green-600 bg-opacity-20 border border-green-400 px-4 py-2 rounded">
                        Your Cash: ${(playerCash[user?.contestant_id || 0] || 0).toLocaleString()}
                      </div>
                      {otherContestantId && (
                        <div className="bg-blue-600 bg-opacity-20 border border-blue-400 px-4 py-2 rounded">
                          {otherContestantName}: ${(playerCash[otherContestantId] || 0).toLocaleString()}
                        </div>
                      )}
                    </div> */}

                    {/* Debug: Cards revealed counter */}
                    {/* <div className="mt-2 text-center">
                      <span className="text-yellow-400 text-sm">
                        Cards Revealed: {cards.filter((card) => card.revealed).length}/21
                        {cards.filter((card) => card.revealed).length >= 10 ? " (PASS available)" : " (PASS locked)"}
                      </span>
                    </div> */}
                  </div>
                </div>

                {isLoadingContestants ? (
                  <div className="flex justify-center items-center h-full w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-7 justify-center gap-4">
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
                            "relative transition-transform h-[98px]",
                            card.revealed
                              ? "cursor-default pointer-events-none opacity-70"
                              : isMyTurn
                                ? "cursor-pointer hover:scale-105"
                                : "cursor-not-allowed opacity-80",
                            isSending || flippingCards.length > 0 ? "cursor-wait pointer-events-none" : "",
                            isRecentlyUpdated ? "animate-pulse" : "",
                          )}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
                              initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
                              animate={isFlipping ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
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

        {/* Cash Modal */}
        {showCashModal && <CashModal amount={lastCashWon} onClose={() => setShowCashModal(false)} />}

        {/* Error Modal */}
        {isErrorModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#13051E] border-2 border-[#D91FFF] p-6 rounded-lg max-w-md">
              <h3 className="text-white text-xl font-bold mb-4">Error</h3>
              <p className="text-white mb-4">{errorModalMessage}</p>
              <Button onClick={() => setErrorModalState(false)} className="bg-[#D91FFF] text-white hover:bg-[#B017D7]">
                Close
              </Button>
            </div>
          </div>
        )}

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
      </div>
    </>
  )
}

export default Stage3CardSelection
