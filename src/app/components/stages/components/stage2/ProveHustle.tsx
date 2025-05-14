import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NumberCardContainer from "@/app/shared/NumberContainer";
import { Button } from "@/components/core";
import GradientButton from "@/app/shared/GradientButton";
import QuestionScreen from "./QuestionScreen";

const ProveHustle = () => {
  const [showQuestionScreen, setShowQuestionScreen] = useState(false);

  
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  // Countdown Timer

  // Handle number click
  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < 2) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const isSelected = (num: number) => selectedNumbers.includes(num);


  if (showQuestionScreen) {
    return <QuestionScreen />;
  }

  return (
    <div className="grid grid-cols-[1fr_5.2fr_1fr] h-full">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>{/* <HustleStages /> */}</div>
      </div>

      {/* Center Content */}
      <div className="flex flex-col justify-between items-center min-h-full">
        <div className="flex flex-col w-full items-center">
          <div className="w-full h-[100px] flex items-center justify-center">
            <HeaderTitleContainer
              backgroundColor="#791192"
              color="#ed99ff"
              text="Pick-pad"
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

          <div
            className="relative w-full py-[2rem] 2xl:py-[5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[60rem] px-10 -mt-3 rounded-[.875rem] 2xl:px-[3rem] shadow-3xl overflow-hidden"
            style={{
              backdropFilter: "blur(174px)",
              WebkitBackdropFilter: "blur(174px)", // For Safari support
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

            {/* Content container */}
            <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
            <div className="relative">
              <div className="flex justify-center flex-col items-center">
                <h2 className="text-[2.125rem] text-center font-gilroyHeavy font-extrabold outline-text text-black">
                  Stage 1: Prove your hustle
                </h2>
                <p className="text-sm font-normal text-[#D5B9FF]">
                  Select minimum of 2 number to determine the trivia questions
                  for this round
                </p>
              </div>

              <div className="py-3 flex justify-center items-center">
                <div className="flex flex-wrap max-md:gap-[1.125rem] gap-4 2xl:gap-5 max-xl:gap-y-5 2xl:gap-y-8  2xl:mt-8">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                    <div
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <NumberCardContainer
                        text={String(num)}
                        textColor={isSelected(num) ? "#fff" : "#F2C94C"}
                        //    className="2xl:w-[]"
                        primaryGradientEndColor={
                          isSelected(num) ? "#FF00FF" : "#3C1272"
                        }
                        backgroundColor={isSelected(num) ? "#FEC124" : "black"}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className=" mt-2 flex w-full justify-center  2xl:mt-6 items-center">
                <Button
                  className="p-0 bg-transparent"
                  onClick={() => setShowQuestionScreen(true)}
                >
                  {" "}
                  <GradientButton
                    text="Submit"
                    className="uppercase"
                    height={40}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* <StageTallyCard text="PRO HUSTLER" fontSize={36} color="#fff" amount={" ₦30000"} 
badgeColor="#035D2E"
backgroundGradient={{endColor:"#03984A",startColor:"#8EFE9B"}}
/> */}
        </div>

        {/* Bottom Card */}
        <div className="w-full max-w-[35rem] lg:max-w-[46.5rem] 2xl:max-w-[80rem] mt-2">
          {/* <HustleBottomCard /> */}
        </div>
      </div>

      {/* Right Sidebar */}
      {/* <div>
        <HustleSideBar />
      </div> */}
    </div>
  );
};

export default ProveHustle;
