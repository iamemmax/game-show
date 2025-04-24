import Logo from "@/app/icons/Logo";
import StartUpIcon from "@/app/icons/StartupIcon";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HustleStages from "../hustle/HustleStages";
import HustleSideBar from "../hustle/HustleSideBar";
import NumberCardContainer from "@/app/shared/NumberContainer";
import PrizeCard from "@/app/shared/PrizeCard";

const QuestionScreen = () => {
   const [timeLeft, setTimeLeft] = useState<number>(15);
  
    // Countdown Timer
    useEffect(() => {
      let interval: NodeJS.Timeout;
  if(timeLeft  >0){
       interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }else{
      setTimeLeft(0)

  }
  
      return () => clearInterval(interval);
    }, [timeLeft]);
  
const constestandArray = [
    {
        name: "Demola",
        number_pick :2,
        img: "/images/userImage3.png",  
    },
    {
        name: "Idris",
        number_pick :7,
        img: "/images/userImage2.png",  
    },
    {
        name: "Ola",
        number_pick :14,
        img: "/images/userImage.png",  
  },
    {
        name: "Demola",
        number_pick :9,
        img: "/images/userImage3.png",  
    },
    {
        name: "Edmund",
        number_pick :10,
        img: "/images/userImage4.png",  
    },
    {
        name: "Idris",
        number_pick :12,
        img: "/images/userImage3.png",  
    },
    {
        name: "Edmund",
        number_pick :18,
        img: "/images/userImage4.png",  
    },


    {
        name: "Ola",
        number_pick :24,
        img: "/images/userImage.png",  
    },
]

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
                <p  className="text-sm font-normal text-[#D5B9FF]">Select minimum of 2 number to determine the trivia questions for this round</p>
              </div>
              <div>
                <h2 className="font-extrabold text-[2.75rem] text-white">{`0:${timeLeft.toString().padStart(2, "0")}`}</h2>
              </div>
            </div>

          

          <div className="grid mt-5 grid-cols-[1fr_3fr_1fr]">
            <div className="flex gap-2 flex-col">
{
    constestandArray?.map((contestant,idx:number)=>(
        <div className="flex gap-2 items-center" key={idx}>
            <div className="">
            <NumberCardContainer
                    text={String(contestant?.number_pick)}
                    textColor="#F2C94C"
                    width={35}
                    height={35}
                  />
            </div>
            <div className="flex items-center gap-2">
                <div className="relative h-[1.6875rem] w-[1.6875rem]">
                    <Image
                        alt="" 
                        src={contestant?.img}
                        fill
                        className="object-cover rounded-full"
                    />
                </div>
                <p className="text-white text-xs font-gilroyMedium">{contestant?.name}</p>
            </div>

        </div>
))}

            </div>
            <div className="relative">
                <div className="border-[.3125rem] relative border-[#D71BFA] flex justify-center px-[2.125rem] items-center py-[3rem] rounded-[1.5rem] bg-[#000000]">
                    <h2 className="text-white text-[1.5rem] text-center font-gilroyHeavy font-extrabold">What is the Biggest market in West Africa?</h2>
                    <div className="absolute -bottom-8 "
    
>

<PrizeCard 
  title="Win amount" 
  amount="₦500,000"
  width={250}
  height={60}
  backgroundColor="#C76000"
  gradientColors={{
    start: "#FFD700",
    end: "#FFA500"
  }}
  titleStyle={{
    fontSize: 16,
    fontFamily: "gilroyHeavy",
    fontWeight: "bold",
    fill: "#1E1E1E",
    // strokeWidth: 1,
    yPosition: 30  // Changed from 35 to 25
  }}
  amountStyle={{
    fontSize: 28,
    fontFamily: "gilroyHeavy",
    fontWeight: "700",
    fill: "#FFFFFF",
    strokeWidth: 2,
    strokeColor: "#C76000",
    yPosition: 68  // Changed from 70 to 80
  }}
  className="transform transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
  titleClassName="text-[#1E1E1E]"
  amountClassName=""
/>
</div>
                </div>
            </div>
            <div className="">3</div>
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


