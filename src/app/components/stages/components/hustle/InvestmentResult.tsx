import Logo from "@/app/icons/Logo";
// import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import StartUpIcon from "@/app/icons/StartupIcon";
import { convertNumberToNaira } from "@/utils/currency";
import { addCommasToNumber } from "@/utils";
import StageTallyCard from "@/app/shared/StageTallyCard";
import { Button } from "@/components/core";
import StageOneTally from "./StageOneTally";

const InvestmentResult = () => {
  const [showStageOneTally, setShowStageOneTally] = useState(false)
  const investmentArray = [
    {
      name: "Caterer",
      amount: 20000,
      inverment_profit: "2x",
    },
    {
      name: "Agri tech",
      amount: 20000,
      inverment_profit: "3x",
    },
    {
      name: "Fashion",
      amount: 20000,
      inverment_profit: "2x",
    },
    {
      name: "Fintech",
      amount: 20000,
      inverment_profit: "4x",
    },
    {
      name: "Barber",
      amount: 60000,
      inverment_profit: "-50%",
    },
  ];

  if(showStageOneTally){
    return <StageOneTally/>
  }
  return (
    <div className="grid grid-cols-[1fr_5.2fr_1fr] h-full">
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>{/* <HustleStages /> */}</div>
        {/* <div className="w-full p-[1.4375rem] flex-col rounded-t-[1.75rem] flex justify-center items-center bg-[linear-gradient(to_right,_#2D0304,_#EE24B8,_#1E0227)] text-white">
          <Trophy height={50} width={50} />
          <div className="flex flex-col justify-center pt-1 items-center">
            <p className="uppercase font-bold text-xs font-verdana text-white">
              Investment Results
            </p>
            
          </div>
        </div> */}
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
              borderGradientEnd="#e151fe"
              fontSize={45}
              fontFamily="Verdana"
              textStrokeColor="#a219c1"
              textStrokeWidth={4.4}
            />
          </div>

          <div className="relative w-full py-[5rem] 2xl:py-[8rem] max-xl:max-w-[46.5rem] 2xl:max-w-[60rem] px-4 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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
                <h2 className="text-[2.125rem] text-center font-extrabold outline-text text-black">
                  Stage 1: Hustle Kick-off
                </h2>
                <p className="text-sm font-normal text-[#D5B9FF]">
                  Tap each hustle card below to determine how you want to invest
                </p>
                <div className="mt-6 relative w-full flex justify-center items-center">
                  <div className="flex mt-2 items-center gap-[1.375rem]">
                    {/* Player Info */}
                    <div className="flex bg-black rounded-10 gap-4 px-[1.125rem] pr-[5rem] items-center py-2">
                      <div className="relative h-[2.8rem] w-[2.8rem] bg-[#bf7222] border-[5px] border-[#dba531] rounded-full overflow-hidden">
                        <Image
                          alt="User avatar"
                          src="/images/userImage3.png"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white font-normal text-xs font-gilroyMedium">
                          Demola
                        </p>
                        <h2 className="text-sm font-medium font-gilroyMedium text-white outline-text-white-2">
                          Player 1
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
                          ₦900,000
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-6 text-white gap-4">
                  {investmentArray?.map((invest, idx: number) => (
                    <div className="" key={idx}>
                      <div className="bg-[#1E083B] rounded-[0.6rem] px-4 py-[0.5rem] flex justify-center items-center">
                        {/* <p className="text-sm font-verdana text-white" style={{ WebkitTextStroke: "0.5px rgba(60, 18, 114, 1" }}>{invest?.name}</p> */}
                        <p
                          className="text-sm font-verdana font-extrabold"
                          style={{
                            WebkitTextStroke: "1px #3C1272",
                            WebkitTextFillColor: "white", // Force fill color
                          }}
                        >
                          {invest?.name}
                        </p>
                      </div>
                      <div className="border border-[#9E5CFF]  mt-4 rounded-10 py-[.875rem] px-[1.36rem] flex justify-center items-center flex-col">
                        <p
                          className="font-gilroyHeavy text-xl font-semibold"
                          style={{
                            WebkitTextStroke: "0.5px #E00FFF",
                            textShadow:
                              "0 4.54px 20.42px 0px rgba(158, 92, 255, 1)",
                          }}
                        >
                          {" "}
                          ₦
                          {addCommasToNumber(
                            Number(invest?.amount?.toFixed(0))
                          )}
                        </p>
                        <p
                          className="font-gilroyHeavy text-[24px] font-bold mt-2"
                          style={{
                            WebkitTextStroke: "0.8px #E00FFF",
                            textShadow:
                              "0 4.54px 20.42px 0px rgba(158, 92, 255, 1)",
                          }}
                        >
                          {invest?.inverment_profit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



           <div className="py-3 flex justify-center items-center">
           <Button className="bg-red-700" onClick={()=>setShowStageOneTally(true)}>Proceed</Button>
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

export default InvestmentResult;
