"use client"
import Logo from "@/app/icons/Logo";
import StartUpIcon from "@/app/icons/StartupIcon";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import HustleStages from "./HustleStages";
import HustleSideBar from "./HustleSideBar";
import HustleBottomCard from "./HustleBottomCard";
import { motion } from "framer-motion";
import InvestCapital from "./InvestCapital";
import { tokenStorage } from "@/utils/auth";
import { hustleRevealProps, useGetHustleReveal } from "../../api/stage1/getHustleReveal";
import { addCommasToNumber } from "@/utils";
import GetReadyScreen from "../GetReadyScreen";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { useMQTT } from "@/hooks/useMqttService";

const Hustle = () => {
  const { isConnected, onMessage } = useMQTT();
  const [ShowQuestionScreen, setShowQuestionScreen] = useState(false)
  const user = tokenStorage.getUser();
  // const [data, setData] = useState<hustleRevealProps>()
// const [isLoading, setIsLoading] = useState(false)
  const {data,isLoading} = useGetHustleReveal(user?.game_episode as number);

  useEffect(() => {
    if (isConnected) {
     
      const handler = (receivedMessage: any) => {
        console.log("Main page received message:", receivedMessage);
        
        // Handle stage transition events
      

        if ( receivedMessage?.event === "game_s1_questions_prep") {
          // Proceed to the next stage
          setShowQuestionScreen(true)
          
                  }
      };
      
      onMessage(handler);
    }
  }, [isConnected, onMessage]);


  const  contestant = data?.data?.find((contestant) => contestant.contestant_id === user?.contestant_id);
  if (ShowQuestionScreen) {
    return <GetReadyScreen />;
  }
  return (
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
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]"/>
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
          {

          }

          <div className="relative w-full py-[2.5rem] 2xl:py-[4rem] max-xl:max-w-[46.5rem] 2xl:max-w-[60rem] px-4 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 4,
                  ease: "linear",
                  repeat: Infinity
                }}
              />
            </div>
            
            {/* Content container - increased border width from 5px to 8px for bolder appearance */}
            <div className="absolute inset-[8px] bg-[#13051E]  rounded-[.675rem]" />
            <div className="relative">
              <div className="flex justify-center flex-col items-center">
                <div>
                  <h2 className="text-[2.125rem] text-center font-gilroyHeavy font-extrabold outline-text text-black">
                    Stage 1: Hustle Kick-off
                  </h2>
                  <p className="text-sm font-normal max-w-[23.25rem] text-center text-[#D5B9FF]">
                  Tap each of the opportunities to determine how much of your start up capital you will like to Risk/Wager
                  </p>
                </div>
{
  isLoading? <div className="flex justify-center items-center h-full w-full">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
</div>:
<>
                <div className="flex mt-4 items-center gap-[1.375rem]">
                  {/* Player Info */}
                  <div className="flex bg-black rounded-10 gap-4 px-[1.125rem] pr-[5rem] items-center py-2">
                    <div className="relative h-[2.8rem] w-[2.8rem] bg-[#bf7222] border-[2px] border-[#dba531] rounded-full overflow-hidden">
                      <Image
                        alt="User avatar"
                        src="/images/userImage5.png"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white font-normal text-xs font-gilroyMedium">
                       {contestant?.contestant_details?.name??""}
                      </p>
                      <h2 className="text-sm font-medium font-gilroyMedium text-white outline-text-white-2">
                        Player {user?.contestant_attr ? user?.contestant_attr.split('_')[1] : ''}
                      </h2>
                    </div>
                  </div>

                  {/* Startup Capital */}
                  <div className="flex bg-black rounded-10 gap-4 px-[1.125rem] pr-[4rem] items-center py-2">
                    <div className="relative h-[2.8rem] w-[2.8rem] flex justify-center items-center bg-[#3C127299] bg-opacity-60 rounded-full overflow-hidden">
                      <StartUpIcon />
                    </div>
                    <div>
                      <p className="text-white font-normal text-xs font-gilroyMedium">
                        Startup capital
                      </p>
                      <h2 className="text-sm font-medium font-gilroyMedium text-white outline-text-white-2">
                        ₦{addCommasToNumber(Number(contestant?.reveals?.reduce((sum, reveal) => sum + reveal.hustle_amount, 0)?.toFixed(0)?.toLocaleString()))}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 relative w-full flex justify-center items-center">
                

                  <InvestCapital setShowQuestionScreen={setShowQuestionScreen} hustleReveal={contestant?.reveals}/>

                 
                </div>
</>
}
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
        <HustleSideBar showEmptyCard={false} showHustlerCard={true} />
      </div>
    </div>
  );
};

export default Hustle;
