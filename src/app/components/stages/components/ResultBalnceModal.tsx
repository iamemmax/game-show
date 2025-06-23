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
interface Datum {
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
  data: Datum[];
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
                {item?.is_winner && (
                  <div className="bg-[#032312] border-[0.3px] border-[#04DA6A] gap-3 rounded-10 flex text-white p-3 ">
                    <div className="bg-[#0C2B1B] rounded-10 p-4 flex justify-center items-center">
                      <svg
                        width="46"
                        height="46"
                        viewBox="0 0 46 46"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.9182 5.53378C22.1159 5.8076 22.2193 6.13826 22.2128 6.47595C22.2064 6.81365 22.0903 7.14009 21.8822 7.40613C20.6855 8.93706 18.1483 12.0025 15.6255 13.8641C12.5133 16.1641 9.67786 17.1955 8.23318 17.616C7.59349 17.8028 6.91068 17.5549 6.52614 17.0122C5.57739 15.6789 4.06802 12.8219 4.66099 8.77894C5.49833 3.02894 12.0857 0.254564 16.3551 1.63456C20.6244 3.01456 21.9182 5.53378 21.9182 5.53378Z"
                          fill="#FFC107"
                        />
                        <path
                          d="M8.80468 16.5425C8.38421 16.7186 8.00328 16.2262 8.27281 15.8632C9.06343 14.8067 10.598 13.0745 13.3975 10.8176C16.4342 8.37028 18.5869 7.50419 19.762 7.19872C20.1681 7.0945 20.4808 7.55091 20.2364 7.89231C19.4422 9.00637 17.7711 11.0404 15.0362 12.9918C12.3841 14.8857 10.1344 15.9818 8.80468 16.5425Z"
                          fill="url(#paint0_radial_1915_1192)"
                        />
                        <path
                          d="M11.7625 3.14073C11.9278 3.85229 12.8262 4.10026 13.6959 3.95292C14.6375 3.79479 15.8234 3.66182 15.712 2.70589C15.597 1.71761 14.0229 1.75714 13.4407 1.78948C12.589 1.83979 11.6151 2.51182 11.7625 3.14073Z"
                          fill="#FFEE58"
                        />
                        <path
                          d="M30.2772 1.3377C34.5754 0.180512 40.886 1.66114 42.151 9.10739C42.6325 11.9357 41.5077 14.4405 40.7207 15.7774C40.3325 16.4386 39.5743 16.7908 38.8232 16.6399C37.3569 16.3452 34.6257 15.5222 30.9672 13.2366C28.9332 11.968 26.166 9.49551 24.5991 8.04004C23.8911 7.38239 23.8229 6.27911 24.4589 5.54957C25.7024 4.12286 27.891 1.98098 30.2772 1.3377Z"
                          fill="#FFC107"
                        />
                        <path
                          d="M26.3854 8.08578C26.159 7.85937 26.3746 7.47843 26.6872 7.55749C28.0601 7.90249 30.5937 8.67515 32.8433 10.0803C35.1505 11.525 37.4829 13.7208 38.6652 14.8959C38.8988 15.1259 38.6688 15.5141 38.3526 15.4206C36.9079 15.0002 34.2521 14.0658 31.6251 12.2941C28.9549 10.4936 27.2551 8.95187 26.3854 8.08578Z"
                          fill="url(#paint1_radial_1915_1192)"
                        />
                        <path
                          d="M30.0401 4.25408C28.6205 4.69971 28.2216 3.69705 28.9799 2.93518C29.5262 2.38533 31.8298 1.40424 33.8279 1.82111C35.1468 2.09783 35.5601 3.99893 33.7021 3.97377C32.4371 3.9558 31.7794 3.70783 30.0401 4.25408Z"
                          fill="#FFEE58"
                        />
                        <path
                          d="M39.5384 43.1421C35.0641 40.3282 32.067 34.8477 31.5207 28.4796C31.0284 22.726 32.4227 16.9005 33.544 12.2215L35.844 13.2673C34.7731 17.7451 33.9321 22.9416 34.3849 28.2316C34.8521 33.7049 37.3534 38.3696 41.0693 40.7055L39.5384 43.1421ZM21.7709 42.1502L20.5849 39.5304C21.9901 38.8943 22.8023 37.0507 22.3207 35.588C22.0871 34.8729 21.584 34.1901 21.0557 33.4677C20.6245 32.8784 20.1752 32.2674 19.8087 31.5666C18.8527 29.7338 18.6263 27.5416 19.1941 25.5543C19.4816 24.5516 19.9381 23.664 20.3837 22.8051C20.8868 21.8348 21.3576 20.922 21.4798 20.002C21.5912 19.1502 21.3899 18.2482 20.9227 17.5259C20.4987 16.8754 19.8446 16.3148 19.151 15.7254C18.6263 15.2762 18.0801 14.8126 17.5806 14.2663C16.3982 12.9726 15.9382 11.4309 15.9454 9.70945L17.9471 8.95117C17.9471 8.95117 18.3101 10.9062 18.7988 11.686C19.3127 12.5018 20.0782 13.0552 20.8041 13.6734C21.6235 14.3741 22.6837 14.9599 23.3341 15.9662C24.1679 17.2527 24.5309 18.8627 24.3296 20.3865C24.1427 21.8024 23.5282 22.9884 22.9352 24.1348C22.5399 24.9002 22.1662 25.6226 21.9577 26.3521C21.5912 27.6387 21.7349 29.0582 22.3566 30.2441C22.6226 30.7545 22.9856 31.2504 23.3737 31.7787C24.0134 32.652 24.6746 33.5504 25.052 34.7004C25.9971 37.5574 24.5237 40.9068 21.7709 42.1502Z"
                          fill="#03A9F4"
                        />
                        <path
                          d="M3.77699 44.314L2.07715 41.996C12.977 34.0107 14.1378 22.3166 13.3687 16.3582L15.5393 15.6934C16.3911 22.2807 15.8664 35.459 3.77699 44.314Z"
                          fill="#F48FB1"
                        />
                        <path
                          d="M34.1119 26.3631L34.3024 26.5105C34.2808 25.3281 34.3383 24.1386 34.4497 22.9598C33.4866 22.1584 32.5882 21.2995 31.9413 20.2933C31.9233 20.2645 31.909 20.2358 31.891 20.207C31.6969 21.5008 31.546 22.8233 31.4741 24.1566C32.333 24.9795 33.253 25.6983 34.1119 26.3631Z"
                          fill="#0076C6"
                        />
                        <path
                          d="M41.3031 34.2656L38.694 33.0545C39.3588 31.6241 38.8018 29.8955 38.0615 28.7563C37.0984 27.2757 35.5818 26.097 34.112 24.9577C32.5343 23.7359 30.7482 22.3523 29.5192 20.4368C27.2587 16.9185 27.6576 12.5377 30.2056 9.2207L32.2935 10.3887C30.4607 12.7785 30.3134 16.3471 31.9377 18.8807C32.8973 20.3793 34.4102 21.5473 35.8729 22.6829C37.4542 23.9084 39.2438 25.2955 40.4729 27.1859C41.9535 29.4679 42.2734 32.1812 41.3031 34.2656ZM3.23087 33.2737C2.69181 30.2262 4.91993 28.6485 6.11665 27.8004C6.2604 27.6998 6.4365 27.574 6.55868 27.477C6.5479 27.2218 6.3754 26.902 6.05196 26.3593C5.52009 25.4645 4.79415 24.2354 5.35118 22.6721C5.83634 21.3137 7.24509 20.8645 8.17946 20.3398C8.97728 19.8905 9.55587 19.3443 9.84337 18.4315C10.1776 17.3677 9.944 14.694 9.944 14.694L11.6977 13.6698C11.6977 13.6698 12.2512 16.2249 12.2512 17.5259C12.2512 21.213 10.2063 22.1546 9.34384 22.6398C8.74728 22.974 8.18306 23.2902 8.06087 23.6352C7.97103 23.8868 8.09681 24.1707 8.52806 24.8966C9.04556 25.7663 9.74993 26.963 9.28993 28.4904C9.06712 29.2343 8.44181 29.6799 7.78056 30.1471C6.609 30.9773 5.85431 31.6098 6.06275 32.7741L3.23087 33.2737ZM26.9712 29.5613C25.6918 29.2559 24.8185 28.494 24.0351 27.8471L25.8679 25.6298C25.8679 25.6298 26.5184 26.5965 27.9451 27.0421L26.9712 29.5613ZM24.664 13.3823L22.5401 12.1352L24.0782 9.70227L26.2057 10.9493L24.664 13.3823ZM30.1768 40.8098L27.3126 39.0309L29.5227 36.5727L31.7329 38.6715L30.1768 40.8098Z"
                          fill="#F44336"
                        />
                        <path
                          d="M39.2463 21.6217L40.9318 19.293L43.4331 21.1028L41.7472 23.4315L39.2463 21.6217Z"
                          fill="#FB8C00"
                        />
                        <path
                          d="M19.0074 20.5059L16.4702 18.7521L17.7891 17.002L20.3227 18.7557L19.0074 20.5059Z"
                          fill="#F44336"
                        />
                        <path
                          d="M22.0764 23.5715C22.0764 23.5715 22.5652 23.5536 23.1725 23.6722C23.6109 22.8097 24.0278 21.9112 24.2434 20.9014C23.4959 20.7325 22.8958 20.8151 22.8958 20.8151L22.0764 23.5715Z"
                          fill="#0076C6"
                        />
                        <path
                          d="M25.487 23.9094C24.4843 23.0541 22.8096 23.1152 22.8096 23.1152L23.6254 20.3588C23.6254 20.3588 25.4798 20.1 26.7304 21.4045L25.487 23.9094ZM1.66797 35.3303L4.27595 35.1708L4.45097 38.0407L1.84334 38.1996L1.66797 35.3303ZM15.5143 34.8272L13.8576 32.4769C14.5907 31.9594 15.2628 31.3449 15.845 30.6585L18.0371 32.52C17.2956 33.3912 16.4481 34.1663 15.5143 34.8272Z"
                          fill="#FB8C00"
                        />
                        <path
                          d="M15.5357 41.4691C14.6732 40.7575 13.7604 40.0963 12.8188 39.4997L14.357 37.0703C15.3992 37.728 16.409 38.4611 17.3649 39.2481L15.5357 41.4691Z"
                          fill="#F44336"
                        />
                        <path
                          d="M31.571 28.782C31.6717 29.9716 31.8118 30.8269 32.0778 31.9409L33.9717 30.4208L32.1281 28.1172L31.571 28.782Z"
                          fill="#0076C6"
                        />
                        <path
                          d="M28.5237 30.6168L31.4202 28.2949L33.2182 30.5378L30.3216 32.8601L28.5237 30.6168Z"
                          fill="#FFC107"
                        />
                        <path
                          d="M27.5352 45.0161C27.0321 44.0925 26.4679 43.1905 25.8569 42.3352L28.1965 40.6641C28.8779 41.6178 29.4996 42.6127 30.058 43.6433L27.5352 45.0161Z"
                          fill="#FB8C00"
                        />
                        <defs>
                          <radialGradient
                            id="paint0_radial_1915_1192"
                            cx="0"
                            cy="0"
                            r="1"
                            gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(14.2535 11.8835) scale(5.42728 5.42728)"
                          >
                            <stop offset="0.376" stopColor="#AF5700" />
                            <stop offset="1" stopColor="#8F4700" />
                          </radialGradient>
                          <radialGradient
                            id="paint1_radial_1915_1192"
                            cx="0"
                            cy="0"
                            r="1"
                            gradientUnits="userSpaceOnUse"
                            gradientTransform="translate(32.5239 11.4891) scale(7.62737)"
                          >
                            <stop offset="0.376" stopColor="#AF5700" />
                            <stop offset="1" stopColor="#8F4700" />
                          </radialGradient>
                        </defs>
                      </svg>
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
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M24.9998 45.8327C36.5058 45.8327 45.8332 36.5053 45.8332 24.9993C45.8332 13.4934 36.5058 4.16602 24.9998 4.16602C13.4939 4.16602 4.1665 13.4934 4.1665 24.9993C4.1665 36.5053 13.4939 45.8327 24.9998 45.8327Z"
                          fill="white"
                        />
                        <path
                          d="M22.0415 32.4577C21.6248 32.4577 21.229 32.291 20.9373 31.9993L15.0415 26.1035C14.4373 25.4993 14.4373 24.4993 15.0415 23.8952C15.6457 23.291 16.6457 23.291 17.2498 23.8952L22.0415 28.6869L32.7498 17.9785C33.354 17.3743 34.354 17.3743 34.9582 17.9785C35.5623 18.5827 35.5623 19.5827 34.9582 20.1868L23.1457 31.9993C22.854 32.291 22.4582 32.4577 22.0415 32.4577Z"
                          fill="#CF9008"
                        />
                      </svg>
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
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          opacity="0.4"
                          d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
                          fill="#401116"
                        />
                        <path
                          d="M26.1202 24.0007L30.7202 19.4007C31.3002 18.8207 31.3002 17.8607 30.7202 17.2807C30.1402 16.7007 29.1802 16.7007 28.6002 17.2807L24.0002 21.8807L19.4002 17.2807C18.8202 16.7007 17.8602 16.7007 17.2802 17.2807C16.7002 17.8607 16.7002 18.8207 17.2802 19.4007L21.8802 24.0007L17.2802 28.6007C16.7002 29.1807 16.7002 30.1407 17.2802 30.7207C17.5802 31.0207 17.9602 31.1607 18.3402 31.1607C18.7202 31.1607 19.1002 31.0207 19.4002 30.7207L24.0002 26.1207L28.6002 30.7207C28.9002 31.0207 29.2802 31.1607 29.6602 31.1607C30.0402 31.1607 30.4202 31.0207 30.7202 30.7207C31.3002 30.1407 31.3002 29.1807 30.7202 28.6007L26.1202 24.0007Z"
                          fill="white"
                        />
                      </svg>
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
                            ₦{formatAmount(item?.profit_loss?.amount_lost)}
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

                  {/* <div className="text-center bg-purple-700/30 py-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-300">
                      ₦{item?.wallet_balance?.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-200">
                      Current balance
                    </div>
                  </div> */}

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
