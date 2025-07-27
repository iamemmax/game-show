"use client";
import PickCard1 from "@/app/icons/cards/PickCard1";
import PickCard2 from "@/app/icons/cards/PickCard2";
import PickCard3 from "@/app/icons/cards/PickCard3";
import PickCardContainer from "@/app/shared/PickCardContainer";
import { cn } from "@/utils/classNames";
import React, { useEffect, useState } from "react";
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
import {motion} from "framer-motion"
import { useContestantFlipCard } from "../../api/stage3/contestantCardFlip";

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
  const getContestantData = (contestantId: number) => {
    const contestant = contestantsData?.data.find((c) => c.id === contestantId);
    return contestant;
  };
  const {mutate:handleCardFlip} = useContestantFlipCard()

  const cardIcons = [PickCard1, PickCard2, PickCard3];
  const { data, isLoading } = useGetFlipData(String(user?.game_episode));
  const [allCards, setAllCards] = useState<CardType[]>(
    Array.from({ length: 24 }, (_, i) => ({
      position: data?.find((card) => card.position == i + 1)?.position || i,
      type: data?.find((card) => card.position == i + 1)?.type || null,
      contestant_id: null,
    }))
  );

  useEffect(() => {
    if (!isLoading && !!data) {
      setAllCards(
        Array.from({ length: 24 }, (_, i) => ({
          position: data?.find((card) => card.position == i + 1)?.position || i,
          type: data?.find((card) => card.position == i + 1)?.type || null,
          contestant_id: null,
        }))
      );
    }
  }, [isLoading, data]);

const handleCardClick = (position: number) => {
   handleCardFlip({
    contestant_id:Number(user?.contestant_id),
    game_episode:Number(user?.game_episode),position:position},{
    onSuccess:()=>{

    }
   })
  };




  const renderCard = (card: CardType, position: number) => {
    console.log(card);

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


    // // Add timer overlay for bonus cards - works for both current user and opponent
    // if (card.type === CARD_TYPES.BONUS_FLIP && bonusCardTimers[index] > 0) {
    //   const isCurrentUserCard = card.contestant_id === user?.contestant_id;
    //   const playerName = card.contestant_id
    //     ? getContestantName(card.contestant_id)?.name
    //     : "Unknown";
    //   return (
    //     <div className="relative">
    //       {cardElement}
    //       <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg border-2 border-yellow-400">
    //         <div className="text-center">
    //           <div className="text-yellow-400 text-xs font-bold mb-1">
    //             BONUS FLIP
    //           </div>
    //           <div className="text-yellow-400 text-2xl font-bold animate-pulse">
    //             {bonusCardTimers[index]}
    //           </div>
    //           <div className="text-white text-xs font-bold">
    //             {isCurrentUserCard
    //               ? "You can flip again!"
    //               : `${playerName?.split(" ")[0]} can flip again!`}
    //           </div>
    //           {/* Add pulsing border effect */}
    //           <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg animate-pulse"></div>
    //         </div>
    //       </div>
    //     </div>
    //   );
    // }
    return <div className="justify-self-center">{cardElement}</div>;
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
                    textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
                    fillColor="#000"
                  >
                    Stage 3: Card Collection Showdown
                  </GlowyStrokeText>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-full w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <div className="grid grid-cols-6 justify-center gap-4">
                  {allCards?.map((card, index) => (
                    <div onClick={() => handleCardClick(index+1)}>{renderCard(card, index + 1)}</div>
                  ))}
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
    </div>
  );
};

export default Stage3CardSelection;

const CARD_TYPES = {
  DUD: "DUD",
  FIVE_K: "FIVE_K",
  TEN_K: "TEN_K",
  TWENTY_K: "TWENTY_K",
  BONUS_FLIP: "BONUS_FLIP",
  MISS_FLIP: "MISS_FLIP",
  PASS: "PASS",
};