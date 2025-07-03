"use client";

import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import StagesCard from "@/app/shared/StagesCard";
import { capitalizeFirstLetter } from "@/utils";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatAmount } from "@/utils/currency";
import UserBadge from "@/app/shared/UserBadge";

interface Datum {
  contestant_id: number;
  answered_in: number;
  is_correct: boolean;
  is_winner: boolean;
  answer: string;
  wallet_balance: number;
  book_balance: number;
  startup_balance: number;
  stage_balance: number;
  contestant_name: string;
  contestant_attr: string;
  profit_loss: Profitloss;
}

interface Profitloss {
  contestant_id: number;
  bid_amount: number;
  amount_gained: number;
  amount_lost: number;
}

interface Props {
  currentQuestion: any;
  mqttAnswerData: Datum[];
   showBid: boolean
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

const HustleRevealResult = ({ currentQuestion, mqttAnswerData,showBid }: Props) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const [visibleItems, setVisibleItems] = useState<number>(0);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    soundRef.current = new Audio("/sounds/show-result.mp3");
  }, []);

  useEffect(() => {
    if (!mqttAnswerData || mqttAnswerData.length === 0) return;

    const interval = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev < mqttAnswerData.length) {
          soundRef.current?.play().catch((err) => console.warn("Sound blocked:", err));
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [mqttAnswerData]);

  const getCardStyle = (data: Datum) => {
    if (data?.is_winner || data?.profit_loss?.amount_gained > 0) {
      return {
        bg: "#003218",
        border: "#04DA6A",
        text: "#04DA6A",
      };
    } else if (data?.is_correct) {
      return {
        bg: "#795D44",
        border: "#CF9008",
        text: "#FFC125",
      };
    } else {
      return {
        bg: "#370005",
        border: "#760F1B",
        text: "#E9001B",
      };
    }
  };

  // Early return if no data
 

  return (
    <div className="">
         {mqttAnswerData.slice(0, visibleItems).map((data, idx) => {
          const styles = getCardStyle(data);

          return (
            <motion.div
              key={`${data.contestant_id}-${idx}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-[5fr_1fr] items-center gap-3 mb-3"
            >
              <div 
                className="flex items-start gap-3 border-[0.3px] w-full p-3 rounded-10" 
                style={{ backgroundColor: styles.bg, borderColor: styles.border }}
              >
                <div className="relative w-[5.125rem] h-[5.125rem] rounded-[10px] overflow-hidden">
                  <Image
                    alt={`contestant ${data.contestant_name}`}
                    src={contestantImages[idx % contestantImages.length]}
                    fill
                    className="object-cover rounded-10"
                  />
                </div>

                <div>
                  <p className="text-xs capitalize font-gilroyMedium text-white">
                    {capitalizeFirstLetter(data?.contestant_name?.split(" ")[0] || "Player")}
                  </p>
                  <p className="font-sans opacity-75 text-xs text-white">
                    Answer:
                    <span className="font-bold opacity-100 text-xs">
                      {" "}{data?.answer}. {getOptionValue(currentQuestion?.question?.questions, String(data?.answer?.toLowerCase()))}  
                    </span>
                  </p>

                  <div className="flex items-center gap-x-[10px]">
                   {showBid&& <div 
                      className="mt-1 flex justify-center items-center flex-col rounded-[1.5rem] py-2 px-3" 
                      style={{ backgroundColor: `${styles.text}22` }}
                    >
                      <p className="font-gilroyMedium text-xs text-white">Bid amount:</p>
                      <h2 className="font-gilroyHeavy font-extrabold text-base" style={{ color: styles.text }}>
                        ₦{(Math.ceil(Number(data?.profit_loss?.bid_amount || 0) / 100) * 100).toLocaleString()}
                      </h2>
                    </div>}
                    
                    <div 
                      className="mt-1 flex justify-center leading-none items-center flex-col rounded-[1.5rem] py-2 px-3" 
                      style={{ backgroundColor: `${styles.text}22` }}
                    >
                      {data?.is_winner && <p className="font-gilroyMedium text-xs text-white">Won amount:</p>}
                      {data?.profit_loss?.amount_lost > 0 && <p className="font-gilroyMedium text-[.625rem] text-white">Lost amount:</p>}
                      
                      {data?.is_correct && (
                        <h2 className="font-gilroyHeavy block font-extrabold text-base" style={{ color: styles.text }}>
                          ₦{formatAmount(Number(data?.profit_loss?.amount_gained) || 0)}
                        </h2>
                      )}
                      
                      {!data?.is_correct && (
                        <h2 className="font-gilroyHeavy block font-extrabold text-base" style={{ color: styles.text }}>
                          ₦{formatAmount(Number(data?.profit_loss?.amount_lost) || 0)}
                        </h2>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <AnimatePresence>
                  <motion.div
                    key={`badge-${data.contestant_id}-${idx}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full"
                  >
                    <UserBadge
                      username={data.contestant_name || `Player ${idx + 1}`}
                      amount={`${String(data.answered_in?.toFixed(2))}`}
                      avatarUrl={contestantImages[idx % contestantImages.length]}
                      isOnline={true}
                      isActive={data.is_winner && data?.is_correct}
                      borderColor="#FFC125"
                      backgroundGradient={{
                        middleColor: "#997416",
                        endColor: "#FEC124",
                        startColor: "#FFC125",
                        direction: "vertical",
                      }}
                      textGradient={{
                        startColor: "#FFFFFF",
                        endColor: "#FFC125",
                        direction: "horizontal",
                      }}
                      color="#FFFFFF"
                      correctAnswerColor={data.is_correct ? "#04DA6A" : "#EB001B"}
                      usernameClassName="mt-[6px] text-white text-xs"
                      dotPosition={{ y: 36 }}
                      width={230}
                      height={80}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
    </div>

  );
};

export default HustleRevealResult;