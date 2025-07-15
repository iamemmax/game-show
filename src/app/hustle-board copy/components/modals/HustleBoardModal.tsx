

"use client";

import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import StagesCard from "@/app/shared/StagesCard";
import { addCommasToNumber, capitalizeFirstLetter } from "@/utils";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Data {
  contestant_id: number;
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
  questions: {
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
    a: questions?.option_a,
    b: questions?.option_b,
    c: questions?.option_c,
    d: questions?.option_d,
  };

  return map[key] || null;
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

const HustleBoardModal = ({
  currentQuestionAnswerData,
  currentQuestion,
  showBid,
}: Prop) => {
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [shuffledData, setShuffledData] = useState<Data[]>([]);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    soundRef.current = new Audio("/sounds/show-result.mp3");
  }, []);

  // Shuffle the data when currentQuestionAnswerData changes
  useEffect(() => {
    if (currentQuestionAnswerData?.length > 0) {
      const shuffled = shuffleArray(currentQuestionAnswerData);
      setShuffledData(shuffled);
      setVisibleItems(0); // Reset visible items when data changes
    }
  }, [currentQuestionAnswerData]);

  useEffect(() => {
    if (shuffledData.length === 0) return;

    const interval = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev < shuffledData.length) {
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
  }, [shuffledData]);

  return (
    <div className=" ">
      {shuffledData?.slice(0, visibleItems).map((data, idx) => (
        <motion.div
          key={`${data.contestant_id}-${idx}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-[1.5fr_1fr] items-center mb-3"
        >
          <div className="bg-[#29104A] flex items-start gap-3 border-[0.3px] border-[#7E3CE0] w-full p-3 rounded-10">
            <div className="relative w-[7.125rem] h-[7.125rem] rounded-[10px] overflow-hidden">
              <Image
                alt="contestant"
                src={contestantImages[idx]}
                fill
                className="object-cover rounded-10"
              />
            </div>

            <div>
              <p className="text-2xl capitalize font-gilroyMedium text-white">
                {capitalizeFirstLetter(data?.contestant_name ?? "")}
              </p>
              <p className="font-sans opacity-75 text-base  text-white">
                Answer:
                <span className="font-bold opacity-100 text-base ">
                  {" "}
                  {data?.answer === "N" ? " -.-- " : data?.answer} :{" "}
                  {getOptionValue(
                    currentQuestion?.question.questions,
                    String(data?.answer?.toLowerCase())
                  )}{" "}
                </span>
              </p>
              {showBid && (
                <div className="bg-[#200541] mt-1 leading-3 flex justify-center items-center flex-col rounded-[1.5rem] py-1 px-6">
                  <p className="font-gilroyMedium text-lg text-white">
                    Bid amount:
                  </p>
                  <h2 className="text-[#B380FF] font-gilroyHeavy font-extrabold text-2xl">
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
      ))}
    </div>
  );
};

export default HustleBoardModal;