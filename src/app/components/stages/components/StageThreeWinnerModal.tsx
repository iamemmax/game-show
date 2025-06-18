// components/WinnerModal.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import PassComponent from "./stage3/PassComponent";
import Logo from "@/app/icons/Logo";
import PassCard from "./stage3/PassCard";
import YouWonText from "./stage3/YouWonText";



export default function StageThreeWinnerModal() {
  return (
    <div className="fixed inset-0   bg-[url('/images/stage-3-bg.svg')] bg-cover bg-no-repeat !z-[999999999]  flex flex-col items-center justify-center text-white px-6">
      {/* Top Heading */}
      <div className="text-center mb-7">
        <Logo width={200} height={100}/>
      </div>

      {/* Pass Card Animation */}
      <div className="relative h-[400px]  flex justify-center items-center flex-col">
      <motion.div
      className="absolute -top-[3.6rem]"
        initial={{ y: -100, scale: 0.7 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
       <PassCard/>
      </motion.div>
      <motion.div
className="!z-[99999]"
        initial={{ y: -100, scale: 0.7 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
       <Image
       alt="image"
       src={"/images/pro-img.png"}
       width={250}
       height={250}
       />
      </motion.div>

      <motion.div
      className="absolute bottom-4"
        initial={{ y: -100, scale: 0.7 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
       <YouWonText/>
      </motion.div>

      {/* Winner Face */}
 {/* CTA */}

      </div>
      <button className="bg-[#390047] border-[3px] border-[#f18b1e] hover:bg-purple-800 text-[#f18b1e] font-gilroyBold font-semibold px-6 py-3 rounded-full shadow-lg transition-all">
        SHARE YOUR WIN
      </button>

   
    </div>
  );
}
