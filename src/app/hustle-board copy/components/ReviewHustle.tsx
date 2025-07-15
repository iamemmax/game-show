"use client";
import Logo from "@/app/icons/Logo";
// import StartUpIcon from "@/app/icons/StartupIcon";
// import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { tokenStorage } from "@/utils/auth";
// import { addCommasToNumber } from "@/utils";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";
import { Button, Dialog } from "@/components/core";
import Trophy from "@/app/icons/Trophy";
import { useParams, useRouter } from "next/navigation";
// import { useGetGameContestants } from "@/app/admin/misc/api/contestants";
import { useGetHustleReveal } from "@/app/components/stages/api/stage1/getHustleReveal";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import HustleBoardInvestCapitall from "./HustleBoardInvestCapitall";
import HustleBottomCard from "@/app/components/stages/components/hustle/HustleBottomCard";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Stage1QuestionScreen from "./Stage1QuestionScreen";
interface Props {
  onNext: () => void;
}
const ReviewHustle = ({ onNext }: Props) => {
  const params = useParams();
  const { isConnected, addMessageListener, removeMessageListener } = useMQTT();
  // const [ShowQuestionScreen, setShowQuestionScreen] = useState(false);
  const router = useRouter();
  const user = tokenStorage.getUser();

  const { data, isLoading } = useGetHustleReveal(Number(params?.episodeId));

  useEffect(() => {
    if (isConnected) {
      const handleMQTTMessage = (receivedMessage: any) => {
        console.log("Main page received message:", receivedMessage);

        // Handle stage transition events

        if (receivedMessage?.event === "game_s1_questions_prep") {
          // Proceed to the next stage
          // setShowQuestionScreen(true);
          onNext()
        }
      };

      if (isConnected) {
        addMessageListener(handleMQTTMessage);
      }

      return () => {
        removeMessageListener(handleMQTTMessage);
      };


    }
  }, [isConnected, addMessageListener, removeMessageListener]);

  const contestant = data?.data?.find(
    (contestant) => contestant.contestant_id === user?.contestant_id
  );
  // if (ShowQuestionScreen) {
  //   return <Stage1QuestionScreen />;
  // }
  return (
    <>
      {/* Elimination Modal */}


      {/* Main Component */}
      <div className="grid grid-cols-[1fr_5fr_1fr] h-full w-full overflow-x-hidden ">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo />
          </div>
          <div>
            <HustleStages />
          </div>
          <div className="pb-4 ">
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
          </div>
        </div>

        {/* Center Content */}
        <div className="flex  flex-col justify-between items-center min-h-full">
          {/* Top section */}
          <div className="flex flex-col w-full items-center">
            <div className="w-full h-[100px] flex items-center justify-center">
              <HeaderTitleContainer
                backgroundColor="#791192"
                color="#ed99ff"
                text="Stage 1"
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


            <div className="relative w-full py-[1.5rem]  h-full   px-4 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
                  {/* <div>
                    <h2 className="text-[2.125rem] text-center font-gilroyHeavy font-extrabold outline-text text-black">
                      Hustle reveals
                    </h2>
                  </div> */}
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full w-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                    </div>
                  ) : (
                    <>
                      {/* Tabs */}
                      <div className="mt-6 relative w-full flex justify-center items-center">
                        <HustleBoardInvestCapitall
                          // onNext={onNext}
                          hustleReveal={data}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card (sticks to bottom) */}
          <div className="w-full max-w-[35rem] lg:max-w-[46.5rem] 2xl:max-w-[80rem] mt-2">
            <HustleBottomCard />
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          <HustleSideBar showEmptyCard={false} showHustlerCard={true} showHustleCardAmt={true} />
        </div>
      </div>
    </>
  );
};

export default ReviewHustle;
