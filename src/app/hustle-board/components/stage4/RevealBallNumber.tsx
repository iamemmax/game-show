"use client";

import React from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import { GlowyStrokeText } from "@/components/core";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import NumberCardContainer from "@/app/shared/NumberContainer";

import { useMQTT } from "@/hooks/useMqttService";
import { tokenStorage } from "@/utils/auth";
import { useGetAllHustleNumbers } from "@/app/components/stages/api/stage1/getAllHustlePicks";
import ErrorIcon from "@/app/icons/ErrorIcon";
import { cn } from "@/utils/classNames";
import CheckIcon from "@/app/icons/CheckIcon";
import KillerHustlePulledModal from "./KillerModal";
import CrystalModal from "./CrystalModal";
import WinnerBallModal from "./WinnerModal";

const RevealBallNumber = () => {
  const { isConnected, onMessage } = useMQTT();
  const user = tokenStorage.getUser();
  const params = useParams();

  const { data: hustlePicksData } = useGetAllHustleNumbers(
    Number(params?.episodeId)
  );
  const pickNumbers = [3, 10, 41, null, null];
  

  return (
    <div className="min-h-screen grid grid-cols-[1fr_5fr_1fr] h-full">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>
          <HustleStages activeStage={4} />
        </div>
        <div className="pb-4">
          <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
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
              text="Hustle Board"
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

          <div className="relative flex flex-col justify-between w-full flex-grow px-6 py-[2.5rem] -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

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
              />
            </div>

            {/* Content Container */}
            <div className="absolute inset-[8px] py-[3.75rem] bg-[#13051E] bg-[url('/images/host-bg.png')] bg-no-repeat bg-cover rounded-[.675rem]" />

            {/* Actual Content */}
            <div className="relative z-10 flex flex-col justify-between h-full w-full">
              {/* Title & Subtitle */}
              <div className="flex flex-col items-center text-center">
                <GlowyStrokeText
                  strokeWidth={2}
                  strokeColor="#D91FFF"
                  glowColor="#13051E"
                  glowIntensity="low"
                  textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
                  fillColor="#000"
                >
                  Golden Hustle Match
                </GlowyStrokeText>
                <p className="text-lg font-normal text-[#D5B9FF]">
                  Tap each hustle card below to determine how you want to invest
                </p>
              </div>

              {/* Top: Hustle Picks */}
              <div className="flex justify-center mt-8">
                <div className="flex border-[4px] divide-x shadow-[0_4px_20px_#8700C7] divide-[#4B1874] rounded-[20px] py-[10.35px] px-3 border-[#CE64FF]">
                  {hustlePicksData?.data[0]?.picks?.map((num) => (
                    <div key={num} className="px-4">
                      <NumberCardContainer
                        text={String(num)}
                        textColor="#F2C94C"
                        width={80}
                        height={85}
                        className="cursor-pointer transition-transform hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 mt-6">
                {/* <KillerHustlePulledModal isOpen={true} /> */}
                {/* <CrystalModal isOpen={true} /> */}
                <WinnerBallModal isOpen={true} />
              </div>

              {/* Bottom: Picked Numbers */}
              <div className="flex justify-center items-center mt-10 mb-6">
                <div className="flex items-center justify-center">
                  {pickNumbers.map((x, idx) => {
                    const isMatched =
                      x !== null && hustlePicksData?.data[0]?.picks.includes(x);
                    const status =
                      x === null ? "default" : isMatched ? "correct" : "error";

                    return (
                      <div
                        key={idx}
                        className="px-4 flex items-center flex-col justify-center"
                      >
                        <NumberCardContainer
                          text={x !== null ? String(x) : ""}
                          textColor="#F2C94C"
                          width={x !== null ? 80 : 140}
                          height={x !== null ? 85 : 145}
                          className="cursor-pointer transition-transform hover:scale-105"
                          status={status}
                        />

                        {x !== null &&
                          (isMatched ? (
                            <div className="w-[2.6519rem] h-[2.212rem] flex justify-center items-center rounded-[.4006rem] bg-[#10A151] mt-2">
                              <CheckIcon size={20} />
                            </div>
                          ) : (
                            <div className="w-[2.6519rem] h-[2.52512rem] flex justify-center items-center rounded-[.4006rem] bg-[#eb001b] mt-2">
                              <ErrorIcon
                                height={17}
                                width={17}
                                color="#bc061b"
                              />
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
                <div className="w-[6.8563rem] h-[6.8563rem] bg-white rounded-full flex justify-center flex-col items-center">
                  <p className="font-display block text-black font-black text-[2rem]">
                    2/5
                  </p>
                  <p className="block -mt-2 text-base font-display font-bold uppercase">
                    match
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar
          showEmptyCard={false}
          showHustlerCard={true}
          eliminated={2}
        />
      </div>
    </div>
  );
};

export default RevealBallNumber;
