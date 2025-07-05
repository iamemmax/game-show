import JackpotContainer from "@/app/shared/JackpotContainer";
import StagesCard from "@/app/shared/StagesCard";
// import UserBadge from "@/app/shared/UserBadge";
import { GlowyStrokeText } from "@/components/core";
import React, { useEffect, useRef, useState } from "react";
import { contestantImages } from "../mocks/contestantImages";
// import { useGetWalletBalance } from "../../api/stage1/getbalance";
import { tokenStorage } from "@/utils/auth";
import { addCommasToNumber } from "@/utils";
// import { processEliminatedContestants } from "@/utils/contestants";
import Image from "next/image";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { useParams } from "next/navigation";
import { balanceProp, useGetWalletBalance } from "../../api/stage1/getbalance";
import { formatAmount } from "@/utils/currency";

interface prop {
  showJackpot?: boolean;
  showEmptyCard?: boolean;
  showHustlerCard?: boolean;
  eliminated?: number;
  removeCount?: number;
  showHustleCardAmt?: boolean;
  mqttAnswerData?: Datum[];
  balanceData?: balanceProp | null | undefined
  // mqttAnswerBalanceData?: any;
  
}
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

// Sound utility functions
const playCountingSound = () => {
  const audio = new Audio('/sounds/cash-counting.wav');
  audio.volume = 0.3;
  audio.play().catch(console.error);
};

// Animation hook for counting up/down numbers with sound
const useAnimatedBalance = (targetValue: number, duration: number = 1000) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevValueRef = useRef(targetValue);
  const animationRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('/sounds/cash-counting.wav');
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    const prevValue = prevValueRef.current;
    const difference = targetValue - prevValue;
    
    if (difference === 0) return;

    // Start playing sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = prevValue + (difference * easeOutQuart);
      
      setDisplayValue(Math.round(currentValue));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        prevValueRef.current = targetValue;
        
        // Stop sound
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [targetValue, duration]);

  return displayValue;
};

// Individual contestant card component with animation
const ContestantCard = ({ 
  contestant, 
  originalIndex, // Use original index from backend data
  contestantInfo, 
  isMyContestant, 
  isBoardRoute, 
  showHustleCardAmt, 
  balance,
  name 
}: {
  contestant: any;
  originalIndex: number; // Changed from idx to originalIndex for clarity
  contestantInfo: any;
  isMyContestant: boolean;
  isBoardRoute: boolean;
  showHustleCardAmt: boolean;
  balance: number;
  name: string;
}) => {
  const animatedBalance = useAnimatedBalance(balance, 800);
  const [isBalanceChanging, setIsBalanceChanging] = useState(false);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    if (prevBalanceRef.current !== balance) {
      setIsBalanceChanging(true);
      const timer = setTimeout(() => setIsBalanceChanging(false), 800);
      prevBalanceRef.current = balance;
      return () => clearTimeout(timer);
    }
  }, [balance]);

  const baseCardBg = isBoardRoute
    ? "bg-[#ae77ff]"
    : isMyContestant
      ? "bg-[#FFC125]"
      : "bg-[#ae77ff]";

  const baseGradient = isBoardRoute
    ? "from-[#d531f8] to-[#9a5eb2]"
    : isMyContestant
      ? "from-amber-500 to-yellow-500"
      : "from-[#d531f8] to-[#9a5eb2]";

  return (
    <div
      key={originalIndex}
      className={`${isBoardRoute ? "w-[12rem] h-[7rem] mt-3" : "w-[8.5456rem] h-[70.66px]"} ${baseCardBg} p-[5px] rounded-[12.79px] relative z-[999999999999] transition-all duration-300 ${
        contestantInfo?.is_eliminated ? "opacity-50 hidden" : ""
      } ${isBalanceChanging ? 'scale-105 shadow-lg' : ''}`}
    >
      <div
        className={`w-full h-full flex justify-center items-center rounded-[12.79px] bg-gradient-to-b ${baseGradient} transition-all duration-300`}
      >
        {/* Avatar - Use originalIndex to maintain consistent image mapping */}
        <div
          className={`absolute ${isBoardRoute ? "-top-6" : "-top-3"}  rounded-full overflow-hidden ${
            isBoardRoute
              ? "h-[4rem] w-[4rem]"
              : "h-[1.875rem] w-[1.875rem]"
          }`}
        >
          <Image
            src={contestantImages[originalIndex] ?? ""}
            alt="User Image"
            width={isBoardRoute ? 64 : 30}
            height={isBoardRoute ? 64 : 30}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Green Dot with pulse animation when balance changes */}
        <div
          className={`z-[999999] bg-green-500 -mt-2 absolute w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            isBalanceChanging ? 'animate-pulse scale-125' : ''
          }`}
          style={{
            top: isBoardRoute ? "35px" : "15px",
            right: isBoardRoute ? "60px" : "52px",
          }}
        />

        {/* Balance & Name */}
        <div
          className={`relative w-full ${isBoardRoute ? "mt-4" : ""}`}
        >
          <div className="flex flex-col justify-center gap-0 mt-3 items-center w-full">
            {showHustleCardAmt && (
              <div className={`transition-all duration-300 ${isBalanceChanging ? 'scale-110' : ''}`}>
                <GlowyStrokeText
                  strokeWidth={2}
                  strokeColor="#a132b7"
                  glowColor="#ce45eb"
                  glowIntensity={isBalanceChanging ? "high" : "low"}
                  textclassName={`${
                    isBoardRoute
                      ? "text-[1.3rem]"
                      : "text-[19.18px]"
                  } font-extrabold font-gilroyHeavy text-white transition-all duration-300 ${
                    isBalanceChanging ? 'text-shadow-lg' : ''
                  }`}
                  fillColor="#fff"
                >
                  ₦{formatAmount(animatedBalance)}
                </GlowyStrokeText>
              </div>
            )}
            <GlowyStrokeText
              truncate
              strokeWidth={2}
              strokeColor="#a132b7"
              glowColor="#ce45eb"
              glowIntensity="low"
              textclassName={`${
                isBoardRoute ? "text-[1.2rem]" : "text-[19.18px]"
              } font-extrabold font-gilroyHeavy text-white -mt-1   max-w-[110px] truncate`}
              fillColor="#fff"
            >
              {name}
            </GlowyStrokeText>
          </div>
        </div>
      </div>
    </div>
  );
};

// const HustleSideBar = ({


//   showJackpot = true,
//   showEmptyCard = false,
//   showHustlerCard = false,
//   showHustleCardAmt = true,
//   mqttAnswerData,
//   balanceData
//   // mqttAnswerBalanceData
// }: prop) => {
//   const user = tokenStorage.getUser();
//   const params = useParams();

//   const { data: allContestsant, isLoading } = useGetGameContestants(
//     !params?.episodeId
//       ? (user?.game_episode as number)
//       : Number(params?.episodeId)
//   );

//   // Preserve backend order - no sorting applied
//   // Only use allContestsant when mqttAnswerData is empty array, undefined, or null
//   const dataToRender =
//     !mqttAnswerData || mqttAnswerData.length === 0
//       ? allContestsant?.data || []
//       : mqttAnswerData;

//   // Add a comment to document that we're preserving backend order
//   // console.log('Rendering contestants in backend order:', dataToRender);

//   const getContestantInfo = (id: number) => {
//     const allconstestant = allContestsant?.data?.find(
//       (contestant) => contestant.id === id
//     );

//     return allconstestant;
//   };
  
//   const getContestantBalanceInfo = (id: number) => {
//     const allconstestant = balanceData?.data?.balances?.find(
//       (balance) => balance.contestant_id === id
//     );

//     return allconstestant;
//   };

//   const myContestant = getContestantInfo(Number(user?.contestant_id));

//   // Helper function to calculate balance with fallback logic
//   const calculateBalance = (contestant: any, contestantInfo: any) => {
//     // For non-STAGE_ONE games, prioritize balance data
//     if (allContestsant?.game?.stage !== "STAGE_ONE") {
//       const balanceInfo = getContestantBalanceInfo(contestant?.contestant_id || contestant?.id);
//       if (balanceInfo?.actual_balance !== undefined && balanceInfo?.actual_balance !== null) {
//         return Number(balanceInfo.actual_balance);
//       }
//     }

//     // For STAGE_ONE or fallback logic
//     if (mqttAnswerData && mqttAnswerData.length > 0) {
//       // Use MQTT data if available
//       if (contestant?.stage_balance !== undefined && contestant?.stage_balance !== null) {
//         return Number(contestant.stage_balance);
//       }
//       if (contestant?.wallet_balance !== undefined && contestant?.wallet_balance !== null) {
//         return Number(contestant.wallet_balance);
//       }
//     } else {
//       // Use contestant info from API
//       if (contestantInfo?.actual_balance !== undefined && contestantInfo?.actual_balance !== null) {
//         return Number(contestantInfo.actual_balance);
//       }
//       if (contestantInfo?.wallet_balance !== undefined && contestantInfo?.wallet_balance !== null) {
//         return Number(contestantInfo.wallet_balance);
//       }
//     }

//     // Final fallback - return 0 but log for debugging
//     // console.warn('Balance calculation fallback to 0 for contestant:', {
//     //   contestant,
//     //   contestantInfo,
//     //   stage: allContestsant?.game?.stage,
//     //   hasMqttData: !!(mqttAnswerData && mqttAnswerData.length > 0)
//     // });
    
//     return 0;
//   };

//   return (
//     <div className="flex justify-between !z-[999999999999] h-full items-center flex-col">
//       <div className="relative flex flex-col justify-center items-center"></div>

//       {showHustlerCard && (
//         <>
//           {isLoading ? (
//             <div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
//             </div>
//           ) : (
//             <div
//               className={`flex-1 flex px-3 gap-6 h-full flex-col justify-center items-center`}
//             >
//               {/* Maintain the exact order from backend - no sorting applied */}
//               {dataToRender?.map((contestant: any, idx: number) => {
//                 const isBoardRoute = typeof params?.episodeId !== "undefined";

//                 let contestantInfo = contestant;
//                 if (mqttAnswerData && mqttAnswerData.length > 0) {
//                   contestantInfo =
//                     allContestsant?.data?.find(
//                       (c) => c?.id === contestant.contestant_id
//                     ) || contestant;
//                 }
                
//                 const isMyContestant =
//                   contestantInfo.id === myContestant?.id ||
//                   contestant.contestant_id === myContestant?.id;

//                 // Use the improved balance calculation
//                 const balance = calculateBalance(contestant, contestantInfo);

//                 const name = contestantInfo?.name?.split(" ")[0] || "";

//                 return (
//                   <ContestantCard
//                     key={`${contestant?.id || contestant?.contestant_id}-${idx}`}
//                     contestant={contestant}
//                     originalIndex={idx} // Pass the original backend index
//                     contestantInfo={contestantInfo}
//                     isMyContestant={isMyContestant}
//                     isBoardRoute={isBoardRoute}
//                     showHustleCardAmt={showHustleCardAmt}
//                     balance={balance}
//                     name={name}
//                   />
//                 );
//               })}
//             </div>
//           )}
//         </>
//       )}

//       {showEmptyCard && (
//         <div className="flex-1 flex px-3 h-full 2xl:gap-4 flex-col justify-center items-center">
//           {Array.from({ length: 6 }).map((_, index) => (
//             <StagesCard
//               key={index}
//               title=""
//               subTitle=""
//               borderColor="#FFC125"
//               iconText=""
//               showIcon={false}
//               width={130}
//               className="2xl:w-[260px]"
//             />
//           ))}
//         </div>
//       )}
//       <div className="min-h-[100px]">
//         {showJackpot && <JackpotContainer size={80} text="₦100m" />}
//       </div>
//     </div>
//   );
// };


// Replace the existing dataToRender logic with this ranked version
const HustleSideBar = ({
  showJackpot = true,
  showEmptyCard = false,
  showHustlerCard = false,
  showHustleCardAmt = true,
  mqttAnswerData,
  balanceData
}: prop) => {
  const user = tokenStorage.getUser();
  const params = useParams();

  const { data: allContestsant, isLoading } = useGetGameContestants(
    !params?.episodeId
      ? (user?.game_episode as number)
      : Number(params?.episodeId)
  );

  // Helper function to calculate balance with fallback logic
  const calculateBalance = (contestant: any, contestantInfo: any) => {
    // For non-STAGE_ONE games, prioritize balance data
    if (allContestsant?.game?.stage !== "STAGE_ONE") {
      const balanceInfo = getContestantBalanceInfo(contestant?.contestant_id || contestant?.id);
      if (balanceInfo?.actual_balance !== undefined && balanceInfo?.actual_balance !== null) {
        return Number(balanceInfo.actual_balance);
      }
    }

    // For STAGE_ONE or fallback logic
    if (mqttAnswerData && mqttAnswerData.length > 0) {
      // Use MQTT data if available
      if (contestant?.stage_balance !== undefined && contestant?.stage_balance !== null) {
        return Number(contestant.stage_balance);
      }
      if (contestant?.wallet_balance !== undefined && contestant?.wallet_balance !== null) {
        return Number(contestant.wallet_balance);
      }
    } else {
      // Use contestant info from API
      if (contestantInfo?.actual_balance !== undefined && contestantInfo?.actual_balance !== null) {
        return Number(contestantInfo.actual_balance);
      }
      if (contestantInfo?.wallet_balance !== undefined && contestantInfo?.wallet_balance !== null) {
        return Number(contestantInfo.wallet_balance);
      }
    }

    return 0;
  };

  // Get base data (preserve original order for mapping)
  const baseData = !mqttAnswerData || mqttAnswerData.length === 0
    ? allContestsant?.data || []
    : mqttAnswerData;

  // Create ranked data with original index preserved
  const rankedData = baseData
    .map((contestant: any, originalIndex: number) => {
      let contestantInfo = contestant;
      if (mqttAnswerData && mqttAnswerData.length > 0) {
        contestantInfo = allContestsant?.data?.find(
          (c) => c?.id === contestant.contestant_id
        ) || contestant;
      }
      
      const balance = calculateBalance(contestant, contestantInfo);
      
      return {
        ...contestant,
        contestantInfo,
        balance,
        originalIndex // Keep track of original position for image mapping
      };
    })
    .sort((a, b) => b.balance - a.balance); // Sort by balance descending (highest to lowest)

  const getContestantInfo = (id: number) => {
    const allconstestant = allContestsant?.data?.find(
      (contestant) => contestant.id === id
    );
    return allconstestant;
  };
  
  const getContestantBalanceInfo = (id: number) => {
    const allconstestant = balanceData?.data?.balances?.find(
      (balance) => balance.contestant_id === id
    );
    return allconstestant;
  };

  const myContestant = getContestantInfo(Number(user?.contestant_id));

  return (
    <div className="flex justify-between !z-[999999999999] h-full items-center flex-col">
      <div className="relative flex flex-col justify-center items-center"></div>

      {showHustlerCard && (
        <>
          {isLoading ? (
            <div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <div className="flex-1 flex px-3 gap-6 h-full flex-col justify-center items-center">
              {/* Render contestants ranked by balance (highest to lowest) */}
              {rankedData?.map((contestantData: any, idx: number) => {
                const isBoardRoute = typeof params?.episodeId !== "undefined";
                const contestant = contestantData;
                const contestantInfo = contestantData.contestantInfo;
                
                const isMyContestant =
                  contestantInfo.id === myContestant?.id ||
                  contestant.contestant_id === myContestant?.id;

                const balance = contestantData.balance;
                const name = contestantInfo?.name?.split(" ")[0] || "";

                return (
                  <ContestantCard
                    key={`${contestant?.id || contestant?.contestant_id}-${idx}`}
                    contestant={contestant}
                    originalIndex={contestantData.originalIndex} // Use preserved original index for image mapping
                    contestantInfo={contestantInfo}
                    isMyContestant={isMyContestant}
                    isBoardRoute={isBoardRoute}
                    showHustleCardAmt={showHustleCardAmt}
                    balance={balance}
                    name={name}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {showEmptyCard && (
        <div className="flex-1 flex px-3 h-full 2xl:gap-4 flex-col justify-center items-center">
          {Array.from({ length: 6 }).map((_, index) => (
            <StagesCard
              key={index}
              title=""
              subTitle=""
              borderColor="#FFC125"
              iconText=""
              showIcon={false}
              width={130}
              className="2xl:w-[260px]"
            />
          ))}
        </div>
      )}
      
      <div className="min-h-[100px]">
        {showJackpot && <JackpotContainer size={80} text="₦100m" />}
      </div>
    </div>
  );
};
export default HustleSideBar;



