import Logo from "@/app/icons/Logo";
import StartUpIcon from "@/app/icons/StartupIcon";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HustleStages from "../hustle/HustleStages";
import HustleSideBar from "../hustle/HustleSideBar";

const QuestionScreen = () => {
  const [ShowInvestResult, setShowInvestResult] = useState(false)
   const [timeLeft, setTimeLeft] = useState<number>(15);
    const [autoPicked, setAutoPicked] = useState<boolean>(false);
  
    // Countdown Timer
    useEffect(() => {
      
  
      const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
  
      return () => clearInterval(interval);
    }, [timeLeft]);
  
  return (
    <div className="grid grid-cols-[1fr_5fr_1fr] h-full ">
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
              Stage 2 of 6
            </p>
            <p className="max-w-[100px] text-center mt-1 font-display font-bold text-xs text-white">
              Hustle: Fashion Designer
            </p>
          </div>
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

          <div className="relative w-full py-[1rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[60rem] px-4 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
            <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
            <div className="relative">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-[2.125rem] font-extrabold outline-text text-black">
                  Stage 2: Prove your hustle
                </h2>
              </div>
              <div>
                <h2 className="font-extrabold text-[2.75rem] text-white">{`0:${timeLeft.toString().padStart(2, "0")}`}</h2>
              </div>
            </div>

            <div className="flex flex-wrap max-md:gap-[18px] gap-[8px] 2xl:gap-[.875rem] max-xl:gap-y-5 2xl:gap-y-8  2xl:mt-8">
              {Array.from({ length: 49 }, (_, i) => i + 1).map(num => (
                <div
                  key={num}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar />
      </div>
    </div>
  );
};

export default QuestionScreen;

