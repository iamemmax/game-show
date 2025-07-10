"use client"
import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React  from "react";
import { AnimatePresence, motion } from "framer-motion";


import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import HustleStages from "../hustle/HustleStages";
import HustleSideBar from "../hustle/HustleSideBar";

const Stage2GetReadyPage = () => {

  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  const listItemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

 

 

// if(showQuestionScreen){
//     return <QuestionTwoScreen onNext={()=>null}/>

// }
  
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
            <HustleStages activeStage={2} />
          </div>
          <div className="pb-4">
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]"/>
          </div>
        </motion.div>

        {/* Center Content */}
        <div className="flex flex-col justify-between items-center min-h-full">
          {/* Top section */}
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
              className="relative w-full py-[1rem] 2xl:py-[6.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[60rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden"
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
              <div className="relative flex flex-col w-full">
          <motion.div 
  className="flex flex-col justify-between items-start gap-4 px-6  rounded-lg shadow-md"
  variants={itemVariants}
>
  <motion.h2
    className="text-[2rem] font-extrabold outline-text text-black"
    variants={itemVariants}
    animate={{
      scale: [1, 1.05, 1],
      textShadow: [
        "0px 0px 0px rgba(217, 31, 255, 0)",
        "0px 0px 10px rgba(217, 31, 255, 0.7)",
        "0px 0px 0px rgba(217, 31, 255, 0)",
      ],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
    }}
  >
    Stage 2:Rules & Format
  </motion.h2>

  <motion.p className="text-sm font-outfit text-white max-w-2xl" variants={itemVariants}>
    <strong>8 Questions:</strong> Each contestant faces 8 questions, each requiring a <strong>10-second</strong> response.
  </motion.p>

  <motion.div className="text-sm font-outfit text-white  max-w-2xl" variants={itemVariants}>
    <p><strong>Earning Points:</strong></p>
    <ul className="list-disc pl-6 ">
      <motion.li variants={listItemVariants}>Every question has a Win Amount attached.</motion.li>
      <motion.li variants={listItemVariants}>Fastest correct answer wins the amount for that question.</motion.li>
      <motion.li variants={listItemVariants}>Correct but not the fastest? No earnings.</motion.li>
      <motion.li variants={listItemVariants}>Incorrect answer? No earnings.</motion.li>
    </ul>
  </motion.div>

  <motion.div className="text-sm font-outfit text-white  max-w-3xl" variants={itemVariants}>
    <p><strong>Payout Structure</strong></p>
    <p><strong>Questions 1–4:</strong> <strong className="text-[#d91fff]">Win amount is credited directly to the winner’s purse from the game’s purse</strong>.</p>
    <p><strong>Questions 5–8:</strong></p>
    <ul className="list-disc pl-6 space-y-1">
      <motion.li variants={listItemVariants}>The fastest correct contestant chooses where the Win Amount is deducted:</motion.li>
      <motion.li variants={listItemVariants}>From one of the other 3 contestants’ purses</motion.li>
      <motion.li variants={listItemVariants}>Or evenly across all 3 other contestants</motion.li>
    </ul>
    <p><strong>Limit:</strong> <strong className="text-[#d91fff]">The maximum deduction from any single contestant is 50% of their current purse.</strong> </p>
  </motion.div>

  <motion.div className="text-sm font-outfit text-white  max-w-2xl" variants={itemVariants}>
    <p><strong>Elimination:</strong></p>
    <ul className="list-disc pl-6">
      <motion.li variants={listItemVariants}>After all 8 questions, <strong className="text-[#d91fff]">the 2 contestants with the lowest purse values are eliminated.</strong></motion.li>
      <motion.li variants={listItemVariants}>Only the top 2 contestants by purse value advance to the Dud & Pass round.</motion.li>
    </ul>
  </motion.div>

  <motion.div className="" variants={itemVariants}>
    <p className="text-base font-bold text-white ">Key Tips:</p>
    <motion.ul
      className="list-disc pl-6 leading-5 text-sm text-white font-outfit"
      variants={itemVariants}
    >
      {[
        "Speed & accuracy matter—answer fast, answer right!",
        "Play smart: your choices can impact your competitors.",
        "Only the top 2 move forward—every win counts!",
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
          </div>
        </div>

        {/* Right Sidebar */}
        <motion.div variants={itemVariants}>
          <HustleSideBar showEmptyCard={false} showHustlerCard={true}  eliminated={2} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Stage2GetReadyPage;

