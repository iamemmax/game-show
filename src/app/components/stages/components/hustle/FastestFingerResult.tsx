"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  onStart?: () => void;
  onComplete?: () => void;
}

const AnimatedAmount = ({ from, to, onStart, onComplete }: AnimatedAmountProps) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) =>
    `₦${Math.floor(latest).toLocaleString()}`
  );

  useEffect(() => {
    const controls = animate(count, to, {
      duration: 0.8,
      ease: "easeInOut",
      onPlay: onStart,
      onComplete,
    });
    return controls.stop;
  }, [to, onStart, onComplete]);

  return <motion.span>{rounded}</motion.span>;
};

const FastestFingerResult = ({
  resultArray,
  timeElapsed,
  contestantBids,
}: FastestFingerResultProps) => {
  const [bidSlots, setBidSlots] = useState<(ContestantBid | null)[]>(Array(6).fill(null));
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null);
  const [processedBids, setProcessedBids] = useState(new Set<string>());
  const [userInteracted, setUserInteracted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const pathname = usePathname();
  const isBoardRoute = pathname?.includes("/hustle-board/");
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const prevAmountsRef = useRef<{ [id: string]: number }>({});
  const activeAnimations = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Debug logger
  const addDebugLog = useCallback((message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Initialize audio context and audio element
useEffect(() => {
  const initializeAudio = async () => {
    try {
      // Create audio context with proper TypeScript handling
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      } else {
        addDebugLog("AudioContext not supported");
        return;
      }
      
      // Create audio element
      soundRef.current = new Audio("/sounds/select-bid.mp3");
      soundRef.current.preload = "auto";
      soundRef.current.volume = 0.7;
      soundRef.current.crossOrigin = "anonymous";
      
      // Set up event listeners
      soundRef.current.addEventListener('canplaythrough', () => {
        setAudioReady(true);
        addDebugLog("Audio ready to play");
      });
      
      soundRef.current.addEventListener('error', (e) => {
        addDebugLog(`Audio error: ${e.message || 'Unknown error'}`);
      });

      // Load the audio
      soundRef.current.load();
      
    } catch (error) {
      addDebugLog(`Audio initialization error: ${error}`);
    }
  };

  initializeAudio();

  return () => {
    if (soundRef.current) {
      soundRef.current.pause();
      soundRef.current.src = "";
      soundRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };
}, [addDebugLog]);

  // Enhanced user interaction detection with immediate audio unlock
  useEffect(() => {
    const unlockAudio = async () => {
      if (!userInteracted && soundRef.current && audioContextRef.current) {
        try {
          // Resume audio context
          if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }
          
          // Play and immediately pause to unlock
          soundRef.current.volume = 0;
          const playPromise = soundRef.current.play();
          
          if (playPromise !== undefined) {
            await playPromise;
            soundRef.current.pause();
            soundRef.current.currentTime = 0;
            soundRef.current.volume = 0.7;
          }
          
          setUserInteracted(true);
          addDebugLog("Audio unlocked successfully");
        } catch (error) {
          addDebugLog(`Audio unlock failed: ${error}`);
        }
      }
    };

    const handleInteraction = async (event: Event) => {
      addDebugLog(`User interaction: ${event.type}`);
      await unlockAudio();
      
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('pointerdown', handleInteraction);
      document.removeEventListener('mousedown', handleInteraction);
    };

    // Add multiple event listeners for better coverage
    document.addEventListener('click', handleInteraction, { passive: true });
    document.addEventListener('touchstart', handleInteraction, { passive: true });
    document.addEventListener('keydown', handleInteraction, { passive: true });
    document.addEventListener('pointerdown', handleInteraction, { passive: true });
    document.addEventListener('mousedown', handleInteraction, { passive: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('pointerdown', handleInteraction);
      document.removeEventListener('mousedown', handleInteraction);
    };
  }, [userInteracted, addDebugLog]);

  // Improved play sound function
  const playSound = useCallback(async () => {
    if (!soundRef.current || !audioReady) {
      addDebugLog("Sound not ready");
      return;
    }

    try {
      // Ensure audio context is running
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Reset and play
      soundRef.current.currentTime = 0;
      soundRef.current.volume = 0.7;
      
      const playPromise = soundRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        addDebugLog("Sound played successfully");
      }
    } catch (error) {
      addDebugLog(`Playback error: ${error}`);
      
      // Fallback: try to create and play a new audio instance
      try {
        const fallbackAudio = new Audio("/sounds/select-bid.mp3");
        fallbackAudio.volume = 0.7;
        await fallbackAudio.play();
        addDebugLog("Fallback audio played");
      } catch (fallbackError) {
        addDebugLog(`Fallback also failed: ${fallbackError}`);
      }
    }
  }, [audioReady, addDebugLog]);

 
 

  useEffect(() => {
    if (!contestantBids || Object.keys(contestantBids).length === 0) {
      setBidSlots(Array(6)?.fill(null));
      setProcessedBids(new Set());
      return;
    }

    const currentBids = Object.values(contestantBids);
 
    currentBids?.forEach((bid: ContestantBid) => {
      const bidKey = `${bid.contestant_id}_${bid.timestamp}`;
      if (processedBids.has(bidKey)) return;

      setBidSlots((prevSlots) => {
        const existingSlotIndex = prevSlots.findIndex(
          (slot) => slot && slot.contestant_id === bid.contestant_id
        );

        if (existingSlotIndex !== -1) {
                const newSlots = [...prevSlots];
          newSlots[existingSlotIndex] = { ...bid, is_update: true };
          setAnimatingSlot(existingSlotIndex);
          
          // Play sound immediately for updates
          setTimeout(() => {
            playSound();
          }, 100);
          
          setTimeout(() => setAnimatingSlot(null), 800);
          return newSlots;
        } else {
          const nextEmptySlot = prevSlots.findIndex((slot) => slot === null);
          if (nextEmptySlot !== -1) {
            setTimeout(() => {
              setAnimatingSlot(nextEmptySlot);
              
              // Play sound immediately for new bids
              setTimeout(() => {
                playSound();
              }, 100);
              
              setTimeout(() => setAnimatingSlot(null), 1000);
            }, 300);
            
            const newSlots = [...prevSlots];
            newSlots[nextEmptySlot] = { ...bid, is_new: true };
            return newSlots;
          }
        }
        return prevSlots;
      });

      setProcessedBids((prev) => new Set([...prev, bidKey]));
    });
  }, [contestantBids, processedBids, playSound, addDebugLog]);

  const handleAmountStart = useCallback(() => {
    activeAnimations.current += 1;
    playSound();
  }, [playSound, addDebugLog]);

  const handleAmountComplete = useCallback(() => {
    activeAnimations.current -= 1;
  }, [addDebugLog]);

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
            {resultArray.map((result, index) => {
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
            const amount = Math.ceil(Number(bid?.bid_amount) / 100) * 100;
            const prevAmount = prevAmountsRef.current[contestantId] ?? 0;
            prevAmountsRef.current[contestantId] = amount;

            // Always ensure there's a meaningful difference for animation
            const fromAmount = bid.is_new ? 0 : prevAmount;
            const toAmount = Math.max(amount, fromAmount + 100);

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
                      from={fromAmount}
                      to={toAmount}
                      onStart={handleAmountStart}
                      onComplete={handleAmountComplete}
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