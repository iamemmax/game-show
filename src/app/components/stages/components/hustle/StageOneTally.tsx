import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useState } from "react";
import HustleStages from "./HustleStages";
import HustleSideBar from "./HustleSideBar";
import HustleBottomCard from "./HustleBottomCard";
import { motion } from "framer-motion";
import Image from "next/image";
import StageTallyCard from "@/app/shared/StageTallyCard";
import { addCommasToNumber } from "@/utils";
import { cn } from "@/utils/classNames";
import { Button } from "@/components/core";
import ProveHustle from "../stage2/ProveHustle";

const StageOneTally = () => {
  const [goToStage2 , setGoToStage2 ] = useState(false);

  const tallyArray = [
    {
      name: "Demola",
      capital: "120000",
      img: "/images/userImage3.png",
      title: "PRO HUSTLER",
      amount: "250000",
      isEliminated: false,
    },
    {
      name: "Idris",
      capital: "120000",
      img: "/images/userImage2.png",
      title: "SUPER HUSTLER",
      amount: "170000",
      isEliminated: false,
    },
    {
      name: "Chizoba",
      capital: "140000",
      img: "/images/userImage3.png",
      title: "MINI HUSTLER",
      amount: "140000",
      isEliminated: false,
    },
    {
      name: "Edmund",
      capital: "160000",
      img: "/images/userImage4.png",
      title: "MICRO HUSTLER",
      amount: "250000",
      isEliminated: false,
    },
    {
      name: "Temidayo",
      capital: "190000",
      img: "/images/userImage5.png",
      title: "ELIMINATED",
      amount: "700000",
      isEliminated: true,
    },
    {
      name: "Adekunle",
      capital: "1200000",
      img: "/images/userImage2.png",
      title: "ELIMINATED",
      amount: "50000",
      isEliminated: true,
    },
  ];


  if(goToStage2){
    return <ProveHustle/>
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
      <div className="flex  flex-col justify-between items-center min-h-full">
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
            className="relative w-full py-[1rem] 2xl:py-[2.5rem] max-xl:max-w-[40.5rem] 2xl:max-w-[60rem] px-4 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden"
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
            <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
            <div className="relative">
              <div className="flex justify-center flex-col items-center">
                <div>
                  <h2 className="text-[2.5rem] text-center font-extrabold outline-text text-black">
                    Stage tally
                  </h2>
                </div>

                <motion.div
                  className="flex items-center gap-1 2xl:gap-2 flex-col"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.5, // Increased from 0.2 to 0.5 seconds
                      },
                    },
                  }}
                >
                  {tallyArray.map((tally) => (
                    <motion.div
                      key={tally.name}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.8, // Added longer duration for each item
                            ease: "easeOut",
                          },
                        },
                      }}
                      className={`flex justify-center gap-[.6875rem] 2xl:gap-1 items-center ${tally.isEliminated ? "opacity-50" : ""}`}
                    >
                      <div className="h-[3.125rem] grid grid-cols-[1fr_3fr]  2xl:grid-cols-[1fr_2fr] w-[7.8125rem] bg-[#1C0240] 2xl:h-[3.8rem] p-2 border border-[#7E3CE0] rounded-[.4594rem]">
                        <div className="shrink-0">
                        <Image
                          alt=""
                          src={tally?.img}
                          width={18}
                          height={18}
                          className="rounded-full shrink-0 2xl:w-[30px] 2xl:h-[30px]"
                        />
                        </div>
                        <div className={`${cn(` flex flex-col`)}`}>
                          <p className="text-xs 2xl:text-sm font-gilroyMedium font-normal text-white">
                            {tally.name}
                          </p>
                          <p className="text-xs 2xl:text-sm font-gilroyMedium font-normal text-white">
                            {tally.capital}
                          </p>
                        </div>
                      </div>
                      <div className="">
                        <StageTallyCard
                          text={tally?.title}
                          fontSize={30}
                          className="2xl:w-[700px] 2xl:h-[90px]"
                          color="#fff"
                          amount={`₦${addCommasToNumber(Number(tally?.amount) ?? 0)}`}
                          badgeColor={
                            tally?.isEliminated ? "#760F1B" : "#035D2E"
                          }
                          backgroundGradient={{
                            endColor: tally?.isEliminated
                              ? "#980306"
                              : "#03984A",
                            startColor: tally?.isEliminated
                              ? "#FE8E8E"
                              : "#8EFE9B",
                          }}
                          gradientId={`gradient-${tally.name}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
            <Button className="bg-red-700 text-white" onClick={()=>setGoToStage2(true)}>Proceed</Button>

        {/* Bottom Card (sticks to bottom) */}
        <div className="w-full max-w-[35rem] lg:max-w-[46.5rem] 2xl:max-w-[80rem] mt-2">
          <HustleBottomCard inline={true} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar />
      </div>
    </div>
  );
};

export default StageOneTally;
