"use client";
import PickCard1 from "@/app/icons/cards/PickCard1";
import PickCard2 from "@/app/icons/cards/PickCard2";
import PickCard3 from "@/app/icons/cards/PickCard3";
import PickCardContainer from "@/app/shared/PickCardContainer";
import { cn } from "@/utils/classNames";
import React, { useEffect, useRef, useState } from "react";
import { useGetFlipData } from "../../api/stage3/getFlipData";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { tokenStorage } from "@/utils/auth";
import DudCards from "@/app/icons/cards/DudCard";
import InstantCashout from "@/app/icons/cards/InstantCashout";
import BonusFlip from "@/app/icons/cards/BonusFlip";
import MissCardFlip from "@/app/icons/cards/MissCardFlip";
import PassCard from "./PassCard";
import HustleSideBar from "../hustle/HustleSideBar";
import { GlowyStrokeText } from "@/components/core";
import HustleStages from "../hustle/HustleStages";
import Logo from "@/app/icons/Logo";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import { motion } from "framer-motion";
import { useContestantFlipCard } from "../../api/stage3/contestantCardFlip";
import { useMQTT } from "@/hooks/useMqttService";
import { MQTTMessage } from "@/contexts/MQTTProvider";
import { CardFlipRevealModal } from "./Srage3CardSelectionRevealModal";
import NumberFlow from "@number-flow/react";
import { useCardSelection } from "../../api/stage3/sendCardSelection";
import StageThreeWinnerModal from "../StageThreeWinnerModal";
import EliminatedModal from "@/app/shared/EliminatedModal";

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

const Stage3CardSelection = () => {
  const user = tokenStorage.getUser();
  const {
    data: contestantsData,
    isLoading: isLoadingContestants,
    refetch,
  } = useGetGameContestants(user?.game_episode as number);
  const getRemainingContestant = () => {
    const remainingConst = contestantsData?.data?.filter(
      (x) => !x?.is_eliminated
    );
    return remainingConst;
  };
  const getContestantData = (contestantId: number) => {
    const contestant = getRemainingContestant()?.find(
      (c) => c.id == contestantId
    );
    return contestant;
  };
  const getOtherContestantData = (contestantId: number) => {
    const contestant = getRemainingContestant()?.find(
      (c) => c.id !== contestantId
    );
    return contestant;
  };
  const [showCountdown, setShowCoundown] = useState(false);
  const [countTimer, setCountdownTimer] = useState(3);
  const [passFound, setPassFound] = useState(false);
  const { mutate: handleCardFlip } = useContestantFlipCard();

  const cardIcons = [PickCard1, PickCard2, PickCard3];
  const { mutate: handleCard } = useCardSelection();
  const {
    data,
    isLoading,
    refetch: refetchAlreadyFlippedCards,
    isFetching,
  } = useGetFlipData(String(user?.game_episode));
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

  const handleCardClick = (position: number) => {
    if (data?.who_next.toString() !== user?.contestant_id.toString()) return;
    handleCardFlip(
      {
        contestant_id: Number(user?.contestant_id),
        game_episode: Number(user?.game_episode),
        position: position,
      },
      {
        onSuccess: (data) => {
          handleCard(
            {
              contestant_id: data?.contestant?.id,
              game_episode: Number(user?.game_episode),
              pick: data?.type?.toUpperCase(),
            },
            {
              onSuccess: () => {
                refetch();
                refetchAlreadyFlippedCards();
              },
            }
          );
        },
      }
    );
  };

  const { addMessageListener, removeMessageListener, isConnected } = useMQTT();

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const handleMQTTMessage = (message: MQTTMessage) => {
      if (message.topic !== "test/topic/local") return;

      if (message.event === "dud_pass_picks") {
        refetch();
        const data = message.payload.data as DudPassMQTTData;

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
  const renderCard = (card: CardType, position: number) => {
    // Render revealed cards based on type
    const cardElement = (() => {
      switch (card.type) {
        case CARD_TYPES.DUD:
          return <DudCards className="w-[90px] h-full" />;
        case CARD_TYPES.FIVE_K:
        case CARD_TYPES.TEN_K:
        case CARD_TYPES.TWENTY_K:
          return <InstantCashout className="w-[90px] h-full" />;
        case CARD_TYPES.BONUS_FLIP:
          return <BonusFlip className="w-[90px] h-full" />;
        case CARD_TYPES.MISS_FLIP:
          return <MissCardFlip className="w-[90px] h-full" />;
        case CARD_TYPES.PASS:
          return <PassCard className="w-[90px]" />;
        default:
          return (
            <PickCardContainer
              backgroundColor={"transparent"}
              text={React.createElement(cardIcons[position % 3], {
                className: "w-[103px]",
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
              labelClassName="hidden"
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

  const TurnIndicator = () => {
    const isMyTurn = isFetching
      ? cardFlipModalInfo?.next_turn === user?.contestant_id.toString()
      : data?.who_next.toString() === user?.contestant_id.toString();

    return (
      <div className="max-w-max mx-auto">
        {/* Turn Status */}
        <div
          className={cn(
            " p-2 rounded-lg text-center mx-auto",
            isMyTurn
              ? "bg-green-600 bg-opacity-20 border border-green-400"
              : "bg-red-600 bg-opacity-20 border border-red-400"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                isMyTurn ? "bg-green-400" : "bg-red-400"
              )}
            ></div>
            <span
              className={cn(
                "font-gilroyBold text-sm",
                isMyTurn ? "text-green-400" : "text-red-400"
              )}
            >
              {isMyTurn
                ? "Your turn to flip"
                : `${getContestantData(Number(data?.who_next))?.name}'s turn`}
            </span>
            <div
              className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                isMyTurn ? "bg-green-400" : "bg-red-400"
              )}
            ></div>
          </div>
        </div>
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
                <>
                  <TurnIndicator />
                  <div className="grid grid-cols-6 justify-center gap-2">
                    {allCards?.map((card, index) => (
                      <button
                        disabled={
                          data?.who_next?.toString() !==
                            user?.contestant_id.toString() || !!card.type
                        }
                        onClick={() => handleCardClick(index + 1)}
                      >
                        {renderCard(card, index + 1)}
                      </button>
                    ))}
                  </div>
                </>
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
          otherContestantName={getContestantData(data?.who_next!)?.name!}
        />
      )}
      {showCountdown && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-center max-w-lg w-full mx-4 text-9xl font-semibold text-white/50 "
          >
            <NumberFlow value={countTimer} />
          </motion.div>
        </div>
      )}

      {cardFlipModalInfo?.type == "PASS" && (
        <>
          {cardFlipModalInfo.contestant.id.toString() ==
          user?.contestant_id.toString() ? (
            <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
              <StageThreeWinnerModal
                name={cardFlipModalInfo.contestant.name}
                balance={String(
                  getContestantData(
                    Number(
                      getRemainingContestant()?.find(
                        (c) => c.name === cardFlipModalInfo.contestant.name
                      )?.id
                    )
                  )?.actual_balance ?? 0
                )}
                imgUrl={String(
                  getContestantData(
                    Number(
                      getRemainingContestant()?.find(
                        (c) => c.name === cardFlipModalInfo.contestant.name
                      )?.id
                    )
                  )?.contestant_photo_url || "/"
                )}
              />
            </div>
          ) : (
            <div className="fixed inset-0 bg-black flex justify-center items-center h-screen w-full z-[9999999999]">
              <EliminatedModal
                setShowEliminationModal={() => {}}
                showEliminationModal={true}
                balance={Number(
                  getContestantData(Number(user?.contestant_id))?.actual_balance
                )}
                image_url={String(
                  getContestantData(Number(user?.contestant_id))
                    ?.contestant_photo_url ?? "/"
                )}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Stage3CardSelection;

export const CARD_TYPES = {
  DUD: "DUD",
  FIVE_K: "FIVE_K",
  TEN_K: "TEN_K",
  TWENTY_K: "TWENTY_K",
  BONUS_FLIP: "BONUS_FLIP",
  MISS_FLIP: "MISS_FLIP",
  PASS: "PASS",
};
