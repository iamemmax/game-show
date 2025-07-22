"use client";
import Logo from "@/app/icons/Logo";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import HustleStages from "./hustle/HustleStages";
import HustleSideBar from "./hustle/HustleSideBar";
// Removed import of QuestionScreen to avoid circular dependency
// import QuestionScreen from "./hustle/QuestionScreen";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { GlowyStrokeText } from "@/components/core";
// import { useMQTT } from "@/hooks/useMqttService"; // Commented out as it's not currently used

const GetReadyScreen = () => {
  console.log("GetReadyScreen component rendering");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const listItemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="getReadyScreen"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="grid grid-cols-[1.2fr_5fr_1fr] h-full"
      >
        {/* Left Sidebar */}
        <motion.div
          className="flex flex-col justify-between"
          variants={itemVariants}
        >
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo />
          </div>
          <div>
            <HustleStages />
          </div>
          <div className="pb-4">
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
          </div>
        </motion.div>

        {/* Center Content */}
        <motion.div
          className="relative w-full py-[2rem] 2xl:py-[3.5rem] px-6 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden"
          variants={itemVariants}
        >
          {/* Animated border */}
          <div className="absolute inset-0">
            <motion.div
              className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%,
                  #d91fff 0deg,
                  #d91fff 80deg,
                  #00ffff 100deg,
                  #00ffff 240deg,
                  #FFD700 220deg,
                  #FFD700 360deg,
                  #d91fff 340deg
                )`,
              }}
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 4,
                ease: "linear",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Content container */}
          <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
          <div className="relative flex flex-col items-center w-full">
            <motion.div
              className="flex flex-col justify-between items-start gap-4 p-6 rounded-lg shadow-md"
              variants={itemVariants}
            >
              <motion.div
                variants={itemVariants}
                animate={{
                  scale: [1, 1.05, 1],
                  // textShadow: [
                  //   "0px 0px 0px rgba(217, 31, 255, 0)",
                  //   "0px 0px 10px rgba(217, 31, 255, 0.7)",
                  //   "0px 0px 0px rgba(217, 31, 255, 0)",
                  // ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <GlowyStrokeText
                  className="text-[2.5rem] font-extrabold font-lucky"
                  glowColor="D91FFF"
                  glowIntensity="low"
                  fillColor="black"
                  strokeColor="#d91fff"
                  strokeWidth={2}
                >
                  Stage 1: Rules & Format
                </GlowyStrokeText>
              </motion.div>

              <motion.p
                className="text-sm font-outfit text-white max-w-2xl"
                variants={itemVariants}
              >
                <strong>8 Questions:</strong> All contestants face 8 questions
                where each questions are to be answered with{" "}
                <strong>10 seconds</strong>.
              </motion.p>

              <motion.p
                className="text-sm font-outfit text-white max-w-2xl"
                variants={itemVariants}
              >
                <strong>Bidding:</strong> Before each question, you must bid a
                portion of your starting capital.
              </motion.p>

              <motion.p
                className="text-sm font-outfit text-white max-w-2xl"
                variants={itemVariants}
              >
                {" "}
                The system suggests 4 bid amounts to choose from for every
                question. If you don't place a bid, you automatically lose the{" "}
                <strong className="text-[#d91fff]">
                  highest suggested bid amount
                </strong>{" "}
                for that question.
              </motion.p>

              <motion.p
                className="text-sm font-outfit text-white max-w-2xl"
                variants={itemVariants}
              >
                <strong>Answering:</strong> Only the{" "}
                <span className="font-semibold text-[#d91fff]">
                  fastest contestant with the correct answer
                </span>{" "}
                earns for that question. Correct but not the fastest? You keep
                your bid; no earning won or lost.
              </motion.p>

              <motion.p
                className="text-sm font-outfit text-white max-w-2xl"
                variants={itemVariants}
              >
                {" "}
                Incorrect answer? You lose the amount you bid for that question.
              </motion.p>

              <motion.p
                className="text-sm font-outfit text-white max-w-2xl"
                variants={itemVariants}
              >
                <strong>No Correct Answers:</strong> If nobody answers
                correctly, everyone loses their bid amount for that question.
              </motion.p>

              <motion.p
                className="text-sm font-outfit text-white max-w-2xl"
                variants={itemVariants}
              >
                <strong>Multipliers & Scoring:</strong> Every question has a
                multiplier. If you are the fastest correct contestant: Your
                score increases by:{" "}
                <span className="text-[#00ffff] font-semibold">
                  Bid Amount × Multiplier
                </span>
                <br />
                <strong>Example:</strong> If you bid N5,000 and the multiplier
                is 2x, you earn N5,000 × 2 = N10,000.
              </motion.p>

              <motion.p
                className="text-sm font-outfit text-white max-w-2xl"
                variants={itemVariants}
              >
                <strong>Elimination:</strong> After all 8 questions, the{" "}
                <span className="font-semibold text-[#d91fff]">
                  two contestants with the lowest scores
                </span>{" "}
                are eliminated.
              </motion.p>

              <motion.div className="mt-2" variants={itemVariants}>
                <h3 className="text-lg font-bold text-white mb-2">Key Tips:</h3>
                <motion.ul
                  className="list-disc pl-6 leading-7 text-sm text-white font-outfit"
                  variants={itemVariants}
                >
                  {[
                    "Speed and accuracy are everything—think fast, answer faster!",
                    "Choose your bids wisely; every second and every point counts.",
                  ].map((tip, index) => (
                    <motion.li key={index} variants={listItemVariants}>
                      {tip}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div variants={itemVariants}>
          <HustleSideBar showEmptyCard={false} showHustlerCard={true} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GetReadyScreen;
