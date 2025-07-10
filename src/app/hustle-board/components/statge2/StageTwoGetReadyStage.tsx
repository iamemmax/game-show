"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import { GlowyStrokeText } from "@/components/core";

const StageTwoGetReadyStage = () => {
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
        <div className="flex flex-col justify-between items-center min-h-full">
          <div className="flex flex-col w-full items-center">
            <motion.div
              className="w-full h-[100px] flex items-center justify-center"
              variants={itemVariants}
            >
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
            </motion.div>

            <motion.div
              className="relative w-full py-[2rem] 2xl:py-[1.5rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden"
              variants={itemVariants}
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
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 4,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
              </div>

              {/* Inner container */}
              <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
              <div className="relative flex flex-col items-center w-full">
                <motion.div
                  className="flex flex-col justify-between w-full items-start gap-4 px-6 rounded-lg shadow-md"
                  variants={itemVariants}
                >
                  <motion.div
                    variants={itemVariants}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <GlowyStrokeText
                      className="text-[3.75rem] font-extrabold"
                      glowColor="D91FFF"
                      glowIntensity="low"
                      fillColor="black"
                      strokeColor="#d91fff"
                      strokeWidth={3}
                    >
                      Stage 2:Rules & Format
                    </GlowyStrokeText>
                  </motion.div>

                  <motion.p className="text-2xl font-outfit text-white" variants={itemVariants}>
                    <strong>8 Questions:</strong> Each contestant faces 8 questions, each requiring a <strong>10-second</strong> response.
                  </motion.p>

                  <motion.p className="text-2xl font-outfit text-white" variants={itemVariants}>
                    <strong>Earning Points:</strong> Every question has a Win Amount attached.
                  </motion.p>

                  <motion.ul className="pl-6 list-disc text-2xl text-white space-y-2 font-outfit" variants={itemVariants}>
                    <motion.li variants={listItemVariants}>Fastest correct answer wins the amount for that question.</motion.li>
                    <motion.li variants={listItemVariants}>Correct but not the fastest? No earnings.</motion.li>
                    <motion.li variants={listItemVariants}>Incorrect answer? No earnings.</motion.li>
                  </motion.ul>

                  <motion.p className="text-2xl font-outfit text-white mt-4" variants={itemVariants}>
                    <strong>Payout Structure</strong>
                  </motion.p>

                  <motion.p className="text-2xl font-outfit text-white" variants={itemVariants}>
                    <strong>Questions 1–4:</strong> Win amount is credited directly to the winner’s purse from the game’s purse.
                  </motion.p>

                 <motion.div
  className="text-2xl font-outfit text-white space-y-4"
  variants={itemVariants}
>
  {/* Intro line */}
  <motion.p variants={itemVariants}>
    <strong>Questions 5–8:</strong> The fastest correct contestant chooses where the Win Amount is deducted:
  </motion.p>

  {/* Bullet list with animation */}
  <motion.ul
    className="list-disc leading-[2.5rem] pl-6 space-y-2"
    initial="hidden"
    animate="visible"
    variants={containerVariants} // Optional: adds staggered appearance
  >
    <motion.li variants={listItemVariants}>
      From one of the other 3 contestants’ purses
    </motion.li>
    <motion.li variants={listItemVariants}>
      Evenly across all 3 other contestants
    </motion.li>
  </motion.ul>

  {/* Limit explanation */}
  <motion.p variants={itemVariants}>
    <strong>Limit:</strong> The maximum deduction from any single contestant is 50% of their current purse.
  </motion.p>
</motion.div>


                  <motion.p className="text-2xl font-outfit text-white" variants={itemVariants}>
                    <strong>Elimination:</strong> After all 8 questions, the <span className="text-[#d91fff] font-semibold">2 contestants with the lowest purse values</span> are eliminated.
                    <br />
                    Only the top 2 contestants by purse value advance to the <strong>Dud & Pass</strong> round.
                  </motion.p>

                  <motion.div className="mt-4" variants={itemVariants}>
                    <h3 className="text-3xl font-bold text-white mb-2">Key Tips:</h3>
                    <motion.ul className="list-disc pl-6 leading-[3rem] text-2xl text-white font-outfit" variants={itemVariants}>
                      <motion.li variants={listItemVariants}>Speed & accuracy matter—answer fast, answer right!</motion.li>
                      <motion.li variants={listItemVariants}>Play smart: your choices can impact your competitors.</motion.li>
                      <motion.li variants={listItemVariants}>Only the top 2 move forward—every win counts!</motion.li>
                    </motion.ul>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Sidebar */}
        <motion.div variants={itemVariants}>
          <HustleSideBar showEmptyCard={false} showHustlerCard={true} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StageTwoGetReadyStage;
