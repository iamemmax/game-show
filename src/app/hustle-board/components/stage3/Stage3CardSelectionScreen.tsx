"use client";
import PickCard1 from "@/app/icons/cards/PickCard1";
import PickCard2 from "@/app/icons/cards/PickCard2";
import PickCard3 from "@/app/icons/cards/PickCard3";
import PickCardContainer from "@/app/shared/PickCardContainer";
import { cn } from "@/utils/classNames";
import React, { useEffect, useRef, useState } from "react";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { tokenStorage } from "@/utils/auth";
import DudCards from "@/app/icons/cards/DudCard";
import InstantCashout from "@/app/icons/cards/InstantCashout";
import BonusFlip from "@/app/icons/cards/BonusFlip";
import MissCardFlip from "@/app/icons/cards/MissCardFlip";
import { GlowyStrokeText } from "@/components/core";
import Logo from "@/app/icons/Logo";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import { motion } from "framer-motion";
import { useMQTT } from "@/hooks/useMqttService";
import { MQTTMessage } from "@/contexts/MQTTProvider";
import NumberFlow from "@number-flow/react";
import { useGetFlipData } from "@/app/components/stages/api/stage3/getFlipData";
import PassCard from "@/app/icons/cards/PassCard";
import { CardFlipRevealModal } from "@/app/components/stages/components/stage3/Srage3CardSelectionRevealModal";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import { useParams } from "next/navigation";
import VersusIcon from "@/app/icons/Versus";

interface DudPassMQTTData {
  type: string;
  position: number;
  contestant: FlipContestant;
  next_turn: string;
}
export interface FlipContestant {
  id: number;
  name: string;
  contestant_attr: string;
}
type CardType = {
  position: number;
  type: string | undefined | null;
  contestant_id: null;
};

const Stage3CardSelectionScreens = () => {
  const gameEpisode = useParams().episodeId as string;
  const {
    data: contestantsData,
    isLoading: isLoadingContestants,
    refetch,
  } = useGetGameContestants(Number(gameEpisode));

  const getRemainingContestant = () => {
    const remainingConst = contestantsData?.data?.filter(
      (x) => !x?.is_eliminated
    );
    return remainingConst;
  };

  const [showCountdown, setShowCoundown] = useState(false);
  const [countTimer, setCountdownTimer] = useState(3);

  const cardIcons = [PickCard1, PickCard2, PickCard3];
  const {
    data,
    isLoading,
    refetch: refetchAlreadyFlippedCards,
  } = useGetFlipData(gameEpisode);

  const [allCards, setAllCards] = useState<CardType[]>(
    Array.from({ length: 24 }, (_, i) => ({
      position:
        data?.data.find((card) => card.position == i + 1)?.position || i,
      type: data?.data.find((card) => card.position == i + 1)?.type || null,
      contestant_id: null,
    }))
  );

  useEffect(() => {
    if (!isLoading && !!data) {
      setAllCards(
        Array.from({ length: 24 }, (_, i) => ({
          position:
            data?.data.find((card) => card.position == i + 1)?.position || i,
          type: data?.data.find((card) => card.position == i + 1)?.type || null,
          contestant_id: null,
        }))
      );
    }
  }, [isLoading, data]);

  const { addMessageListener, removeMessageListener, isConnected } = useMQTT();

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const handleMQTTMessage = (message: MQTTMessage) => {
      if (message.topic !== "test/topic/local") return;
      console.log(message, "mqtt dud message");

      if (message.event === "dud_pass_picks") {
        const data = message.payload.data as DudPassMQTTData;

        // Clear any existing countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }

        // Step 1: Show card flip modal immediately
        setCardFLipModalInfo(data);
        setShowCardFlipModal(true);
        refetchAlreadyFlippedCards();

        // Step 2: After 1 second, show countdown (only for non-PASS types)
        setTimeout(() => {
          if (data.type !== CARD_TYPES.PASS) {
            setShowCoundown(true);
            setCountdownTimer(3); // Start countdown from 3

            // Step 3: Start 3-second countdown
            countdownIntervalRef.current = setInterval(() => {
              setCountdownTimer((prev) => {
                if (prev <= 1) {
                  // Countdown finished - close both modals
                  clearInterval(countdownIntervalRef.current!);
                  setShowCoundown(false);
                  setShowCardFlipModal(false);
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            // For PASS type, close after 3 seconds without showing countdown
            setTimeout(() => {
              setShowCardFlipModal(false);
            }, 3000);
          }
        }, 1000);
      }
    };

    addMessageListener(handleMQTTMessage);

    // Cleanup function
    return () => {
      removeMessageListener(handleMQTTMessage);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [
    isConnected,
    addMessageListener,
    removeMessageListener,
    setShowCoundown,
    setCountdownTimer,
    refetchAlreadyFlippedCards,
  ]);
  // Fixed Turn Indicator Component
  const TurnIndicator = () => {
    // if (data?.who_next?.toString()) return null;
    const getContestant = getRemainingContestant()?.find(
      (x) => x.id.toString() === data?.who_next.toString()
    );

    // // Only hide if game actually ended (pass found)
    // if (passFound) {
    //   console.log(`🎯 TurnIndicator hidden: passFound=${passFound}`)
    //   return null
    // }

    // Show loading state if contestants haven't loaded yet
    if (getRemainingContestant()?.length === 0) {
      return (
        <div className="flex items-center justify-center gap-6 p-4 w-full mx-auto ">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <span className="text-white">Loading contestants...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-6 p-4 w-full">
        {/* Main container with contestants */}
        <div className="flex items-center justify-center w-full ">
          {getRemainingContestant()?.map((contestant, index) => {
            const isCurrentTurn =
              data?.who_next?.toString() === contestant.id.toString();
            return (
              <React.Fragment key={contestant.id}>
                {/* Contestant card */}
                <div
                  className={`
                    flex items-center border-[0.5px] border-opacity-70 bg-transparent justify-center gap-4 px-4 py-3 rounded-lg min-w-[200px]
                     ${
                       isCurrentTurn ? " border-[#04DA6A]" : " border-[#EB001B]"
                     }
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

                    {!isCurrentTurn && (
                      <div className="flex items-center gap-3 bg-[#38040A] py-[7px] px-4 rounded-xl">
                        <span className="text-2xl font-semibold font-verdana text-[#FF495E]">
                          Waiting
                        </span>
                        <div className="w-3 h-3 rounded-full bg-[#FF495E]"></div>
                      </div>
                    )}
                  </div>
                </div>
                {/* VS indicator between contestants */}
                {index === 0 && (getRemainingContestant()?.length ?? 0) > 1 && (
                  <div className="px-6">
                    <VersusIcon />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCard = (card: CardType, position: number) => {
    // Render revealed cards based on type
    const cardElement = (() => {
      switch (card.type) {
        case CARD_TYPES.DUD:
          return <DudCards className="w-[130px] h-full" />;
        case CARD_TYPES.FIVE_K:
        case CARD_TYPES.TEN_K:
        case CARD_TYPES.TWENTY_K:
          return <InstantCashout className="w-[130px] h-full" />;
        case CARD_TYPES.BONUS_FLIP:
          return <BonusFlip className="w-[130px] h-full" />;
        case CARD_TYPES.MISS_FLIP:
          return <MissCardFlip className="w-[130px] h-full" />;
        case CARD_TYPES.PASS:
          return <PassCard className="w-[130px]" />;
        default:
          return (
            <PickCardContainer
              backgroundColor={"transparent"}
              text={React.createElement(cardIcons[position % 3], {
                className: "w-[130px] h-[140px]",
              })}
              // textColor={}
              // fontFamily={card.style.fontFamily}
              containerLabel=""
              className={cn(
                "transition-transform w-full h-full duration-300 ease-in-out p-0"
                // recentlyUpdated.includes(index) ? "ring-2 ring-white" : "",
                // flippingCards.includes(index) ? "shadow-md" : ""
              )}
              textClassName="font-bold text-[1.2rem]"
              labelClassName={"hidden"}
            />
          );
      }
    })();

    return <div className="justify-self-center">{cardElement}</div>;
  };

  const [
    cardFlipModalInfo,
    setCardFLipModalInfo,
  ] = useState<DudPassMQTTData | null>(null);
  const [showCardFlipModal, setShowCardFlipModal] = useState(false);
  const CardFlipModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="text-center max-w-lg w-full mx-4"
        >
          <p className="text-6xl font-anton text-white">
            {cardFlipModalInfo?.type}
          </p>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return <>loading...</>;
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
              borderGradientEnd="#e051fe"
              fontSize={45}
              fontFamily="Verdana"
              textStrokeColor="#a219c1"
              textStrokeWidth={4.4}
            />
          </div>

          <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
                    textclassName="text-[2.125rem] font-extrabold font-lucky"
                    fillColor="#000"
                  >
                    Stage 3: Flip and Pass Showdown
                  </GlowyStrokeText>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-full w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <div className="">
                  <TurnIndicator />
                  <div className="grid grid-cols-6 justify-center gap-4">
                    {allCards?.map((card, index) => (
                      <div>{renderCard(card, index + 1)}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar
          showEmptyCard={false}
          showHustlerCard={true}
          eliminated={4}
        />
      </div>

      {showCardFlipModal && (
        <CardFlipRevealModal
          cardType={cardFlipModalInfo?.type}
          onClose={() => {
            setCardFLipModalInfo(null);
            setShowCardFlipModal(false);
          }}
          contestant={cardFlipModalInfo?.contestant!}
          isHustleBoard
        />
      )}
      {showCountdown && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-center max-w-lg w-full mx-4 text-9xl font-semibold text-white/50"
          >
            <NumberFlow value={countTimer} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Stage3CardSelectionScreens;

export const CARD_TYPES = {
  DUD: "DUD",
  FIVE_K: "FIVE_K",
  TEN_K: "TEN_K",
  TWENTY_K: "TWENTY_K",
  BONUS_FLIP: "BONUS_FLIP",
  MISS_FLIP: "MISS_FLIP",
  PASS: "PASS",
};
