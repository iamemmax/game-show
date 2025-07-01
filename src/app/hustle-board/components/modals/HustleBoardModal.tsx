// import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
// import StagesCard from "@/app/shared/StagesCard";
// import { capitalizeFirstLetter } from "@/utils";
// import Image from "next/image";
// import React from "react";

// const HustleBoardModal = () => {
//   const resultBoard = [
//     {
//       name: "emmax",
//       option: "B",
//       correct_answer: "Onisah",
//       bid_amount: "20000",
//     },
//     {
//       name: "Azu",
//       option: "C",
//       correct_answer: "Onisah",
//       bid_amount: "20000",
//     },
//     {
//       name: "Edmud",
//       option: "B",
//       correct_answer: "Onisah",
//       bid_amount: "20000",
//     },
//     {
//       name: "Daniel",
//       option: "B",
//       correct_answer: "Onisah",
//       bid_amount: "20000",
//     },
//     {
//       name: "Temiloluwa",
//       option: "B",
//       correct_answer: "Onisah",
//       bid_amount: "20000",
//     },
//     {
//       name: "Stephen",
//       option: "B",
//       correct_answer: "Onisah",
//       bid_amount: "20000",
//     },
//   ];
//   return (
//     <div className="fixed inset-0 z-50 w-full  flex items-center justify-center bg-black/80">
//       <div className="bg-[#15052B] rounded-[30px] text-white w-[658px] border border-[#7E3CE0]  p-[1.875rem] ">
//         <div className="bg-[#1F0541] rounded-10 p-4 flex justify-center items-center flex-col">
//           <div className="bg-[#29005E] rounded-[20px] px-[22px] py-2">
//             <p className="text-[#9E5CFF] text-sm font-sans font-semibold">
//               Question 4
//             </p>
//           </div>
//           <div className="mt-[.625rem]">
//             <p className="text-white text-lg  font-gilroyBold font-semibold">
//               What is the Biggest market in West Africa?
//             </p>
//           </div>
//         </div>

//         {resultBoard?.map((data, idx: number) => (
//           <div className="grid grid-cols-[1.5fr_1fr] mt-3">
//             <div className="bg-[#29104A] flex items-start gap-3 border-[0.3px] border-[#7E3CE0] w-full p-3 rounded-10">
//               <div className="relative w-[5.125rem] h-full  rounded-[10px] overflow-hidden">
//                 <Image
//                   alt="contestant"
//                   src={contestantImages[idx]}
//                   fill
//                   className="object-cover rounded-10"
//                 />
//               </div>

//               <div className="">
//                 <p className="text-xs capitalize font-gilroyMedium text-white">
//                   {capitalizeFirstLetter(data?.name)}
//                 </p>
//                 <p className="font-sans opacity-75 text-xs text-white">
//                   Answer:{" "}
//                   <span className="font-bold opacity-100 text-sm">
//                     {" "}
//                     {data?.option}. {data?.correct_answer}
//                   </span>{" "}
//                 </p>
//                 <div className="bg-[#200541] mt-1 leading-3  flex justify-center items-center flex-col rounded-[1.5rem] py-2 px-3">
//                   <p className="font-gilroyMedium text-xs text-white">
//                     Bid amount:
//                   </p>
//                   <h2 className="text-[#B380FF] font-gilroyHeavy font-extrabold text-xl">
//                     ₦{data?.bid_amount}
//                   </h2>
//                 </div>
//               </div>
//             </div>
//             <div className="">
//               <StagesCard
//                 key={`slot-${idx}`}
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
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default HustleBoardModal;

"use client";

import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import StagesCard from "@/app/shared/StagesCard";
import { capitalizeFirstLetter } from "@/utils";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";



interface Data {
  contestant_id: number;
  contestant_name: string;
  answer: string;
  amount_staked: number;
}
interface Prop{
    currentQuestionAnswerData: Data[]
    currentQuestion:any
}

const HustleBoardModal = ({currentQuestionAnswerData,currentQuestion}:Prop) => {
console.log(currentQuestionAnswerData, currentQuestion);


  const [visibleItems, setVisibleItems] = useState<number>(0);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    soundRef.current = new Audio("/sounds/show-result.mp3");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev < currentQuestionAnswerData?.length) {
          soundRef.current?.play().catch((err) => console.warn("Sound blocked:", err));
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/80">
      <div className="bg-[#15052B] rounded-[30px] text-white w-[658px] border border-[#7E3CE0] p-[1.875rem]">
        {/* Question Header */}
        <div className="bg-[#1F0541] rounded-10 p-4 flex justify-center items-center flex-col">
          <div className="bg-[#29005E] rounded-[20px] px-[22px] py-2">
            <p className="text-[#9E5CFF] text-sm font-sans font-semibold">Question 4</p>
          </div>
          <div className="mt-[.625rem]">
            <p className="text-white text-lg font-gilroyBold font-semibold">
              What is the Biggest market in West Africa?
            </p>
          </div>
        </div>

        {/* Animated Result Board */}
        {currentQuestionAnswerData?.slice(0, visibleItems).map((data, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-[1.5fr_1fr] mt-3"
          >
            <div className="bg-[#29104A] flex items-start gap-3 border-[0.3px] border-[#7E3CE0] w-full p-3 rounded-10">
              <div className="relative w-[5.125rem] h-[5.125rem] rounded-[10px] overflow-hidden">
                <Image
                  alt="contestant"
                  src={contestantImages[idx]}
                  fill
                  className="object-cover rounded-10"
                />
              </div>

              <div>
                <p className="text-xs capitalize font-gilroyMedium text-white">
                  {capitalizeFirstLetter(data?.contestant_name)}
                </p>
                <p className="font-sans opacity-75 text-xs text-white">
                  Answer:
                  <span className="font-bold opacity-100 text-sm">
                    {" "}
                    {data?.answer}
                  </span>
                </p>
                <div className="bg-[#200541] mt-1 leading-3 flex justify-center items-center flex-col rounded-[1.5rem] py-2 px-3">
                  <p className="font-gilroyMedium text-xs text-white">Bid amount:</p>
                  <h2 className="text-[#B380FF] font-gilroyHeavy font-extrabold text-xl">
                    ₦{Number(data?.amount_staked).toLocaleString()}
                  </h2>
                </div>
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
        ))}
      </div>
    </div>
  );
};

export default HustleBoardModal;
