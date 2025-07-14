


import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { GlowyStrokeText, Button } from "@/components/core";
import { cn } from "@/utils/classNames";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import HustleSideBar from "../hustle/HustleSideBar";
import HustleStages from "../hustle/HustleStages";
import { useMQTT } from "@/hooks/useMqttService";
import { tokenStorage } from "@/utils/auth";
import PickCardContainer from "@/app/shared/PickCardContainer";
import { useErrorModalState } from "@/hooks";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { Card, CARD_STYLES, PASS_CARD_STYLE } from "./CardStyles";
import GameResultModal from "../ResultBalnceModal";
import { useCardSelection } from "../../api/stage3/sendCardSelection";
import StageThreeWinnerModal from "../StageThreeWinnerModal";

const Stage3CardSelection = () => {
  const user = tokenStorage.getUser();
  const { isConnected, sendMessage, onMessage } = useMQTT();
  const [isEliminated, setIsEliminated] = useState(false);
  const [remainingContestants, setRemainingContestants] = useState<Array<{id: number, name: string}>>([]);

  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  
  const MIN_CARDS_BEFORE_PASS = 10;

  const CARD_TYPES = {
    DUD: "DUD",
    PASS: "PASS"
  };

  // Create cards with guaranteed one PASS card
  const [cards, setCards] = useState<Card[]>(() => {
    const cardArray = Array(23).fill(null).map(() => ({
      type: CARD_TYPES.DUD,
      originalType: CARD_TYPES.DUD,
      revealed: false,
      style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
      contestant_id: null
    }));
    
    const passIndex = Math.floor(Math.random() * 24);
    const passCard = {
      type: CARD_TYPES.PASS,
      originalType: CARD_TYPES.PASS,
      revealed: false,
      style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
      contestant_id: null
    };
    
    cardArray.splice(passIndex, 0, passCard);
    if (cardArray.length > 24) cardArray.length = 24;
    
    return cardArray;
  });

  const [passFound, setPassFound] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [passRevealed, setPassRevealed] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [flippingCards, setFlippingCards] = useState<number[]>([]);
  const [contestantNames, setContestantNames] = useState<Record<number, string>>({});
  const [passFinderName, setPassFinderName] = useState<string>("");
  const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false);
  const [passCardIndex, setPassCardIndex] = useState<number>(-1);
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true);
  const [otherContestantId, setOtherContestantId] = useState<number | null>(null);
  const [otherContestantName, setOtherContestantName] = useState<string>("");

  const { data: contestantsData, isLoading: isLoadingContestants, refetch } = useGetGameContestants(user?.game_episode as number);


  const getUserName = (id:number)=>{
  const contestn = contestantsData?.data?.find((x)=>x?.id === Number(id))
  return contestn?.name
}



  // Helper function to get contestant name by ID
 // Helper function to get contestant name by ID
const getContestantName = (contestantId: number): string => {
  if (contestantId === user?.contestant_id) {
    return user?.name || "YOU";
  }
  
  // First try to find in contestantsData (most up-to-date)
  if (contestantsData?.data) {
    const contestant = contestantsData.data.find((c: any) => c.id === contestantId);
    if (contestant?.name) {
      return contestant.name;
    }
  }
  
  // Then try the contestantNames map (cached data)
  if (contestantNames[contestantId]) {
    return contestantNames[contestantId];
  }
  
  // Only use fallback if no name is found anywhere
  return `Contestant  ${contestantId}`;
};

// Check elimination status and set remaining contestants
useEffect(() => {
  if (!contestantsData?.data || !user?.contestant_id) return;
  
  const currentContestant = contestantsData.data.find(
    (contestant: any) => contestant.id === user.contestant_id
  );
  
  // Check if current user is eliminated
  if (currentContestant?.eliminated_stage !== null || currentContestant?.is_eliminated) {
    setIsEliminated(true);
  } else {
    setIsEliminated(false);
  }
  
  // Get remaining contestants (not eliminated)
  const remaining = contestantsData.data
    .filter((contestant: any) => 
      contestant.eliminated_stage === null && !contestant.is_eliminated
    )
    .map((contestant: any) => ({
      id: contestant.id,
      name: contestant?.name || ` ${contestant.name}`
    }));
  
  setRemainingContestants(remaining);
  
  // Create contestant names map - only include contestants with actual names
  const namesMap: Record<number, string> = {};
  contestantsData.data.forEach((contestant: any) => {
    if (contestant.id && contestant.name) {
      namesMap[contestant.id] = contestant.name;
    }
  });
  setContestantNames(namesMap);
  
}, [contestantsData?.data, user?.contestant_id]);

  // Set up turn system for remaining two contestants
  useEffect(() => {
    if (!user?.contestant_id || !contestantsData?.data || isEliminated) return;
    
    const showdownContestants = contestantsData.data.filter(
      (contestant: any) => contestant.eliminated_stage === null && !contestant.is_eliminated
    );
    
    if (showdownContestants.length === 2) {
      const otherContestant = showdownContestants.find(
        (contestant: any) => contestant.id !== user.contestant_id
      );
      
      if (otherContestant) {
        setOtherContestantId(otherContestant.id);
        setOtherContestantName(otherContestant.name as string);
      }
      
      // Lower contestant ID goes first
      const firstTurnId = Math.min(showdownContestants[0].id, showdownContestants[1].id);
      setCurrentTurn(firstTurnId);
      setIsMyTurn(firstTurnId === user.contestant_id);
    }
  }, [contestantsData?.data, user?.contestant_id, isEliminated]);




  const TurnIndicator = () => {
  if (passFound) return null;
  
  return (
    <div className="">
    
      
      {/* Turn Status */}
      <div className={cn(
        "mt-2 p-2 rounded-lg text-center",
        isMyTurn 
          ? "bg-green-600 bg-opacity-20 border border-green-400" 
          : "bg-red-600 bg-opacity-20 border border-red-400"
      )}>
        <div className="flex items-center justify-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            isMyTurn ? "bg-green-400" : "bg-red-400"
          )}></div>
          <span className={cn(
            "font-gilroyBold text-sm",
            isMyTurn ? "text-green-400" : "text-red-400"
          )}>
            {isMyTurn ? "Your turn to flip" : `${otherContestantName}'s turn`}
          </span>
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            isMyTurn ? "bg-green-400" : "bg-red-400"
          )}></div>
        </div>
      </div>
    </div>
  );
};
  // Elimination Modal Component
  const EliminationModal = () => {
    if (!isEliminated) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-[#13051E] border-4 border-red-500 p-8 rounded-lg max-w-lg mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-red-400 text-3xl font-bold mb-4 font-gilroyBold">
              You've Been Eliminated!
            </h2>
            <p className="text-white text-lg mb-6">
              Unfortunately, you were eliminated in a previous stage and cannot participate in the showdown.
            </p>
            
            {remainingContestants.length === 2 && (
              <div className="mb-6">
                <h3 className="text-yellow-400 text-xl font-bold mb-3">
                  Final Showdown Contestants:
                </h3>
                <div className="flex justify-center gap-4">
                  {remainingContestants.map((contestant) => (
                    <div key={contestant.id} className="bg-purple-900 p-3 rounded-lg border border-purple-500">
                      <span className="text-white font-semibold">{contestant.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-red-500 text-white hover:bg-red-600 px-6 py-2"
            >
              Return to Main Menu
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Celebration Animation Component
  const CelebrationAnimation = ({ isVisible, finderName }: { isVisible: boolean, finderName?: string }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Ribbons falling from top */}
        <div className="absolute inset-0 !z-[999999999999999999]" key={""}>
          {Array.from({ length: 40 }).map((_, i) => {
            const width = Math.random() * 8 + 4;
            const height = Math.random() * 200 + 100;
            const color = ["#FFD700", "#FF6B6B", "#4ECDC4", "#FF8C42", "#A78BFA", "#34D399", "#F472B6"][
              Math.floor(Math.random() * 7)
            ];
            const startX = Math.random() * 100;
            const waveAmplitude = Math.random() * 100 + 50;
            const waveSpeed = Math.random() * 2 + 1;
            
            return (
             <EliminationModal/>
            );
          })}
        </div>
        
        {/* Celebration content */}
    {passFinderIsCurrentUser && <StageThreeWinnerModal/>
}
          


        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative">
            <motion.div
              className="w-48 h-48 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-7xl">🎉</span>
              <span className="text-7xl absolute">🙌</span>
            </motion.div>
          </div>
          
          {!passFinderIsCurrentUser&&<div className="mt-8 text-center">
           
            
            <motion.div
              className="bg-black bg-opacity-70 p-4 rounded-lg mt-4 border-2 border-yellow-400"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <p className="text-white text-xl mb-2">Winner:</p>
              <p className="text-yellow-400 text-3xl font-gilroyBold">
                { passFinderName}
              </p>
              <p className="text-white text-lg mt-4">
                {`${passFinderName} found the PASS card!`}
              </p>
            </motion.div>
          </div>}
        </div>
      </div>
    );
  };

  // MQTT message handler
  useEffect(() => {
    if (!isConnected) return;
    
    const handler = (receivedMessage: any) => {
      if (receivedMessage?.event === "stage3_card_selection") {
        const { contestant_id, card_index, card_type: originalCardType, contestant_name } = receivedMessage.payload;
        
        if (contestant_id === user?.contestant_id) return;
                
        setFlippingCards(prev => [...prev, card_index]);
        
        const revealedCount = cards.filter(card => card.revealed).length;
        let card_type = originalCardType;
        
        if (originalCardType === CARD_TYPES.PASS && revealedCount < MIN_CARDS_BEFORE_PASS - 1) {
          card_type = CARD_TYPES.DUD;
        }
        
        setTimeout(() => {
          setCards(prevCards => {
            const newCards = [...prevCards];
            newCards[card_index] = {
              ...newCards[card_index],
              revealed: true,
              type: card_type,
              contestant_id: contestant_id,
              style: card_type === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style
            };
            return newCards;
          });
          
          if (card_type === CARD_TYPES.PASS) {
            setPassCardIndex(card_index);
          }
          
          setFlippingCards(prev => prev.filter(idx => idx !== card_index));
          setRecentlyUpdated([card_index]);
          setTimeout(() => setRecentlyUpdated([]), 1000);
          
          if (card_type === CARD_TYPES.PASS) {
            // Use the helper function to get the correct name
            const finderName = contestant_name || getContestantName(contestant_id);
            setPassFinderName(finderName);
            setPassFinderIsCurrentUser(false);
            refetch()
            setTimeout(() => setPassFound(true), 300);
          } else {
            setCurrentTurn(user?.contestant_id || null);
            setIsMyTurn(true);
          }
        }, 600);
      }
    };
    
    onMessage(handler);
  }, [isConnected, onMessage, cards, user?.contestant_id, contestantNames, contestantsData?.data]);

  // Send card selection


  const {mutate:handleCard} = useCardSelection()
  const sendCardSelection = async (index: number, type: string) => {
    if (!isConnected || !user?.contestant_id) {
      openErrorModalWithMessage("Not connected to game server");
      return;
    }
    
    setIsSending(true);
    
    try {
      const payload = {
        event: "stage3_card_selection",
        payload: {
          game_episode: user?.game_episode,
          contestant_id: user?.contestant_id,
          contestant_name: user?.name,
          card_index: index,
          card_type: type
        }
      };
      
      await sendMessage(payload, "stage3_card_selection");
      handleCard({
        contestant_id:user?.contestant_id,
        game_episode:Number(user?.game_episode),
        pick:type?.toUpperCase()
      })
    } catch (error) {
      openErrorModalWithMessage("Failed to send selection");
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle card click
  const handleCardClick = (index: number) => {
    if (cards[index].revealed || passFound || isSending || flippingCards.length > 0 || !isMyTurn) {
      return;
    }
    
    setFlippingCards([index]);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    const originalCardType = cards[index].originalType;
    const revealedCount = cards.filter(card => card.revealed).length;
    const isLastCard = revealedCount === 23;
    
    let revealedType = originalCardType;
    
    if (originalCardType === CARD_TYPES.PASS) {
      if (revealedCount >= MIN_CARDS_BEFORE_PASS - 1 || isLastCard) {
        revealedType = CARD_TYPES.PASS;
      } else {
        revealedType = CARD_TYPES.DUD;
      }
    } else if (isLastCard) {
      revealedType = CARD_TYPES.PASS;
    }
    
    setTimeout(() => {
      const newCards = [...cards];
      newCards[index] = {
        ...newCards[index],
        revealed: true,
        type: revealedType,
        contestant_id: user?.contestant_id || null,
        style: revealedType === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[index].style
      };
      setCards(newCards);
      
      if (revealedType === CARD_TYPES.PASS) {
        setPassCardIndex(index);
      }
      
      sendCardSelection(index, revealedType);
      setFlippingCards([]);
      
      if (revealedType === CARD_TYPES.PASS) {
        setPassFinderName(user?.name || "You");
        setPassFinderIsCurrentUser(true);
        setPassRevealed(true);
        setTimeout(() => setPassFound(true), 300);
      } else {
        setCurrentTurn(otherContestantId);
        setIsMyTurn(false);
      }
    }, 600);
  };

  

  // Show elimination modal if user is eliminated
  if (isEliminated) {
    return <EliminationModal />;
  }



//  {open&&}
   
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
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
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
                    Stage 3: Showdown for pass
                  </GlowyStrokeText>
                  
                  <div className="text-white flex justify-center   items-center gap-5">
                    <span className="font-gilroyBold text-[#D5B9FF]  text-sm">
                      Select business elements you want for your hustle
                    </span>
                     {/* New Turn Indicator - placed between header and cards */}
              {!passFound && <TurnIndicator />}
                  </div>
                </div>
              </div>

              {isLoadingContestants ? (
                <div className="flex justify-center items-center h-full w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <div className="mt-1 flex flex-wrap justify-center gap-y-1">
                  {cards.map((card, index) => {
                    const isFlipping = flippingCards.includes(index);
                    const cardText = card.revealed ? card.type : "?";
                    const style = card.revealed && card.type === CARD_TYPES.PASS ? PASS_CARD_STYLE : card.style;
                    const isRecentlyUpdated = recentlyUpdated.includes(index);
                    const isRevealedPass = card.revealed && card.type === CARD_TYPES.PASS;
                    
                    // Use the helper function to get the correct display name
                    let displayName = "";
                    if (card.revealed && card.contestant_id) {
                      displayName = getContestantName(card.contestant_id);
                    }
                    
                    return (
                      <div 
                        key={index} 
                        onClick={() => handleCardClick(index)}
                        className={cn(
                          "relative transition-transform perspective-[1000px]",
                          card.revealed ? "cursor-default pointer-events-none opacity-70" : 
                            isMyTurn ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-80",
                          (isSending || flippingCards.length > 0) ? "cursor-wait pointer-events-none" : "",
                          isRecentlyUpdated ? "animate-pulse" : "",
                          isRevealedPass ? "z-10 opacity-100" : ""
                        )}
                        style={{ perspective: "1000px" }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
                            initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
                            animate={
                              isFlipping 
                                ? { rotateY: 180, opacity: 0 } 
                                : { rotateY: 0, opacity: 1 }
                            }
                            transition={{ duration: isRevealedPass ? 0.5 : 0.3, ease: "easeInOut" }}
                            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                            className="relative"
                          >
                          
<div className="relative">
  {/* This div will sit on top of everything */}
  {card.revealed && (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
      <span className="font-bold text-white text-xs bg-[#D91FFF] px-4 py-1 rounded">
        {displayName?.split(" ")[0]}
      </span>
    </div>
  )}

  <PickCardContainer
    backgroundColor={style.backgroundColor}
    text={card.revealed ? "" : cardText}
    width="108px"
    height="100px"
    rayColor={style.rayColor}
    innerCircleColor={style.innerCircleColor}
    textColor={style.textColor}
    cornerColor={style.cornerColor}
    fontFamily={style.fontFamily}
    fontSize={style.fontSize}
    textStrokeWidth={cardText === CARD_TYPES.PASS ? 1.5 : 2}
    textStrokeColor={cardText === CARD_TYPES.PASS ? "#000000" : "#D91FFF"}
    containerLabel="" // Don't render it here, handled above
    className={cn(
      "transition-transform p-0 duration-300 ease-in-out 2xl:w-[800px]",
      isRecentlyUpdated ? "ring-2 ring-white" : "",
      isFlipping ? "shadow-lg" : "",
      isRevealedPass ? "ring-4 ring-yellow-400 shadow-xl shadow-yellow-400/50" : ""
    )}
    textClassName={cn(
      "font-extrabold text-[2rem] font-gilroyBold relative z-20",
      isRevealedPass ? "animate-pulse" : ""
    )}
    labelClassName="hidden"
  />

  {/* Overlay should stay below the name */}
  {card.revealed && (
    <div className="absolute inset-0 bg-black bg-opacity-80 rounded-[.875rem] flex items-center justify-center z-10">
      <div className="text-center">
        <span className={cn(
          "font-black text-[3rem] font-gilroyBold tracking-wider",
          cardText === CARD_TYPES.PASS 
            ? "text-yellow-300 drop-shadow-[0_0_12px_rgba(255,205,0,0.9)] animate-pulse" 
            : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]",
          "filter drop-shadow-[3px_3px_6px_rgba(0,0,0,1)] text-stroke-2 text-stroke-black"
        )}>
          <GlowyStrokeText
            strokeWidth={2}
            strokeColor="#D91FFF"
            glowColor="#13051E"
            glowIntensity="low"
            textclassName="text-[1.8rem] font-extrabold font-gilroyBold"
            fillColor="#000"
          >
            {cardText}
          </GlowyStrokeText>
        </span>
      </div>
    </div>
  )}
</div>

                            
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    );
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
      
      {/* Celebration Animation */}
      <CelebrationAnimation 
        isVisible={passFound} 
        finderName={passFinderIsCurrentUser ? undefined : passFinderName} 
      />
      
      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#13051E] border-2 border-[#D91FFF] p-6 rounded-lg max-w-md">
            <h3 className="text-white text-xl font-bold mb-4">Error</h3>
            <p className="text-white mb-4">{errorModalMessage}</p>
            <Button 
              onClick={() => setErrorModalState(false)}
              className="bg-[#D91FFF] text-white hover:bg-[#B017D7]"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>

    </>
  );
};

export default Stage3CardSelection;