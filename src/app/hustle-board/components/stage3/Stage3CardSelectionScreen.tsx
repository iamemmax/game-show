import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { GlowyStrokeText, Button } from "@/components/core";
import { cn } from "@/utils/classNames";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useMQTT } from "@/hooks/useMqttService";
import PickCardContainer from "@/app/shared/PickCardContainer";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { Card, CARD_STYLES, PASS_CARD_STYLE } from "./CardStyles";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import { useParams } from "next/navigation";
import StageThreeWinnerModal from "@/app/components/stages/components/StageThreeWinnerModal";
import HustleBoardStageTallyPage from "../HustleBoardStageTally";
import PickCard1 from "@/app/icons/cards/PickCard1";
import PickCard2 from "@/app/icons/cards/PickCard2";
import PickCard3 from "@/app/icons/cards/PickCard3";
import PassCard from "@/app/icons/cards/PassCard";
import DudCards from "@/app/icons/cards/DudCard";
import VersusIcon from "@/app/icons/Versus";

interface prop {
  onNext: () => void
}
const Stage3CardSelectionScreens = () => {
  const { isConnected, addMessageListener, removeMessageListener } = useMQTT();
  const [remainingContestants, setRemainingContestants] = useState<Array<{ id: number, name: string }>>([]);

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
  const params = useParams()
  const [passFound, setPassFound] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([]);
  const [flippingCards, setFlippingCards] = useState<number[]>([]);
  const [contestantNames, setContestantNames] = useState<Record<number, string>>({});
  const [passFinderName, setPassFinderName] = useState<string>("");
  const [passFinderId, setPassFinderId] = useState<string>("");
  const [passCardIndex, setPassCardIndex] = useState<number>(-1);
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [currentTurnName, setCurrentTurnName] = useState<string>("");
  const [showStageResult, setShowStageResult] = useState(false);
  const cardIcons = [PickCard1, PickCard2, PickCard3];

  const { data: contestantsData, isLoading: isLoadingContestants, refetch } = useGetGameContestants(Number(params?.episodeId));
  // Helper function to get contestant name by ID

  const getContestantName = (contestantId: number): string => {
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
    return `Contestant ${contestantId}`;
  };
  const getContestantInfo = (id: number) => {
    const allconstestant = contestantsData?.data?.find(
      (contestant) => contestant.id === id
    );
    return allconstestant;
  };

  // Set remaining contestants and contestant names
  useEffect(() => {
    if (!contestantsData?.data) return;

    // Get remaining contestants (not eliminated)
    const remaining = contestantsData.data
      .filter((contestant: any) =>
        contestant.eliminated_stage === null && !contestant.is_eliminated
      )
      .map((contestant: any) => ({
        id: contestant.id,
        name: contestant?.name || `Contestant ${contestant.id}`
      }));

    setRemainingContestants(remaining);

    // Create contestant names map
    const namesMap: Record<number, string> = {};
    contestantsData.data.forEach((contestant: any) => {
      if (contestant.id && contestant.name) {
        namesMap[contestant.id] = contestant.name;
      }
    });
    setContestantNames(namesMap);

  }, [contestantsData?.data]);

  // Update current turn name when current turn changes
  useEffect(() => {
    if (currentTurn) {
      setCurrentTurnName(getContestantName(currentTurn));
    }
  }, [currentTurn, contestantNames, contestantsData?.data]);



const TurnIndicator = () => {
   if (passFound || remainingContestants.length !== 2) return null;
  return (
    <div className="flex items-center justify-center gap-6 p-4">
      {/* Main container with contestants */}
      <div className="flex items-center w-full">
        {remainingContestants?.map((contestant, index) => (
          <React.Fragment key={contestant.id}>
            {/* Contestant card */}
            <div className={`
              flex items-center border-[0.5px] border-opacity-70 bg-transparent justify-center gap-4 px-4 py-3 rounded-lg 
              ${currentTurn === contestant?.id 
                ? ' border-[#04DA6A]' 
                : ' border-[#EB001B]'
              }
            `}>
              <div className="flex items-center gap-6">
                <span className={`
                  font-bold text-xl capitalize tracking-wide
                  ${currentTurn === contestant.id ? 'text-white' : 'text-gray-300'}
                `}>
                  {contestant.name?.split(" ")[0]}
                </span>
                {currentTurn === contestant.id && (
                  <div className="flex items-center gap-3 bg-[#053F20] py-[7px] px-4 rounded-xl border border-[#04DA6A]">
                    <span className="text-xl font-semibold font-verdana text-[#04DA6A]">Your turn</span>
                    <div className="w-3 h-3 rounded-full bg-[#04DA6A] animate-pulse"></div>
                  </div>
                )}
                {currentTurn !== contestant.id && (
                  <div className="flex items-center gap-3 bg-[#38040A] py-[7px] px-4 rounded-xl">
                    <span className="text-xl font-semibold font-verdana text-[#FF495E]">Waiting</span>
                    <div className="w-3 h-3 rounded-full bg-[#FF495E]"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* VS indicator between contestants */}
            {index === 0 && (
             <div className="px-6"> <VersusIcon/></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

  
  const CelebrationAnimation = ({ isVisible, finderName }: { isVisible: boolean, finderName?: string }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Ribbons falling from top */}
        <div className="absolute inset-0 !z-[999999999999999999]">
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
              <motion.div
                key={i}
                className="absolute rounded-sm"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: color,
                  top: `-${height}px`,
                  left: `${startX}%`,
                  transformOrigin: "top center",
                }}
                initial={{ y: -height, rotate: 0, scaleY: 1 }}
                animate={{
                  y: `${window.innerHeight + height}px`,
                  rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
                  x: [0, waveAmplitude, -waveAmplitude, waveAmplitude / 2, -waveAmplitude / 2, 0],
                  scaleY: [1, 0.9, 1.1, 0.95, 1.05, 1]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  ease: "linear",
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  x: { duration: waveSpeed * 5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
                  scaleY: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }
                }}
              />
            );
          })}
        </div>

        {/* Celebration content */}
      <StageThreeWinnerModal name={passFinderName} balance={String(getContestantInfo(Number(passFinderId))?.actual_balance ??0)} imgUrl={String(getContestantInfo(Number(passFinderId))?.contestant_photo_url ??"/")}/>
     
      </div>
    );
  };

  // MQTT message handler - Listen only
  useEffect(() => {
    if (!isConnected) return;

    const handleMQTTMessage = (receivedMessage: any) => {
      if (receivedMessage?.event === "stage3_card_selection") {
        const { contestant_id, card_index, card_type: originalCardType, contestant_name } = receivedMessage.payload;

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

            const finderName = contestant_name || getContestantName(contestant_id);
            const finderId = contestant_id || getContestantName(contestant_id);
            setPassFinderName(finderName);
            setPassFinderId(finderId);
            setTimeout(() => setPassFound(true), 300);
            refetch()
          } else {
            // Update turn to next contestant
            const nextContestant = remainingContestants.find(c => c.id !== contestant_id);
            if (nextContestant) {
              setCurrentTurn(nextContestant.id);
            }
          }
        setFlippingCards(prev => prev.filter(idx => idx !== card_index));
          setRecentlyUpdated([card_index]);
          setTimeout(() => setRecentlyUpdated([]), 1000);
        }, 600);
      }
      if (receivedMessage?.event === "game_s3_results_reveal") {
        console.log("✅ Processing game_s3_results_reveal");
        setShowStageResult(true);
      }
    };

    if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };
  }, [isConnected, addMessageListener, removeMessageListener, cards, remainingContestants, contestantNames, contestantsData?.data]);

  // Initialize turn system
  useEffect(() => {
    if (remainingContestants.length === 2 && !passFound) {
      // Lower contestant ID goes first
      const firstTurnId = Math.min(remainingContestants[0].id, remainingContestants[1].id);
      setCurrentTurn(firstTurnId);
    }
  }, [remainingContestants, passFound]);


  if (showStageResult) {
    return (
      <HustleBoardStageTallyPage
        eliminationCount={5}
        removeCount={2}
        title="stage 3"
        activeState={3}
      />
    );
  }

  return (
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

          <div className="relative w-full py-[2rem] 2xl:py-[2.5rem]  px-6 -mt-3 rounded-[.875rem] 2xl:px-[2rem] overflow-hidden">
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
                    textclassName="text-[2.125rem] font-extrabold font-lucky"
                    fillColor="#000"
                  >
                    Stage 3: Showdown for pass
                  </GlowyStrokeText>

                  <div className="text-white flex justify-center items-center  flex-col">
                    <span className="font-gilroyBold text-[#D5B9FF] text-sm">
                      Watch as contestants select business elements for their hustle
                    </span>

                    {/* Turn Indicator */}
                    <TurnIndicator />
                  </div>
                </div>
              </div>
 
              {isLoadingContestants ? (
                <div className="flex justify-center items-center h-full w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <>
       

<div className="grid grid-cols-6 gap-y-3 justify-center items-center">
  {cards.map((card, index) => {
    const isFlipping = flippingCards.includes(index);
    const style =
      card.revealed && card.type === CARD_TYPES.PASS
        ? PASS_CARD_STYLE
        : card.style;
    const isRecentlyUpdated = recentlyUpdated.includes(index);
    const isRevealedPass = card.revealed && card.type === CARD_TYPES.PASS;

    let displayName = "";
    if (card.revealed && card.contestant_id) {
      displayName = getContestantName(card.contestant_id);
    }

    return (
      <div
        key={index}
        className={cn(
          "relative pointer-events-none transition-transform h-[140px]",
          card.revealed ? "opacity-70" : "opacity-100",
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
            transition={{
              duration: isRevealedPass ? 0.5 : 0.3,
              ease: "easeInOut",
            }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            className="relative w-full h-full"
          >
            <div className="relative w-full h-full">
              {/* Display contestant name */}
              {card.revealed && (
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="font-bold text-black text-sm bg-white px-2 py-1 rounded">
                    {displayName?.split(" ")[0]}
                  </span>
                </div>
              )}

              {/* Render revealed card OR default card */}
              {card.revealed ? (
                card.type === CARD_TYPES.DUD ? (
                  <DudCards className="w-full h-full" />
                ) : (
                  <PassCard className="w-full h-full" />
                )
              ) : (
                <PickCardContainer
                  backgroundColor={"transparent"}
                  text={React.createElement(cardIcons[index % 3], {
                    className: "w-[120px] h-full",
                  })}
                  textColor={style.textColor}
                  fontFamily={style.fontFamily}
                  containerLabel=""
                  className={cn(
                    "transition-transform w-full h-full  duration-300 ease-in-out p-0",
                    isRecentlyUpdated ? "ring-2 ring-white" : "",
                    isFlipping ? "shadow-md" : "",
                    isRevealedPass
                      ? "ring-2 ring-yellow-400 shadow-md shadow-yellow-400/50"
                      : ""
                  )}
                  textClassName="font-bold text-[1.2rem]"
                  labelClassName="hidden"
                />
              )}
            </div>


          </motion.div>
        </AnimatePresence>
      </div>
    );
  })}
</div>




                </>
              
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col">
        <HustleSideBar showEmptyCard={false} showHustlerCard={true} eliminated={4} showStage3Reward={true} />
        <div className="">


        </div>
      </div>

      {/* Celebration Animation */}
      <CelebrationAnimation
        isVisible={passFound}
        finderName={passFinderName}
      />
    </div>
  );
};

export default Stage3CardSelectionScreens;



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
//                  <div className="grid grid-cols-6 gap-y-4 justify-center items-center mt-4">
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
//                             "relative transition-transform h-[140px]",
//                             "cursor-default pointer-events-none opacity-70",
//                             isRecentlyUpdated ? "animate-pulse" : "",
//                           )}
//                             style={{ perspective: "1000px" }}
//                         >
//                           <AnimatePresence mode="wait">
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
