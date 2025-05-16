

import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useState, useEffect } from "react";
import HustleStages from "./HustleStages";
import HustleSideBar from "./HustleSideBar";
import HustleBottomCard from "./HustleBottomCard";
import { motion } from "framer-motion";
import Image from "next/image";
import StageTallyCard from "@/app/shared/StageTallyCard";
import { addCommasToNumber } from "@/utils";
import { cn } from "@/utils/classNames";
import { Button, GlowyStrokeText } from "@/components/core";
import { tokenStorage } from "@/utils/auth";
import { useGetWalletBalance } from "../../api/stage1/getbalance";
import { contestantImages } from "../mocks/contestantImages";
import Stage2GetReadyPage from "../stage2/Stage2GetReadyPage";
import { useMQTT } from "@/hooks/useMqttService";

interface StageOneTallyProps {
  eliminationCount?: number;
  removeCount?: number;
}

const StageOneTally = ({ 
  eliminationCount = 2,
  removeCount = 0 
}: StageOneTallyProps) => {
  const borderArray = [
    "#7E3CE0",
    "#04DA6A",
    "#FF7D01",
    "#AE0F69",
    "#E5AA18",
    "##9E5CFF",
  ];
  const { isConnected, onMessage } = useMQTT();
  const [goToStage2, setGoToStage2] = useState(false);
  const [goToStage3, setGoToStage3] = useState(false);
  const user = tokenStorage.getUser();
  const { data: dataBalance, isLoading } = useGetWalletBalance(user?.game_episode as number);
  const [processedBalances, setProcessedBalances] = useState<any[]>([]);
  
  // Process balances to remove lowest contestants
  useEffect(() => {
    if (dataBalance?.data?.balances) {
      // First, sort balances by amount (descending)
      const sortedBalances = [...dataBalance.data.balances].sort(
        (a, b) => parseFloat(String(b.balance)) - parseFloat(String(a.balance))
      );
      
      // If removeCount is specified, remove the lowest contestants
      let filteredBalances = sortedBalances;
      if (removeCount > 0) {
        filteredBalances = sortedBalances.slice(
          0, 
          Math.max(0, sortedBalances.length - removeCount)
        );
      }
      
      // If eliminated is specified, mark those contestants as eliminated
      if (eliminationCount > 0) {
        filteredBalances = filteredBalances.map((balance, index) => ({
          ...balance,
          isEliminated: index >= filteredBalances.length - eliminationCount
        }));
      }
      
      setProcessedBalances(filteredBalances);
      
      console.log(`Processed balances (removed ${removeCount}, marked ${eliminationCount} as eliminated):`, 
        filteredBalances.length);
    }
  }, [dataBalance, eliminationCount, removeCount]);

  // Dynamic tally array based on elimination count
  const tallyArray = [
    "PRO HUSTLER", "SUPER HUSTLER", "MINI HUSTLER", "MICRO HUSTLER"
  ];
  
  // Add "ELIMINATED" labels based on elimination count
  for (let i = 0; i < eliminationCount; i++) {
    tallyArray.push("ELIMINATED");
  }
  
  // Add empty string for any remaining positions
  while (tallyArray.length < 7) {
    tallyArray.push("");
  }


  useEffect(() => {
    if (isConnected) {
      const handler = (receivedMessage: any) => {
        console.log("Main page received message:", receivedMessage);
        
        // Handle stage transition events
        if (receivedMessage?.event === "game_s2_prep") {
          // Proceed to the next stage
          setGoToStage2(true);
        }
        if (receivedMessage?.event === "game_s3_prep") {
          // Proceed to the next stage
          setGoToStage3(true);
        }
      };
      
      // Register the message handler
      onMessage(handler);
      
      // Clean up function to remove the handler when component unmounts
      return () => {
        onMessage(null);
      };
    }
  }, [isConnected, onMessage]);

  if (goToStage2) {
    return <Stage2GetReadyPage />;
  }
  
  return (
    <div className="grid grid-cols-[1fr_2.5fr_1fr] 2xl:grid-cols-[1fr_1.5fr_1fr] h-full ">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>
          <HustleStages />
        </div>
        <div className="w-full p-[1.4375rem] flex-col rounded-t-[1.75rem] flex justify-center items-center bg-[linear-gradient(to_right,_#2D0304,_#EE24B8,_#1E0227)] text-white">
          <Trophy height={50} width={50} />
          <div className="flex flex-col justify-center pt-1 items-center">
            <p className="uppercase font-bold text-xs font-verdana text-white">
              Stage 1 of 6
            </p>
            <p className="max-w-[100px] text-center mt-1 font-display font-bold text-xs text-white">
              Hustle: Fashion Designer
            </p>
          </div>
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
              text="Stage1"
              textGradientEnd="#8E17AA"
              className="font-display"
              textGradientStart="#8E17AA"
              borderGradientStart="#f712fc"
              borderGradientEnd="#e151fe"
              fontSize={45}
              fontFamily="Verdana"
              textStrokeColor="#a219c1"
              textStrokeWidth={4.4}
            />
          </div>

          <div
            className={`relative w-full ${processedBalances?.length <=4 ? "py-[3rem]":"py-[1rem]"}   2xl:py-[2.5rem] max-xl:max-w-[40.5rem] 2xl:max-w-[60rem] px-4 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden`}
            style={{
              backdropFilter: "blur(74px)",
              WebkitBackdropFilter: "blur(74px)", // For Safari support
            }}
          >
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
                  backdropFilter: "blur(74px)",
                  WebkitBackdropFilter: "blur(74px)",
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Content container - increased border width from 5px to 8px for bolder appearance */}
            <div className="absolute inset-[8px] bg-[#13051E]  rounded-[.675rem]" />
            <div className="relative">
              <div className="flex justify-center flex-col items-center">
                <div>
                  {/* <h2 className="text-[2.5rem] text-center font-extrabold outline-text text-black">
                    Stage tally
                  </h2> */}


                  <GlowyStrokeText
                                        strokeWidth={2}
                                        strokeColor="#D91FFF"
                                        // glowColor="transparent"
                                        glowIntensity="low"
                                        textclassName="text-[2.5rem] font-extrabold font-display"
                                        fillColor="#000"
                                      >
                                         Stage tally
                                      </GlowyStrokeText>
                </div>

                <motion.div
                  className={`flex items-center gap-1 ${processedBalances?.length <=4 ? "gap-3":"gap-1"} 2xl:gap-2 flex-col`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.5,
                      },
                    },
                  }}
                >
                  {processedBalances?.map((tally, idx: number) => (
                    <motion.div
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.8,
                            ease: "easeOut",
                          },
                        },
                      }}
                      className={`flex justify-center gap-[.6875rem] 2xl:gap-1 items-center ${tally.isEliminated ? "opacity-50" : ""}`}
                    >
                      <div className={`${cn(`h-[3.125rem] grid grid-cols-[1fr_3fr] 2xl:grid-cols-[1fr_2fr] w-[7.8125rem] bg-[#1C0240] 2xl:h-[3.8rem] p-2 border-[.0531rem] border-opacity-55 border-[${borderArray[idx]}] rounded-[.4594rem]`)} `}>
                        <div className="shrink-0">
                          <Image
                            alt=""
                            src={contestantImages[idx]}
                            width={18}
                            height={18}
                            className="rounded-full shrink-0 2xl:w-[30px] 2xl:h-[30px]"
                          />
                        </div>
                        <div className={`${cn(` flex flex-col`)}`}>
                          <p className="text-xs 2xl:text-sm font-gilroyMedium font-normal text-white">
                            {tally.contestant_name?.split(' ')[0]}
                          </p>
                          <p className="text-xs 2xl:text-sm font-gilroyMedium font-normal text-white">
                           {`₦${addCommasToNumber(Number(tally?.balance?.toFixed(0)) ?? 0)}`}
                          </p>
                        </div>
                      </div>
                      <div className="">
                        <StageTallyCard
                          text={tally.isEliminated ? "ELIMINATED" : tallyArray[idx]}
                          fontSize={30}
                          className="2xl:w-[700px] 2xl:h-[90px]"
                          color="#fff"
                          amount={`₦${addCommasToNumber(Number(tally?.balance?.toFixed(0)) ?? 0)}`}
                          badgeColor={
                            tally.isEliminated ? "#760F1B" : "#035D2E"
                          }
                          backgroundGradient={{
                            endColor: tally.isEliminated
                              ? "#980306"
                              : "#03984A",
                            startColor: tally.isEliminated
                              ? "#FE8E8E"
                              : "#8EFE9B",
                          }}
                          // innerBackgroundColor={tally.isEliminated ? "#2D0304" : "#13051E"}
                          gradientId={`gradient-${idx}-${tally.contestant_id}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card (sticks to bottom) */}
        <div className="w-full max-w-[35rem] lg:max-w-[46.5rem] 2xl:max-w-[80rem] mt-2">
          <HustleBottomCard inline={true} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar 
          showHustlerCard={true} 
          eliminated={eliminationCount}
         
        />
      </div>
    </div>
  );
};

export default StageOneTally;
