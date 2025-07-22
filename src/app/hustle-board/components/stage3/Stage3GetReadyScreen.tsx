
// "use client"
// import Logo from "@/app/icons/Logo";
// import Trophy from "@/app/icons/Trophy";
// import HeaderTitleContainer from "@/app/shared/HeaderContainer";
// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// // Removed import of QuestionScreen to avoid circular dependency
// // import QuestionScreen from "./hustle/QuestionScreen";
// import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
// import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
// import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
// import { useMQTT } from "@/hooks/useMqttService";
// import Stage3CardSelectionScreens from "./Stage3CardSelectionScreen";
// // import { useMQTT } from "@/hooks/useMqttService"; // Commented out as it's not currently used


// const Stage3BoardGetReadyPage = () => {
//     const { isConnected, addMessageListener, removeMessageListener } = useMQTT();
  
//     const [showCardRevealScreen, setShowCardRevealScreen] = useState(false)
  
//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         duration: 0.5,
//         when: "beforeChildren",
//         staggerChildren: 0.2
//       }
//     },
//     exit: {
//       opacity: 0,
//       transition: { duration: 0.3 }
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: { duration: 0.5, ease: "easeOut" }
//     }
//   };

//   const listItemVariants = {
//     hidden: { x: -10, opacity: 0 },
//     visible: {
//       x: 0,
//       opacity: 1,
//       transition: { duration: 0.3, ease: "easeOut" }
//     }
//   };



 
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key="getReadyScreen"
//         initial="hidden"
//         animate="visible"
//         exit="exit"
//         variants={containerVariants}
//         className="grid grid-cols-[1.2fr_5fr_1fr] h-full"
//       >
//         {/* Left Sidebar */}
//         <motion.div
//           className="flex flex-col justify-between"
//           variants={itemVariants}
//         >
//           <div className="flex justify-center items-center h-3.5 w-full mt-8">
//             <Logo />
//           </div>
//           <div>
//             <HustleStages />
//           </div>
//           <div className="pb-4">
//             <Salary4LifeTrophy className="max-xl:h-[13.25rem]"/>
//           </div>
//         </motion.div>

//         {/* Center Content */}
//         <div className="flex flex-col justify-between items-center min-h-full">
//           {/* Top section */}
//           <div className="flex flex-col w-full items-center">
//             <motion.div
//               className="w-full h-[100px] flex items-center justify-center"
//               variants={itemVariants}
//             >
//               <HeaderTitleContainer
//                 backgroundColor="#791192"
//                 color="#ed99ff"
//                 text="Pick-Pad"
//                 textGradientEnd="#8E17AA"
//                 textGradientStart="#8E17AA"
//                 borderGradientStart="#f712fc"
//                 borderGradientEnd="#e151fe"
//                 fontSize={45}
//                 fontFamily="Verdana"
//                 textStrokeColor="#a219c1"
//                 textStrokeWidth={4.4}
//               />
//             </motion.div>

//             <motion.div
//               className="relative w-full py-[2rem] 2xl:py-[5.5rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden"
//               variants={itemVariants}
//             >
//               {/* Animated border */}
//               <div className="absolute inset-0">
//                 <motion.div
//                   className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
//                   style={{
//                     background: `conic-gradient(from 0deg at 50% 50%,
//                       #d91fff 0deg,
//                       #d91fff 120deg,
//                       #00ffff 100deg,
//                       #00ffff 240deg,
//                       #FFD700 220deg,
//                       #FFD700 360deg,
//                       #d91fff 340deg
//                     )`,
//                   }}
//                   animate={{
//                     rotate: [0, 360],
//                   }}
//                   transition={{
//                     duration: 4,
//                     ease: "linear",
//                     repeat: Infinity,
//                   }}
//                 />
//               </div>

//               {/* Content container - increased border width from 5px to 8px for bolder appearance */}
//               <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem] " />
//               <div className="relative flex flex-col items-center w-full">
//                 <motion.div
//                   className="flex flex-col justify-between  w-full items-start gap-4 p-6 rounded-lg shadow-md"
//                   variants={itemVariants}
//                 >
//                   <motion.h2
//                     className="text-[3.75rem] font-extrabold outline-text text-black"
//                     variants={itemVariants}
//                     animate={{
//                       scale: [1, 1.05, 1],
//                       textShadow: ["0px 0px 0px rgba(217, 31, 255, 0)", "0px 0px 10px rgba(217, 31, 255, 0.7)", "0px 0px 0px rgba(217, 31, 255, 0)"]
//                     }}
//                     transition={{
//                       duration: 2,
//                       repeat: Infinity,
//                       repeatType: "reverse"
//                     }}
//                   >
//                     Get Ready for Stage 3
//                   </motion.h2>

//                   <motion.p
//                     className="text-4xl font-outfit text-white"
//                     variants={itemVariants}
//                   >
//                                     Contestants will select  <span className="font-semibold text-[#d91fff] px-1">Dud or Opportunity cards.</span>   The system will automatically handle the selections.
 
                 
                 
//                     </motion.p>

                                  
//                   <motion.p 
//                    className="text-4xl font-outfit text-white"
//                     variants={itemVariants}
//                   >
//                     At the end of this round, the <span className="font-semibold text-[#d91fff] pr-2 pl-1">1 contestants with the lowest scores</span> 
//                     will be <strong>eliminated</strong> from the competition. So bring your A-game — every second and every point counts!
//                   </motion.p>
             

//                 </motion.div>
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         {/* Right Sidebar */}
//         <motion.div variants={itemVariants}>
//           <HustleSideBar showEmptyCard={false} showHustlerCard={true} />
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default Stage3BoardGetReadyPage;

"use client";
import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import { GlowyStrokeText } from "@/components/core";

const Stage3BoardGetReadyPage = () => {
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
          {/* Top section */}
          <div className="flex flex-col w-full items-center">
            <motion.div
              className="w-full h-[100px] flex items-center justify-center"
              variants={itemVariants}
            >
              <HeaderTitleContainer
                backgroundColor="#791192"
                color="#ed99ff"
                text="Hustle Board"
                textGradientEnd="#8E17AA"
                textGradientStart="#8E17AA"
                borderGradientStart="#f78fc"
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
                  className="flex flex-col justify-between w-full items-start gap-4 px-6 rounded-lg shadow-md"
                  variants={itemVariants}
                >
                  <motion.div
                    variants={itemVariants}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <GlowyStrokeText
                      className="text-[3.75rem] font-extrabold font-lucky"
                      glowColor="D91FFF"
                      glowIntensity="low"
                      fillColor="black"
                      strokeColor="#d91fff"
                      strokeWidth={3}
                    >
                      Stage 3: Dud & Pass
                    </GlowyStrokeText>
                  </motion.div>

                  <motion.h3
                    className="text-4xl font-bold text-white font-outfit"
                    variants={itemVariants}
                  >
                    Rules
                  </motion.h3>

               <motion.ul
        className="list-disc text-3xl text-white font-outfit pl-6 leading-[2.5rem] space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.li variants={listItemVariants}>
          Each of the 2 remaining contestants is presented with 24 face-down cards:
        </motion.li>
        <motion.li className="text-[#d91fff]" variants={listItemVariants}>
          1 PASS Card
        </motion.li>
        <motion.li className="text-[#d91fff]" variants={listItemVariants}>
          23 DUD Cards
        </motion.li>
        <motion.li variants={listItemVariants}>
          Contestants take turns flipping cards, one at a time.
        </motion.li>
        <motion.li variants={listItemVariants}>
          The first to find the PASS card receives a Bonus Cash Boost and advances to the Final Stage.
        </motion.li>
      </motion.ul>

                  <motion.h3
                    className="text-4xl font-bold text-white mt-8 font-outfit"
                    variants={itemVariants}
                  >
                    Consolation Prize
                  </motion.h3>

                  <motion.p
                    className="text-3xl font-outfit text-white"
                    variants={itemVariants}
                  >
                    The eliminated contestant receives:
                  </motion.p>
                  <motion.p
                    className="text-3xl font-outfit  font-semibold text-[#d91fff]"
                    variants={itemVariants}
                  >
                    Liberty Life Health Plan worth ₦369,000
                  </motion.p>

                  <motion.div className="mt-4" variants={itemVariants}>
                    <h3 className="text-4xl font-bold text-white mb-2">
                      Key Tips:
                    </h3>
                    <motion.ul
                      className="list-disc pl-6 leading-[3.5rem] text-3xl text-white font-outfit"
                      variants={itemVariants}
                    >
                      {[
                        "It’s a game of luck—stay calm, stay hopeful.",
                        "Even if you don’t move on, you still win something meaningful.",
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
          <HustleSideBar showEmptyCard={false} showHustlerCard={true} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Stage3BoardGetReadyPage;
