

"use client";

import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import StagesCard from "@/app/shared/StagesCard";
import { capitalizeFirstLetter } from "@/utils";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { formatAmount } from "@/utils/currency";

const HustleRevealResult = () => {
    const resultBoard =  [
          {
              "contestant_id": 68,
              "answered_in": 0.391,
              "is_correct": true,
              "is_winner": true,
              "answer": "B",
              "wallet_balance": 57280.68,
              "book_balance": 50438.64,
              "startup_balance": 90000.0,
              "stage_balance": 107719.32,
              "contestant_name": "Emmanuel Ayodeji",
              "contestant_attr": "contestant_1",
              "profit_loss": {
                  "contestant_id": 68,
                  "bid_amount": 6364.51,
                  "amount_gained": 12729.02,
                  "amount_lost": 0.0
              }
          },
          {
              "contestant_id": 69,
              "answered_in": 10.252,
              "is_correct": true,
              "is_winner": false,
              "answer": "N",
              "wallet_balance": 30000.0,
              "book_balance": 0.0,
              "startup_balance": 90000.0,
              "stage_balance": 30000.0,
              "contestant_name": "Olaniyi",
              "contestant_attr": "contestant_2",
              "profit_loss": {
                  "contestant_id": 69,
                  "bid_amount": 7500.0,
                  "amount_gained": 0.0,
                  "amount_lost": 7500.0
              }
          },
          {
              "contestant_id": 70,
              "answered_in": 10.252,
              "is_correct": false,
              "is_winner": false,
              "answer": "N",
              "wallet_balance": 26666.68,
              "book_balance": 0.0,
              "startup_balance": 80000.0,
              "stage_balance": 26666.68,
              "contestant_name": "Temi",
              "contestant_attr": "contestant_3",
              "profit_loss": {
                  "contestant_id": 70,
                  "bid_amount": 6666.67,
                  "amount_gained": 0.0,
                  "amount_lost": 6666.67
              }
          },
          {
              "contestant_id": 71,
              "answered_in": 10.252,
              "is_correct": false,
              "is_winner": false,
              "answer": "N",
              "wallet_balance": 16666.68,
              "book_balance": 0.0,
              "startup_balance": 50000.0,
              "stage_balance": 16666.68,
              "contestant_name": "Oni Khalid",
              "contestant_attr": "contestant_4",
              "profit_loss": {
                  "contestant_id": 71,
                  "bid_amount": 4166.67,
                  "amount_gained": 0.0,
                  "amount_lost": 4166.67
              }
          },
          {
              "contestant_id": 72,
              "answered_in": 10.252,
              "is_correct": false,
              "is_winner": false,
              "answer": "N",
              "wallet_balance": 33333.36,
              "book_balance": 0.0,
              "startup_balance": 100000.0,
              "stage_balance": 33333.36,
              "contestant_name": "Azu Odu",
              "contestant_attr": "contestant_5",
              "profit_loss": {
                  "contestant_id": 72,
                  "bid_amount": 8333.33,
                  "amount_gained": 0.0,
                  "amount_lost": 8333.33
              }
          },
          {
              "contestant_id": 73,
              "answered_in": 10.252,
              "is_correct": true,
              "is_winner": false,
              "answer": "N",
              "wallet_balance": 53750.0,
              "book_balance": 3750.0,
              "startup_balance": 90000.0,
              "stage_balance": 57500.0,
              "contestant_name": "Samson Monday",
              "contestant_attr": "contestant_6",
              "profit_loss": {
                  "contestant_id": 73,
                  "bid_amount": 13437.5,
                  "amount_gained": 0.0,
                  "amount_lost": 13437.5
              }
           }
        ]

  const [visibleItems, setVisibleItems] = useState<number>(0);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    soundRef.current = new Audio("/sounds/show-result.mp3");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev < resultBoard.length) {
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

  const getCardStyle = (data: any) => {
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

  return (
    <div className="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/80">
      <div className="bg-[#15052B] rounded-[30px] text-white w-[758px] border border-[#7E3CE0] p-[1.875rem]">
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
        {resultBoard.slice(0, visibleItems).map((data, idx) => {
          const styles = getCardStyle(data);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-[5fr_1fr] items-center  gap-3 mt-3"
            >
              <div className={`flex items-start gap-3 border-[0.3px] w-full p-3 rounded-10`} style={{ backgroundColor: styles.bg, borderColor: styles.border }}>
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
                    {capitalizeFirstLetter(data?.contestant_name?.split(" ")[0])}
                  </p>
                  <p className="font-sans opacity-75 text-xs text-white">
                    Answer:
                    <span className="font-bold opacity-100 text-sm">
                      {" "}{data?.answer}. Drogba
                    </span>
                  </p>

<div className="flex items-center gap-x-[10px]">
                  <div className="mt-1  flex justify-center items-center flex-col rounded-[1.5rem] py-2 px-6" style={{ backgroundColor: `${styles.text}22` }}>
                    <p className="font-gilroyMedium text-xs text-white">Bid amount:</p>
                    <h2 className="font-gilroyHeavy font-extrabold text-xl" style={{ color: styles.text }}>
                      ₦
                      
                       {(
                                                  Math.ceil(
                                                    Number(data?.profit_loss?.bid_amount) / 100
                                                  ) * 100
                                                ).toLocaleString()}
                    
                    </h2>
                  </div>
                  <div className="mt-1  flex justify-center leading-none items-center flex-col rounded-[1.5rem] py-2 px-6" style={{ backgroundColor: `${styles.text}22` }}>
                    {data?.is_winner &&<p className="font-gilroyMedium text-xs text-white">Won amount:</p>}
                    {data?.profit_loss?.amount_lost >0 &&<p className="font-gilroyMedium text-xs text-white">Lost amount:</p>}
                   {data?.is_correct&& <h2 className="font-gilroyHeavy  block font-extrabold text-xl" style={{ color: styles.text }}>
                      {/* ₦{Number(data?.profit_loss?.amount_gained).toLocaleString()} */}
                       ₦{formatAmount(Number(data?.profit_loss?.amount_gained) || 0)}
                    </h2>}
                   {!data?.is_correct&& <h2 className="font-gilroyHeavy block  font-extrabold text-xl" style={{ color: styles.text }}>
                      {/* ₦{Number(data?.profit_loss?.amount_gained).toLocaleString()} */}
                       ₦{formatAmount(Number(data?.profit_loss?.amount_lost) || 0)}
                    </h2>}
                  </div>

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
                  width={100}
                  height={80}
                  className="2xl:w-[260px] opacity-50"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HustleRevealResult;
