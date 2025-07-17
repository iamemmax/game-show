

// "use client";

// import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
// import StagesCard from "@/app/shared/StagesCard";
// import { addCommasToNumber, capitalizeFirstLetter } from "@/utils";
// import Image from "next/image";
// import React, { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";

// interface Data {
//   contestant_id: number;
//   contestant_name: string;
//   answer: string;
//   amount_staked: number;
// }

// interface Prop {
//   currentQuestionAnswerData: Data[];
//   currentQuestion: any;
//   showBid: boolean;
// }

// function getOptionValue(
//   question: {
//     option_a: string;
//     option_b: string;
//     option_c: string;
//     option_d: string;
//   },
//   option: string | null | undefined
// ): string | null {
//   if (!option) return null;

//   const key = option.toLowerCase() as "a" | "b" | "c" | "d";

//   const map = {
//     a: question?.option_a,
//     b: question?.option_b,
//     c: question?.option_c,
//     d: question?.option_d,
//   };

//   return map[key] || null;
// }

// // Fisher-Yates shuffle algorithm
// function shuffleArray<T>(array: T[]): T[] {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }


// const HustleBoardModal = ({
//   currentQuestionAnswerData,
//   currentQuestion,
//   showBid,
// }: Prop) => {
//   const [visibleItems, setVisibleItems] = useState<number>(0);
//   const [shuffledData, setShuffledData] = useState<Data[]>([]);
//   const soundRef = useRef<HTMLAudioElement | null>(null);
//  const correctOption = currentQuestion?.question?.question?.correct_option;


 
//   useEffect(() => {
//     soundRef.current = new Audio("/sounds/show-result.mp3");
//   }, []);

//   // Shuffle the data when currentQuestionAnswerData changes
//   useEffect(() => {
//     if (currentQuestionAnswerData?.length > 0) {
//       const shuffled = shuffleArray(currentQuestionAnswerData);
//       setShuffledData(shuffled);
//       setVisibleItems(0); // Reset visible items when data changes
//     }
//   }, [currentQuestionAnswerData]);

//   useEffect(() => {
//     if (shuffledData.length === 0) return;

//     const interval = setInterval(() => {
//       setVisibleItems((prev) => {
//         if (prev < shuffledData.length) {
//           soundRef.current
//             ?.play()
//             .catch((err) => console.warn("Sound blocked:", err));
//           return prev + 1;
//         } else {
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 600);

//     return () => clearInterval(interval);
//   }, [shuffledData]);

//   return (
//     <div className=" ">
//       {shuffledData?.slice(0, visibleItems).map((data, idx) => (
//         <motion.div
//           key={`${data.contestant_id}-${idx}`}
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="grid grid-cols-[1.5fr_1fr] items-center mb-3"
//         >
//           <div className={`${correctOption?.toLowerCase() === getOptionValue(currentQuestion?.question.question,String(data?.answer?.toLowerCase()) )
//   ?"bg-[#003218] border-[#04DA6A] "
//  :"bg-[#29104A] border-[#7E3CE0]"

//            } flex items-start gap-3 border-[0.3px]  w-full p-3 rounded-10`}>
//             <div className="relative w-[7.125rem] h-[7.125rem] rounded-[10px] overflow-hidden">
//               <Image
//                 alt="contestant"
//                 src={contestantImages[idx]}
//                 fill
//                 className="object-cover rounded-10"
//               />
//             </div>

//             <div>
//               <p className="text-2xl capitalize font-gilroyMedium text-white">
//                 {capitalizeFirstLetter(data?.contestant_name ?? "")}
//               </p>
//               <p className="font-sans opacity-75 text-base  text-white">
//                 Answer:
//                 <span className="font-bold opacity-100 text-base ">
//                   {" "}
//                   {data?.answer === "N" ? " -.-- " : data?.answer} :{" "}
//                   {getOptionValue(
//                     currentQuestion?.question.question,
//                     String(data?.answer?.toLowerCase())
//                   )}{" "}
//                 </span>
//               </p>
//               {showBid && (
//                 <div className="bg-[#200541] mt-1 leading-3 flex justify-center items-center flex-col rounded-[1.5rem] py-1 px-6">
//                   <p className="font-gilroyMedium text-lg text-white">
//                     Bid amount:
//                   </p>
//                   <h2 className="text-[#B380FF] font-gilroyHeavy font-extrabold text-2xl">
//                     ₦
//                     {addCommasToNumber(
//                       Math.ceil(Number(data?.amount_staked) / 100) * 100
//                     )}
//                   </h2>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div>
//             <StagesCard
//               title=""
//               subTitle=""
//               borderColor="#FFC125"
//               iconText=""
//               showIcon={false}
//               width={230}
//               height={80}
//               className="2xl:w-[260px] opacity-50"
//             />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );
// };

// export default HustleBoardModal;




// "use client";

// import StagesCard from "@/app/shared/StagesCard";
// import { addCommasToNumber, capitalizeFirstLetter } from "@/utils";
// import Image from "next/image";
// import React, { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";

// interface Data {
//   contestant_id: number;
//   contestant_photo_url:string | null;
//   contestant_name: string;
//   answer: string;
//   amount_staked: number;
// }

// interface Prop {
//   currentQuestionAnswerData: Data[];
//   currentQuestion: any;
//   showBid: boolean;
// }

// function getOptionValue(
//   question: {
//     option_a: string;
//     option_b: string;
//     option_c: string;
//     option_d: string;
//   },
//   option: string | null | undefined
// ): string | null {
//   if (!option) return null;

//   const key = option.toLowerCase() as "a" | "b" | "c" | "d";

//   const map = {
//     a: question?.option_a,
//     b: question?.option_b,
//     c: question?.option_c,
//     d: question?.option_d,
//   };

//   return map[key] || null;
// }

// // Function to check if answer is correct
// function isAnswerCorrect(
//   correctOption: string,
//   userAnswer: string,
//   question: any
// ): boolean {
//   const correctAnswer = getOptionValue(question, correctOption?.toLowerCase());
//   const userAnswerValue = getOptionValue(question, userAnswer?.toLowerCase());
//   return correctAnswer === userAnswerValue && userAnswer !== "N";
// }

// // Fisher-Yates shuffle algorithm
// function shuffleArray<T>(array: T[]): T[] {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// // Sort contestants: correct answers first (shuffled), then incorrect/no answers
// function sortContestants(data: Data[], correctOption: string, question: any): Data[] {
//   const correct: Data[] = [];
//   const incorrect: Data[] = [];
  
//   // Separate correct and incorrect answers
//   data.forEach(contestant => {
//     if (isAnswerCorrect(correctOption, contestant.answer, question)) {
//       correct.push(contestant);
//     } else {
//       incorrect.push(contestant);
//     }
//   });
  
//   // Shuffle the correct answers and return combined array
//   return [...shuffleArray(correct), ...incorrect];
// }

// const HustleBoardModal = ({
//   currentQuestionAnswerData,
//   currentQuestion,
//   showBid,
// }: Prop) => {
//   const [visibleItems, setVisibleItems] = useState<number>(0);
//   const [sortedData, setSortedData] = useState<Data[]>([]);
//   const soundRef = useRef<HTMLAudioElement | null>(null);
//   const correctOption = currentQuestion?.question?.question?.correct_option || currentQuestion?.correct_option;
  
  

//   useEffect(() => {
//     soundRef.current = new Audio("/sounds/show-result.mp3");
//   }, []);

//   // Sort the data when currentQuestionAnswerData changes
//   useEffect(() => {
//     if (currentQuestionAnswerData?.length > 0) {
//       const sorted = sortContestants(
//         currentQuestionAnswerData,
//         correctOption,
//         currentQuestion?.question?.question
//       );
//       setSortedData(sorted);
//       setVisibleItems(0); // Reset visible items when data changes
//     }
//   }, [currentQuestionAnswerData, correctOption, currentQuestion]);

//   useEffect(() => {
//     if (sortedData.length === 0) return;

//     const interval = setInterval(() => {
//       setVisibleItems((prev) => {
//         if (prev < sortedData.length) {
//           soundRef.current
//             ?.play()
//             .catch((err) => console.warn("Sound blocked:", err));
//           return prev + 1;
//         } else {
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 600);

//     return () => clearInterval(interval);
//   }, [sortedData]);

//   return (
//     <div className=" ">
//       {sortedData?.slice(0, visibleItems).map((data, idx) => {
//         const isCorrect = isAnswerCorrect(
//           correctOption,
//           data.answer,
//           currentQuestion?.question?.question
//         );
        
        
//         console.log(isCorrect);
        

//         return (
//           <motion.div
//             key={`${data.contestant_id}-${idx}`}
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, ease: "easeOut" }}
//             className="grid grid-cols-[1.5fr_1fr] items-center mb-3"
//           >
//             <div className={`${
//               isCorrect
//                 ? "bg-[#003218] border-[#04DA6A]"
//                 : "bg-[#29104A] border-[#7E3CE0]"
//             } flex items-start gap-3 border-[0.3px] w-full p-3 rounded-10`}>
//               <div className="relative w-[7.125rem] h-[7.125rem] rounded-[10px] overflow-hidden">
//                 <Image
//                   alt="contestant"
//                   src={data?.contestant_photo_url ??""}
//                   fill
//                   className="object-cover rounded-10"
//                 />
//               </div>

//               <div>
//                 <p className="text-2xl capitalize font-gilroyMedium text-white">
//                   {capitalizeFirstLetter(data?.contestant_name ?? "")}
//                 </p>
//                 <p className="font-sans opacity-75 text-base text-white">
//                   Answer:
//                   <span className="font-bold opacity-100 text-base">
//                     {" "}
//                     {data?.answer === "N" ? " -.-- " : data?.answer} :{" "}
//                     {getOptionValue(
//                       currentQuestion?.question.question,
//                       String(data?.answer?.toLowerCase())
//                     )}{" "}
//                   </span>
//                 </p>
//                 {showBid && (
//                   <div className={`${isCorrect ? "bg-[#014823]" : "bg-[#200541]"} -1 leading-3 flex justify-center items-center flex-col rounded-[1.5rem] py-1 px-6`}>
//                     <p className="font-gilroyMedium text-lg text-white">
//                       Bid amount:
//                     </p>
//                     <h2 className={` ${isCorrect? "text-[#04DA6A]" : "text-[#B380FF]"} font-gilroyHeavy font-extrabold text-2xl`}>
//                       ₦
//                       {addCommasToNumber(
//                         Math.ceil(Number(data?.amount_staked) / 100) * 100
//                       )}
//                     </h2>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div>
//               <StagesCard
//                 title=""
//                 subTitle=""
//                 borderColor="#FFC125"
//                 iconText=""
//                 showIcon={false}
//                 width={230}
//                 height={80}
//                 className="2xl:w-[260px] opacity-50"
//               />
//             </div>
//           </motion.div>
//         );
//       })}
//     </div>
//   );
// };

// export default HustleBoardModal;












"use client";

import StagesCard from "@/app/shared/StagesCard";
import { addCommasToNumber, capitalizeFirstLetter } from "@/utils";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Data {
  contestant_id: number;
  contestant_photo_url: string | null;
  contestant_name: string;
  answer: string;
  amount_staked: number;
}

interface Prop {
  currentQuestionAnswerData: Data[];
  currentQuestion: any;
  showBid: boolean;
}

function getOptionValue(
  question: {
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
  },
  option: string | null | undefined
): string | null {
  if (!option) return null;

  const key = option.toLowerCase() as "a" | "b" | "c" | "d";

  const map = {
    a: question?.option_a,
    b: question?.option_b,
    c: question?.option_c,
    d: question?.option_d,
  };

  return map[key] || null;
}

// FIXED: Simple answer checking - compare option letters directly
function isAnswerCorrect(
  correctOption: string,
  userAnswer: string
): boolean {
  // Return false if user didn't answer
  if (!userAnswer || userAnswer === "N") return false;
  
  // Compare option letters (A, B, C, D) directly
  return correctOption?.toLowerCase() === userAnswer?.toLowerCase();
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// FIXED: Simplified sorting function
function sortContestants(data: Data[], correctOption: string): Data[] {
  const correct: Data[] = [];
  const incorrect: Data[] = [];
  
  // Separate correct and incorrect answers
  data.forEach(contestant => {
    if (isAnswerCorrect(correctOption, contestant.answer)) {
      correct.push(contestant);
    } else {
      incorrect.push(contestant);
    }
  });
  
  // Shuffle correct answers and return combined array
  return [...shuffleArray(correct), ...incorrect];
}

const HustleBoardModal = ({
  currentQuestionAnswerData,
  currentQuestion,
  showBid,
}: Prop) => {
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [sortedData, setSortedData] = useState<Data[]>([]);
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const correctOption = currentQuestion?.question?.question?.correct_option || currentQuestion?.correct_option;

  useEffect(() => {
    soundRef.current = new Audio("/sounds/show-result.mp3");
  }, []);

  // Sort the data when currentQuestionAnswerData changes
  useEffect(() => {
    if (currentQuestionAnswerData?.length > 0) {
      const sorted = sortContestants(currentQuestionAnswerData, correctOption);
      setSortedData(sorted);
      setVisibleItems(0); // Reset visible items when data changes
    }
  }, [currentQuestionAnswerData, correctOption]);

  useEffect(() => {
    if (sortedData.length === 0) return;

    const interval = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev < sortedData.length) {
          soundRef.current
            ?.play()
            .catch((err) => console.warn("Sound blocked:", err));
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [sortedData]);

  return (
    <div className="">
      {sortedData?.slice(0, visibleItems).map((data, idx) => {
        const isCorrect = isAnswerCorrect(correctOption, data.answer);

        return (
          <motion.div
            key={`${data.contestant_id}-${idx}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-[1.5fr_1fr] items-center mb-3"
          >
            <div className={`${
              isCorrect
                ? "bg-[#003218] border-[#04DA6A]"
                : "bg-[#29104A] border-[#7E3CE0]"
            } flex items-start gap-3 border-[0.3px] w-full p-3 rounded-10`}>
              <div className="relative w-[7.125rem] h-[7.125rem] rounded-[10px] overflow-hidden">
                <Image
                  alt="contestant"
                  src={data?.contestant_photo_url ?? ""}
                  fill
                  className="object-cover rounded-10"
                />
              </div>

              <div>
                <p className="text-2xl capitalize font-gilroyMedium text-white">
                  {capitalizeFirstLetter(data?.contestant_name ?? "")}
                </p>
                <p className="font-sans opacity-75 text-base text-white">
                  Answer:
                  <span className="font-bold opacity-100 text-base">
                    {" "}
                    {data?.answer === "N" ? " -.-- " : data?.answer} :{" "}
                    {getOptionValue(
                      currentQuestion?.question.question,
                      String(data?.answer?.toLowerCase())
                    )}{" "}
                  </span>
                </p>
                {showBid && (
                  <div className={`${isCorrect ? "bg-[#014823]" : "bg-[#200541]"} -1 leading-3 flex justify-center items-center flex-col rounded-[1.5rem] py-1 px-6`}>
                    <p className="font-gilroyMedium text-lg text-white">
                      Bid amount:
                    </p>
                    <h2 className={`${isCorrect ? "text-[#04DA6A]" : "text-[#B380FF]"} font-gilroyHeavy font-extrabold text-2xl`}>
                      ₦
                      {addCommasToNumber(
                        Math.ceil(Number(data?.amount_staked) / 100) * 100
                      )}
                    </h2>
                  </div>
                )}
              </div>
            </div>

            <div>
              <StagesCard
                title=""
                subTitle=""
                borderColor="#FFC125"
                iconText=""
                showIcon={false}
                width={230}
                height={80}
                className="2xl:w-[260px] opacity-50"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HustleBoardModal;