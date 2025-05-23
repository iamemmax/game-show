"use client"
import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import HustleStages from "./hustle/HustleStages";
import HustleSideBar from "./hustle/HustleSideBar";
// Removed import of QuestionScreen to avoid circular dependency
// import QuestionScreen from "./hustle/QuestionScreen";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
// import { useMQTT } from "@/hooks/useMqttService"; // Commented out as it's not currently used

const GetReadyScreen = () => {
  // MQTT hooks are kept for future use but not currently used
  // const { isConnected, onMessage } = useMQTT();
  // const [showQuestionScreen, setshowQuestionScreen] = useState(false);

  // Add debug log to track component rendering
  console.log("GetReadyScreen component rendering");

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

  // useEffect(() => {
  //   if (isConnected) {
  //     const handler = (receivedMessage: any) => {
  //       console.log("Main page received message:", receivedMessage);

  //       // Handle stage transition events
  //       if (receivedMessage?.event === "game_s1_question_reveal") {
  //         // Proceed to the next stage
  //         setshowQuestionScreen(true);
  //       }
  //     };

  //     // Register the message handler
  //     onMessage(handler);

  //     // Clean up function to remove the handler when component unmounts
  //     return () => {
  //       onMessage(null);
  //     };
  //   }
  // }, [isConnected, onMessage]);

  // if(showQuestionScreen){
  //   return <QuestionScreen/>
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
            <HustleStages />
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
              className="relative w-full py-[2rem] 2xl:py-[6.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[60rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden"
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
              <div className="relative flex flex-col items-center w-full">
                <motion.div
                  className="flex flex-col justify-between items-start gap-4 p-6 rounded-lg shadow-md"
                  variants={itemVariants}
                >
                  <motion.h2
                    className="text-[2.75rem] font-extrabold outline-text text-black"
                    variants={itemVariants}
                    animate={{
                      scale: [1, 1.05, 1],
                      textShadow: ["0px 0px 0px rgba(217, 31, 255, 0)", "0px 0px 10px rgba(217, 31, 255, 0.7)", "0px 0px 0px rgba(217, 31, 255, 0)"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    Get Ready
                  </motion.h2>

                  <motion.p
                    className="text-sm font-outfit text-white max-w-2xl"
                    variants={itemVariants}
                  >
                    Welcome to the <span className="font-semibold text-[#d91fff] px-1">Fastest Finger Q&A</span> round!
                    In this stage, your speed and accuracy will be tested. Each contestant will face two questions —
                    but only the quickest correct response earns the point. Stay sharp, think fast, and respond faster!
                    This round is not just about getting it right — it's about being the fastest to do so.
                  </motion.p>

                  <motion.p
                    className="text-sm font-outfit text-white max-w-2xl"
                    variants={itemVariants}
                  >
                    At the end of this round, the <span className="font-semibold text-[#d91fff] pr-2 pl-1">two contestants with the lowest scores</span>
                    will be <strong>eliminated</strong> from the competition. So bring your A-game — every second and every point counts!
                  </motion.p>

                  <motion.ul
                    className="list-disc pl-5 leading-7 text-sm text-white font-outfit"
                    variants={itemVariants}
                  >
                    {[
                      "Each contestant gets <strong>2 questions</strong>.",
                      "<strong>Only the first correct answer</strong> wins the point.",
                      "Speed matters — think fast, answer faster!",
                      "If no one answers correctly, the question is skipped.",
                      "<span className=\"text-[#d91fff] font-semibold \">Bottom 2 contestants </span> will be eliminated after this round."
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        variants={listItemVariants}
                        dangerouslySetInnerHTML={{ __html: item }}
                      />
                    ))}
                  </motion.ul>
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

export default GetReadyScreen;

