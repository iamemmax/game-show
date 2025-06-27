"use client";
// 'use client';

// import React, { useEffect } from 'react';
// import { Dialog, DialogBody, DialogContent } from '@/components/core';
// import { tokenStorage } from '@/utils/auth';
// // import { Cross2Icon } from '@radix-ui/react-icons';
// // GameResultModal.tsx or .tsx777

import { useEffect, useState } from "react";
import { tokenStorage } from "@/utils/auth";
import { formatAmount } from "@/utils/currency";
import WinnerIconSvgIcon from "@/icons/cards/WinnerIconSvg";
import CorrectCheckIcon from "@/icons/cards/CorrectCheckIcon";
import NotCorrectIcon from "@/icons/cards/NotCorrectIcon";
export interface mqttDatum {
  contestant_id: number;
  answered_in: number;
  is_correct: boolean;
  is_winner: boolean;
  wallet_balance: number;
  book_balance: number;
  stage_balance: number;
  contestant_name: string | null;
  contestant_attr: string;
  profit_loss: ProfitLoss;
   startup_balance: number;
}

type ProfitLoss = {
  contestant_id: number;
  amount_gained: number;
  amount_lost: number;
};
interface Questions {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  question_id: number;
  question_booster: string;
}

interface GameResultModalProps {
  isOpen: boolean;
  //   onOpenChange: (open: boolean) => void
  data: mqttDatum[];
  questions: Questions;
}




export default function GameResultModal({
  isOpen,
  //   onOpenChange,
  data,
  questions,
}: GameResultModalProps) {
  const user = tokenStorage.getUser();
  const currentContestantData = data?.filter(
    (item) => item?.contestant_id === user?.contestant_id
  );
  const winnerData = data?.find((item) => item?.is_winner === true);
  const [delayModal, setDelayModal] = useState(false);
  // Auto-close modal after 7 seconds
  useEffect(() => {
    if (!isOpen) return;

    const closeTimer = setTimeout(() => {
      setDelayModal(true);
    }, 7000);

    return () => {
      clearTimeout(closeTimer);
    };
  }, []);

  //   if (!isOpen) return null

  // const question = payload.data.question.questions;
  const correctOptionKey = questions?.correct_option?.toLowerCase(); // 'b'
  const correctOptionValue =
    questions[`option_${correctOptionKey}` as keyof typeof questions];
  const correctOption = questions.correct_option; // "B"


  

  return (
    <>
      {!delayModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-[#16002A] text-white rounded-lg max-w-md w-full">
          {currentContestantData?.map((item, idx: number) => {
            return (
              <div className="" key={idx}>
                {(item?.is_winner || item?.profit_loss?.amount_gained >0) && (
                  <div className="bg-[#032312] border-[0.3px] border-[#04DA6A] gap-3 rounded-10 flex text-white p-3 ">
                    <div className="bg-[#0C2B1B] rounded-10 p-4 flex justify-center items-center">
                     <WinnerIconSvgIcon/>
                    </div>
                    <div className="">
                      <div className="mt-2 text-sm text-white font-gilroyMedium">
                        Fastest answer!
                      </div>
                      <div className="text-xl font-bold mt-1">
                        {item?.contestant_name?.split(" ")[0]} (
                        {item?.answered_in})
                      </div>
                      <div className="mt-2 rounded-[1.25rem] px-4 bg-[#0A3A20] py-2 font-medium text-sm">
                        Earned:{" "}
                        <span className="text-[#04DA6A] font-bold">
                          {" "}
                          ₦{formatAmount(item?.profit_loss?.amount_gained)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {!item?.is_winner && item?.is_correct && (
                  <div className="bg-[#54493f] border-[0.3px] border-[#CF9008] gap-3 rounded-10 flex text-white p-3 ">
                    <div className="bg-[#CF9008] rounded-10 p-4 flex justify-center items-center">
                     <CorrectCheckIcon/>
                    </div>
                    <div className="w-full">
                      <div className="mt-2 text-sm text-white/70 font-gilroyMedium">
                        Right answer!
                      </div>
                      <div className="text-xl font-bold mt-1">
                        {winnerData?.contestant_name?.split(" ")[0]} was quicker
                        ({winnerData?.answered_in})
                      </div>
                      <div className="flex  items-center gap-3">
                        <div className="mt-2 rounded-[1.25rem] px-4 bg-[#6F4C00] py-2 font-medium text-sm">
                          <p className="text-white font-gilroyWWWWWWBold text-sm">
                            Your time was:
                            <span className=" text-[#FFC125] font-bold">
                              {" "}
                              {item?.answered_in}s
                            </span>
                          </p>
                          {/* Earned: <span className="text-[#04DA6A] font-bold"> ₦{item?.stage_balance?.toLocaleString()}</span> */}
                        </div>
                        <p className="text-sm mt-2 font-gilroyBold font-medium text-[#FFC125]">
                          No earnings
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!item?.is_correct && (
                  <div className="bg-[#20070d] border-[0.3px] border-[#760F1B] gap-3 rounded-10 flex text-white p-3 ">
                    <div className="bg-[#760F1B] rounded-10 p-4 flex justify-center items-center">
                     <NotCorrectIcon/>
                    </div>
                    <div className="w-full">
                      <div className="mt-2 text-sm text-white/70 font-gilroyMedium">
                        Wrong answer!
                      </div>
                      <div className="text-xl font-bold mt-1">
                        {/* {item?.contestant_name?.split(" ")[0]} ({item?.answered_in}) */}
                        {/* {winnerData?.contestant_name} was quicker ({winnerData?.answered_in}) */}
                        <p className="text-white font-gilroyMedium text-sm">
                          Correct answer was{" "}
                          <span className="text-base font-verdana font-bold">
                            {correctOption}. {correctOptionValue}
                          </span>
                        </p>
                        {winnerData?.contestant_name && (
                          <p className="text-white/50 font-gilroyMedium text-sm ">
                            {winnerData?.contestant_name?.split(" ")[0]} buzzed in the correct
                            answer first{" "}
                            <span className="text-sm">
                              {winnerData?.answered_in}s
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="mt-2 rounded-[1.25rem] px-4 py-2 font-medium text-sm bg-[#3f1216] inline-block">
                        <p className="text-white text-sm">
                          Lost amount:{" "}
                         <span className="text-[#E9001B] font-bold text-sm">
  ₦{formatAmount(Number(item?.profit_loss?.amount_lost) || 0)}
</span>

                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-[#16002A] text-white p-6 space-y-6">
                  <div className="flex justify-between gap-4 text-center">
                    <div className="flex-1 bg-purple-700/20 p-4 rounded-lg">
                      <div className="text-lg font-bold text-purple-400">
                        ₦{formatAmount(item?.startup_balance)}
                      </div>
                      <div className="text-sm text-purple-300">
                        Start up amount
                      </div>
                    </div>
                    <div className="flex-1 bg-purple-700/20 p-4 rounded-lg">
                      <div className="text-lg font-bold text-purple-400">
                        ₦{formatAmount(item?.stage_balance)}
                      </div>
                      <div className="text-sm text-purple-300"> Current balance</div>
                    </div>
                  </div>

                 

                  <p className="text-center text-sm text-purple-300">
                    You are going home with your current balance you have by the
                    end of the stage or game
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
       )} 
    </>
  );
}
