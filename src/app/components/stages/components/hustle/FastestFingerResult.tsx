// import StagesCard from '@/app/shared/StagesCard'
// import UserBadge from '@/app/shared/UserBadge'
// import React, { useEffect, useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { contestantImages } from '../mocks/contestantImages'
// import { useMQTT } from '@/hooks/useMqttService'
// import { usePathname } from 'next/navigation'

// // Create a unified type for contestant answers
// interface ContestantAnswer {
//   status: string;
//   message: string;
//   data: Datum[];
// }

// interface Datum {
//   contestant_id: number;
//   answered_in: number;
//   is_correct: boolean;
//   is_winner: boolean;
//   wallet_balance: number;
//   book_balance: number;
//   stage_balance: number;
//   contestant_name: string | null;
//   contestant_attr: string;
// }

// interface FastestFingerResultProps {
//   resultArray?: Datum[] | null;
//   timeElapsed?: boolean;
//   mqttAnswerData?: Datum[] | null;
//   currentQuestionId?: string | null;
// }
// const FastestFingerResult = ({
//   resultArray,
//   timeElapsed,

// }: FastestFingerResultProps) => {

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
//     exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
//   };

//   const pathname = usePathname();
//   const isBoardRoute = pathname?.includes('/hustle-board/');

//   return (
//     <div className="h-full !z-[999999999999] flex items-center flex-col">

//       {/* Show results when time has elapsed or results are available */}
//       {(timeElapsed) && resultArray&&resultArray?.length > 0 ? (
//         <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center overflow-y-auto max-h-[600px]">
//           <AnimatePresence>
//             {resultArray?.map((result, index) => {

//               // Display the answered_in time exactly as it comes from the backend
//               const answerTime = result.answered_in;

//               const contestantName = result.contestant_name || `Player ${index + 1}`;

//               return (
//                 <motion.div
//                   key={index}
//                   variants={itemVariants}
//                   initial="hidden"
//                   animate="visible"
//                   exit="exit"
//                   className="w-full"
//                 >
//                   <UserBadge
//                     username={contestantName}
//                     amount={`${String(answerTime?.toFixed(2))}` }
//                     avatarUrl={contestantImages[index % contestantImages.length]} // Use modulo to avoid index errors
//                     isOnline={true}
//                     isActive={result.is_winner&& result?.is_correct} // Only active if it's the first correct answer
//                     borderColor="#FFC125"
//                     backgroundGradient={{
//                       middleColor: "#997416",
//                       endColor: "#FEC124",
//                       startColor: "#FFC125",
//                       direction: "vertical"
//                     }}
//                     textGradient={{
//                       startColor: "#FFFFFF",
//                       endColor: "#FFC125",
//                       direction: "horizontal"
//                     }}
//                     color="#FFFFFF"
//                     correctAnswerColor={result.is_correct ? "#04DA6A" : "#EB001B"}
//                     usernameClassName='mt-[6px] text-white text-xs'
//                     dotPosition={{y:36}}
//                   width={isBoardRoute?230:130}
//                   height={isBoardRoute?80:53}
//                   />
//                 </motion.div>
//               );
//             })}
//           </AnimatePresence>
//         </div>
//       ) : (
//         // Show placeholder cards
//         <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-start items-start">
//           {Array.from({length: 6}).map((_, index) => (
//             <StagesCard
//               key={index}
//               title=""
//               subTitle=""
//               borderColor="#FFC125"
//               iconText=""
//               showIcon={false}
//               width={isBoardRoute?230:130}
//                   height={isBoardRoute?80:53}
//               className="2xl:w-[260px]"
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FastestFingerResult





import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { usePathname } from "next/navigation";
import StagesCard from "@/app/shared/StagesCard";
import UserBadge from "@/app/shared/UserBadge";
import BidCardContainer from "@/app/shared/BidCard";
import { contestantImages } from "../mocks/contestantImages";

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
}

interface ContestantBid {
  contestant_id: string;
  contestant_name: string;
  bid_amount: number;
  timestamp: string;
  question_id?: string;
  remaining_capital?: number;
  bid_percentage?: string;
  is_update?: boolean;
  is_new?: boolean;
}

interface FastestFingerResultProps {
  resultArray?: Datum[] | null;
  timeElapsed?: boolean;
  mqttAnswerData?: Datum[] | null;
  currentQuestionId?: string | null;
  contestantBids?: {
    [contestantId: string]: ContestantBid;
  } | null;
}

interface AnimatedAmountProps {
  from: number;
  to: number;
  onPlaySound?: () => void;
}

const AnimatedAmount = ({ from, to, onPlaySound }: AnimatedAmountProps) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) =>
    `₦${Math.floor(latest).toLocaleString()}`
  );

  useEffect(() => {
    const controls = animate(count, to, {
      duration: 0.8,
      ease: "easeInOut",
      onPlay: onPlaySound,
    });
    return controls.stop;
  }, [to]);

  return <motion.span>{rounded}</motion.span>;
};

const FastestFingerResult = ({
  resultArray,
  timeElapsed,
  contestantBids,
}: FastestFingerResultProps) => {
  const [bidSlots, setBidSlots] = useState<(ContestantBid | null)[]>(
    Array(6).fill(null)
  );
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null);
  const [processedBids, setProcessedBids] = useState(new Set<string>());
  const pathname = usePathname();
  const isBoardRoute = pathname?.includes("/hustle-board/");
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const prevAmountsRef = useRef<{ [id: string]: number }>({});

  useEffect(() => {
    soundRef.current = new Audio("/sounds/select-bid.mp3");
  }, []);

  useEffect(() => {
    if (!contestantBids || Object.keys(contestantBids).length === 0) {
      setBidSlots(Array(6).fill(null));
      setProcessedBids(new Set());
      return;
    }

    const currentBids = Object.values(contestantBids);

    currentBids.forEach((bid: ContestantBid) => {
      const bidKey = `${bid.contestant_id}_${bid.timestamp}`;
      if (processedBids.has(bidKey)) return;

      const existingSlotIndex = bidSlots.findIndex(
        (slot) => slot && slot.contestant_id === bid.contestant_id
      );

      if (existingSlotIndex !== -1) {
        setBidSlots((prev) => {
          const newSlots = [...prev];
          newSlots[existingSlotIndex] = { ...bid, is_update: true };
          return newSlots;
        });

        setAnimatingSlot(existingSlotIndex);
        setTimeout(() => setAnimatingSlot(null), 800);
      } else {
        const nextEmptySlot = bidSlots.findIndex((slot) => slot === null);
        if (nextEmptySlot !== -1) {
          setTimeout(() => {
            setBidSlots((prev) => {
              const newSlots = [...prev];
              newSlots[nextEmptySlot] = { ...bid, is_new: true };
              return newSlots;
            });

            soundRef.current?.play();
            setAnimatingSlot(nextEmptySlot);
            setTimeout(() => setAnimatingSlot(null), 1000);
          }, 300);
        }
      }

      setProcessedBids((prev) => new Set([...prev, bidKey]));
    });
  }, [contestantBids, bidSlots, processedBids]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="h-full !z-[999999999999] flex items-center flex-col">
      {timeElapsed && resultArray && resultArray?.length > 0 ? (
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-center items-center overflow-y-auto max-h-[600px]">
          <AnimatePresence>
            {resultArray?.map((result, index) => {
              const answerTime = result.answered_in;
              const contestantName =
                result.contestant_name || `Player ${index + 1}`;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <UserBadge
                    username={contestantName}
                    amount={`${String(answerTime?.toFixed(2))}`}
                    avatarUrl={
                      contestantImages[index % contestantImages.length]
                    }
                    isOnline={true}
                    isActive={result.is_winner && result?.is_correct}
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
                    correctAnswerColor={
                      result.is_correct ? "#04DA6A" : "#EB001B"
                    }
                    usernameClassName="mt-[6px] text-white text-xs"
                    dotPosition={{ y: 36 }}
                    width={isBoardRoute ? 230 : 130}
                    height={isBoardRoute ? 80 : 53}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex-1 flex h-full 2xl:gap-4 gap-2 flex-col justify-start items-start">
          {bidSlots.map((bid, index) => {
            if (!bid) {
              return (
                <StagesCard
                  key={`slot-${index}`}
                  title=""
                  subTitle=""
                  borderColor="#FFC125"
                  iconText=""
                  showIcon={false}
                  width={isBoardRoute ? 230 : 130}
                  height={isBoardRoute ? 80 : 53}
                  className="2xl:w-[260px] opacity-50"
                />
              );
            }

            const contestantId = bid.contestant_id;
            const amount =
              Math.ceil(Number(bid?.bid_amount) / 100) * 100;
            const prevAmount = prevAmountsRef.current[contestantId] ?? 0;
            prevAmountsRef.current[contestantId] = amount;

            return (
              <motion.div
                key={`slot-${index}`}
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: animatingSlot === index ? [1, 1.1, 1] : 1,
                  opacity: 1,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <BidCardContainer
                  title={bid.contestant_name?.split(" ")[0]}
                  avatarUrl={
                    contestantImages[index % contestantImages.length]
                  }
                  subTitle="Bid:"
                  amountNode={
                    <AnimatedAmount
                      from={prevAmount}
                      to={amount}
                      onPlaySound={() => soundRef.current?.play()}
                    />
                  }
                  amountClassName="font-gilroyBold text-4xl text-white font-bold"
                  borderColor={
                    animatingSlot === index ? "#04DA6A" : "#FFC125"
                  }
                  width={isBoardRoute ? 230 : 130}
                  height={isBoardRoute ? 80 : 53}
                  className="2xl:w-[260px]"
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FastestFingerResult;
