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

  // Debug logger
  const addDebugLog = useCallback((message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Enhanced user interaction detection
  useEffect(() => {
    const handleFirstInteraction = (event: Event) => {
      addDebugLog(`First interaction detected: ${event.type}`);
      setUserInteracted(true);
      
      // Try to initialize audio context on first interaction
      if (soundRef.current) {
        soundRef.current.load();
        addDebugLog("Audio reloaded on first interaction");
      }
      
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('pointerdown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('pointerdown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('pointerdown', handleFirstInteraction);
    };
  }, [addDebugLog]);

  // Enhanced audio initialization
  useEffect(() => {
    addDebugLog("Initializing audio...");
    
    const initializeAudio = async () => {
      try {
        soundRef.current = new Audio();
        if (!soundRef.current) {
          addDebugLog("Failed to create Audio object");
          return;
        }

        // Set source with fallback
        const audioSrc = "/sounds/select-bid.mp3";
        soundRef.current.src = audioSrc;
        soundRef.current.preload = "auto";
        soundRef.current.loop = false;
        soundRef.current.volume = 0.5;
        
        addDebugLog(`Audio source set to: ${audioSrc}`);

        // Enhanced event listeners
        soundRef.current.addEventListener('loadstart', () => {
          addDebugLog("Audio loading started");
        });

        soundRef.current.addEventListener('canplay', () => {
          addDebugLog("Audio can play");
          setAudioReady(true);
        });

        soundRef.current.addEventListener('canplaythrough', () => {
          addDebugLog("Audio can play through");
          setAudioReady(true);
        });

        soundRef.current.addEventListener('error', (e) => {
          addDebugLog(`Audio error: ${e.message || 'Unknown error'}`);
          setAudioReady(false);
        });

        soundRef.current.addEventListener('play', () => {
          addDebugLog("Audio started playing");
        });

        soundRef.current.addEventListener('pause', () => {
          addDebugLog("Audio paused");
        });

        // Try to load the audio
        soundRef.current.load();
        
      } catch (error) {
        addDebugLog(`Audio initialization error: ${error}`);
      }
    };

    initializeAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }
    };
  }, [addDebugLog]);

  // Enhanced play sound function with extensive debugging
  const playSound = useCallback(async () => {
    addDebugLog(`playSound called - userInteracted: ${userInteracted}, audioReady: ${audioReady}, soundRef exists: ${!!soundRef.current}`);
    
    if (!soundRef.current) {
      addDebugLog("No sound reference available");
      return;
    }

    if (!userInteracted) {
      addDebugLog("User hasn't interacted yet - cannot play sound");
      return;
    }

    if (!audioReady) {
      addDebugLog("Audio not ready yet");
      return;
    }

    try {
      // Reset to start for single play
      soundRef.current.currentTime = 0;

      addDebugLog("Attempting to play sound...");
      const playPromise = soundRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        addDebugLog("Sound playing successfully!");
      } else {
        addDebugLog("Play promise is undefined");
      }
    } catch (error) {
      addDebugLog(`Error playing sound: ${error}`);
      
      // Try to reload and play again
      try {
        soundRef.current.load();
        setTimeout(async () => {
          if (soundRef.current) {
            await soundRef.current.play();
            addDebugLog("Sound playing after reload");
          }
        }, 100);
      } catch (retryError) {
        addDebugLog(`Retry failed: ${retryError}`);
      }
    }
  }, [userInteracted, audioReady, addDebugLog]);

 
 

  useEffect(() => {
    if (!contestantBids || Object.keys(contestantBids).length === 0) {
      setBidSlots(Array(6).fill(null));
      setProcessedBids(new Set());
      return;
    }

    const currentBids = Object.values(contestantBids);
    addDebugLog(`Processing ${currentBids.length} bids`);

    currentBids?.forEach((bid: ContestantBid) => {
      const bidKey = `${bid.contestant_id}_${bid.timestamp}`;
      if (processedBids.has(bidKey)) return;

      addDebugLog(`Processing new bid from ${bid.contestant_name}`);

      setBidSlots((prevSlots) => {
        const existingSlotIndex = prevSlots.findIndex(
          (slot) => slot && slot.contestant_id === bid.contestant_id
        );

        if (existingSlotIndex !== -1) {
          addDebugLog(`Updating existing bid at slot ${existingSlotIndex}`);
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
            addDebugLog(`Adding new bid at slot ${nextEmptySlot}`);
            
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
    addDebugLog(`Amount animation started (active: ${activeAnimations.current})`);
    playSound();
  }, [playSound, addDebugLog]);

  const handleAmountComplete = useCallback(() => {
    activeAnimations.current -= 1;
    addDebugLog(`Amount animation completed (active: ${activeAnimations.current})`);
    // Remove the stopSound call since we're not looping anymore
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