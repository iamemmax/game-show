import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { GlowyStrokeText, Button } from "@/components/core";
import { cn } from "@/utils/classNames";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useMQTT } from "@/hooks/useMqttService";
import { tokenStorage } from "@/utils/auth";
import PickCardContainer from "@/app/shared/PickCardContainer";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { Card, CARD_STYLES, PASS_CARD_STYLE } from "./CardStyles";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import { useParams } from "next/navigation";
import StageThreeWinnerModal from "@/app/components/stages/components/StageThreeWinnerModal";
import HustleBoardStageTallyPage from "../HustleBoardStageTally";

interface prop {
  onNext: () => void
}
const Stage3CardSelectionScreens = ({ onNext }: prop) => {
  const user = tokenStorage.getUser();
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
  const [passCardIndex, setPassCardIndex] = useState<number>(-1);
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [currentTurnName, setCurrentTurnName] = useState<string>("");
  const [showStageResult, setShowStageResult] = useState(false);
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
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center justify-between bg-[#13051E] border-2 border-[#D91FFF] rounded-lg p-3">
          {/* Contestants */}
          {remainingContestants?.map((contestant, index) => (
            <React.Fragment key={contestant.id}>
              <div className={cn(
                "flex items-center px-4 py-2 rounded border-2 min-w-[120px] justify-center",
                currentTurn === contestant.id
                  ? "bg-blue-600 border-blue-400 text-white"
                  : "bg-gray-700 border-gray-500 text-gray-300"
              )}>
                <span className="font-gilroyBold text-sm uppercase tracking-wide">
                  {contestant.name}
                </span>
              </div>
              {index === 0 && (
                <div className="mx-4">
                  <span className="text-white font-gilroyBold text-lg">VS</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Turn Status */}
        {currentTurn && (
          <div className=" p-5 rounded-lg text-center bg-blue-600 bg-opacity-20 border border-blue-400">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full animate-pulse bg-blue-400"></div>
              <span className="font-gilroyBold text-xl text-blue-400 ">
                {currentTurnName}'s turn to flip
              </span>
              <div className="w-3 h-3 rounded-full animate-pulse bg-blue-400"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Celebration Animation Component
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
        <StageThreeWinnerModal />
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
            setPassFinderName(finderName);
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
        onNext={() => onNext}
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
              text="Pick-Pad"
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
                    textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
                    fillColor="#000"
                  >
                    Stage 3: Showdown for pass
                  </GlowyStrokeText>

                  <div className="text-white flex justify-center items-center gap-5 flex-col">
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
                <div className=" flex flex-wrap justify-center ">
                  {cards.map((card, index) => {
                    const isFlipping = flippingCards.includes(index);
                    const cardText = card.revealed ? card.type : "?";
                    const style = card.revealed && card.type === CARD_TYPES.PASS ? PASS_CARD_STYLE : card.style;
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
                          "relative transition-transform perspective-[1000px] pointer-events-none",
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
                            transition={{ duration: isRevealedPass ? 0.5 : 0.3, ease: "easeInOut" }}
                            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                            className="relative"
                          >
                            <div className="relative">
                              {/* Contestant name overlay */}
                              {card.revealed && (
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                                  <span className="font-bold text-white text-base bg-[#D91FFF] px-4 py-1 rounded">
                                    {displayName?.split(" ")[0]}
                                  </span>
                                </div>
                              )}

                              <PickCardContainer
                                backgroundColor={style.backgroundColor}
                                text={card.revealed ? "" : cardText}
                                width="190px"
                                height="180px"
                                rayColor={style.rayColor}
                                innerCircleColor={style.innerCircleColor}
                                textColor={style.textColor}
                                cornerColor={style.cornerColor}
                                fontFamily={style.fontFamily}
                                fontSize={style.fontSize}
                                textStrokeWidth={cardText === CARD_TYPES.PASS ? 1.5 : 2}
                                textStrokeColor={cardText === CARD_TYPES.PASS ? "#000000" : "#D91FFF"}
                                containerLabel=""
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

                              {/* Card content overlay */}
                              {card.revealed && (
                                <div className="absolute inset-0 bg-black bg-opacity-80 rounded-[.875rem] flex items-center justify-center z-10">
                                  <div className="text-center">
                                    <span className={cn(
                                      "font-black text-[3rem] font-gilroyBold tracking-wider",
                                      cardText === CARD_TYPES.PASS
                                        ? "text-yellow-300 drop-shadow-[0_0_12px_rgba(255,215,0,0.9)] animate-pulse"
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
        finderName={passFinderName}
      />
    </div>
  );
};

export default Stage3CardSelectionScreens;


