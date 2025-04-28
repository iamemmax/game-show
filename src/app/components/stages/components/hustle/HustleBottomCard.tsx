import NumberCardContainer from "@/app/shared/NumberContainer";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/classNames";


interface prop{
  inline?:boolean
}
const HustleBottomCard = ({inline=false}:prop) => {
  const contestantNumbers = [
    {
      img:"/images/userImage.png",
      name: "Demola",
      numbers: [1, 2, 13, 4, 51],
    },
    { 
      img:"/images/userImage2.png",
      name: "Idris",
      numbers: [16, 7, 38, 29, 40],
    },
    {
      img:"/images/userImage3.png",
      name: "Chizoba",
      numbers: [21, 22, 43, 4, 35],
    },
    {
      img:"/images/userImage4.png",   
      name: "Emmanuel",
      numbers: [6, 7, 8, 9, 10],
    },
    {
      img:"/images/userImage5.png",
      name: "Stephen",
      numbers: [26, 47, 48, 29, 10],
    },
  ];

  return (
    <div className="relative flex overflow-hidden">
      <motion.div
        className="flex gap-3 animate-marquee"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
        whileHover={{ animationPlayState: "paused" }}
      >
        {contestantNumbers.concat(contestantNumbers).map((contestant, index) => (
          <div
            key={index}
            className={`${cn(`${inline?"flex items-center justify-center gap-[1.125rem] px-[1.6875rem]":"px-[1.125rem] "} bg-gradient-to-r from-[#13051E] via-[#000] max-w-[350px] to-[#3C1272] border-[5px] border-[#CE64FF] rounded-[1.5rem] py-2 flex-shrink-0`)}`}
          >
            <div className={`flex justify-between items-center`}>
              <div className={`${cn(`flex ${inline?"gap-x-2":"gap-4 "} items-center`)}`}>
                <div className="relative h-[1.3rem] shrink-0 w-[1.3rem] bg-[#bf7222] border-[0px] border-[#dba531] rounded-full overflow-hidden">
                  <Image
                    alt="User avatar"
                    src={contestant?.img??""}
                    fill
                    className="object-cover"
                  />
                </div>
                <p
                  className={`${cn(`${inline?"text-xs mt-2":" text-sm"}`)}text-white font-normal font-gilroyHeavy )`}
                  style={{ WebkitTextStroke: "1px #CE64FF" }}
                >
                  {contestant?.name}
                </p>
              </div>
             {!inline&& <div className="w-[.9375rem] h-[.9375rem] bg-[#04DA6A] rounded-10"></div>}
            </div>

            <div className={`${cn(`${inline?"":"mt-1"}`)} flex gap-2 `}>
              {contestant.numbers?.map((num) => (
                <div
                  key={num}
                  className="cursor-pointer transition-transform hover:scale-105"
                >  

                  <NumberCardContainer
                    text={String(num)}
                    textColor="#F2C94C"
                    width={35}
                    height={25}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default HustleBottomCard;
