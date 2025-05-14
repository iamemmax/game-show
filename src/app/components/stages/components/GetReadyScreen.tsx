"use client"
import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import { tokenStorage } from "@/utils/auth";
import { Button, ErrorModal } from "@/components/core";
import HustleStages from "./hustle/HustleStages";
import HustleSideBar from "./hustle/HustleSideBar";
import QuestionScreen from "./stage2/QuestionScreen";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";

const GetReadyScreen = () => {

const [showQuestionScreen, setshowQuestionScreen] = useState(false)
 

if(showQuestionScreen){
    return <QuestionScreen/>

}
  
  return (
    <>
 
      <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full ">
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
        <div className="flex flex-col justify-between items-center min-h-full">
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

            <div className="relative w-full py-[2rem] 2xl:py-[6.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[60rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
              <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
              <div className="relative flex flex-col items-center w-full">
              <div className="flex flex-col justify-between items-start gap-4 p-6 rounded-lg shadow-md">
  <h2 className="text-[2.75rem] font-extrabold outline-text text-black">
    Get Ready
  </h2>

  <p className="text-sm font-outfit text-white max-w-2xl">
    Welcome to the <span className="font-semibold text-[#d91fff] px-1">Fastest Finger Q&A</span> round! 
    In this stage, your speed and accuracy will be tested. Each contestant will face two questions — 
    but only the quickest correct response earns the point. Stay sharp, think fast, and respond faster!
    This round is not just about getting it right — it's about being the fastest to do so.
  </p>

  <p className="text-sm font-outfit text-white max-w-2xl">
    At the end of this round, the <span className="font-semibold text-[#d91fff] pr-2 pl-1">two contestants with the lowest scores</span> 
    will be <strong>eliminated</strong> from the competition. So bring your A-game — every second and every point counts!
  </p>

  <ul className="list-disc pl-5 leading-7 text-sm text-white font-outfit">
    <li>Each contestant gets <strong>2 questions</strong>.</li>
    <li><strong>Only the first correct answer</strong> wins the point.</li>
    <li>Speed matters — think fast, answer faster!</li>
    <li>If no one answers correctly, the question is skipped.</li>
    <li><span className="text-[#d91fff] font-semibold ">Bottom 2 contestants </span> will be eliminated after this round.</li>
  </ul>

  <div className="mt-4">
    <Button
      className="text-white font-bold py-3 px-10 rounded-lg transition duration-200"
      style={{
        background: "linear-gradient(to right, #2D0304, #EE24B8, #2D0304)",
        border: "none"
      }}
      onClick={() => setshowQuestionScreen(true)}
    >
      Proceed
    </Button>
  </div>
</div>


              
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          <HustleSideBar showEmptyCard={false} showHustlerCard={true} />
        </div>
      </div>
   
  </>
  );
};

export default GetReadyScreen;

