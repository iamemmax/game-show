"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import PassComponent from "./stage3/PassComponent";
import Logo from "@/app/icons/Logo";
import PassCard from "./stage3/PassCard";
import YouWonText from "./stage3/YouWonText";


interface prop{
  name: string
  balance: string;
  imgUrl?:string
}
export default function StageThreeWinnerModal({name, balance,imgUrl}:prop) {
  console.log(balance);
  
  useEffect(() => {
    const audio = new Audio("/sounds/success-sound.wav");
    audio.play().catch((e) => {
      console.warn("Audio failed to play automatically:", e);
    });
  }, []);

  return (
    <div className="fixed w-full inset-0 bg-[url('/images/stage-3-bg.svg')] bg-cover bg-no-repeat !z-[999999999] flex flex-col items-center justify-center text-white px-6">
      {/* Top Heading */}
      <div className="text-center mb-7">
        <Logo width={200} height={100} />
      </div>

      {/* Pass Card Animation */}
      <div className="relative h-[400px] w-full flex justify-center items-center flex-col">
        <motion.div
          className="absolute -top-[3.6rem]"
          initial={{ y: -100, scale: 0.7 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <PassCard />
        </motion.div>

        <motion.div
          className="!z-[99999]"
          initial={{ y: -100, scale: 0.7 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Image alt="image" src={imgUrl as string ?? "/"} width={250} height={250} />
        </motion.div>

        <motion.div
          className="!z-[9999999999]"
        
        >
       
       <h2 className="font-gilroyBold uppercase text-center text-[4.25rem] font-extrabold text-[#e79b0c]">{name} <br /> You won the pass</h2>
     
     <div className="bg-[#001B10] px-6 py-2 rounded-[1.25rem]">
  <p className="text-[22px] font-semibold text-[#00FF84] drop-shadow-[0_0_5px_#00FF84]">
    Earnings: <span className="font-bold">₦{balance.toLocaleString()??0}</span>
  </p>
</div>
        </motion.div>
      </div>
    </div>
  );
}
