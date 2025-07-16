import React, { useEffect, useState } from "react";
import {
  PATTERN_ORANGE_BLACK,
  PATTERN_PURPLE_GREY,
  PATTERN_PURPLE_WHITE,
  PATTERN_GREEN_BLACK,
  PATTERN_PURPLE_BLACK,
} from "@/app/shared/HustleCard.PatternTypes";
import { convertKebabAndSnakeToTitleCase } from "@/utils/strings";
import { addCommasToNumber } from "@/utils";
import { hustleRevealProps } from "@/app/components/stages/api/stage1/getHustleReveal";
import Image from "next/image";
import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import HustleCardTwo from "@/app/shared/HustleCardTwo";
import { motion, AnimatePresence } from "framer-motion";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { useParams } from "next/navigation";

interface Prop {
  hustleReveal: hustleRevealProps | null | undefined;
}

const HustleBoardInvestCapitall = ({ hustleReveal }: Prop) => {
  const params = useParams();
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const hustlePattern = [
    { pattern: PATTERN_PURPLE_GREY },
    { pattern: PATTERN_PURPLE_WHITE },
    { pattern: PATTERN_PURPLE_BLACK },
    { pattern: PATTERN_ORANGE_BLACK },
    { pattern: PATTERN_GREEN_BLACK },
  ];

  const { data: allContestsant } = useGetGameContestants(
    Number(params?.episodeId)
  );

  // Sound effect function
  const playRevealSound = () => {
    try {
      const audio = new Audio('/sounds/riffle-card-shuffle-104313.mp3'); // You'll need to add this sound file
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Sound not available:', error);
    }
  };

  // Alternative sound using Web Audio API for a synthetic sound
  const playBeepSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.log('Web Audio API not supported');
        return;
      }
      
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Web Audio API not supported:', error);
    }
  };

  const getContestantInfo = (id: number) => {
    const allconstestant = allContestsant?.data?.find(
      (contestant) => contestant.id === id
    );
    return allconstestant;
  };

  // Auto-reveal cards one by one - FASTER
  useEffect(() => {
    if (!hustleReveal?.data || hustleReveal.data.length === 0) return;

    const allCards: string[] = [];
    hustleReveal.data.forEach((contestant, contestantIdx) => {
      contestant.reveals?.forEach((card, cardIdx) => {
        allCards.push(`${contestantIdx}-${cardIdx}`);
      });
    });

    if (allCards.length === 0) return;

    setIsAnimating(true);
    setRevealedCards(new Set());

    const revealInterval = setInterval(() => {
      setRevealedCards(prev => {
        const newRevealed = new Set(prev);
        const nextCardIndex = newRevealed.size;
        
        if (nextCardIndex < allCards.length) {
          newRevealed.add(allCards[nextCardIndex]);
          // Play sound effect
          playBeepSound();
          return newRevealed;
        } else {
          clearInterval(revealInterval);
          setIsAnimating(false);
          return newRevealed;
        }
      });
    }, 250); // Reveal every 250ms (faster from 500ms)

    return () => clearInterval(revealInterval);
  }, [hustleReveal?.data]);

  if (!hustleReveal?.data || hustleReveal.data.length === 0) {
    return <div className="text-white text-base">No hustle data available</div>;
  }

  return (
    <div className="flex flex-col gap-2 w-full mx-auto px-4">
      {hustleReveal.data.map((contestant, contestantIdx) => (
        <motion.div 
          key={contestant.contestant_id} 
          className="grid grid-cols-[1fr_5fr] items-start gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: contestantIdx * 0.05 }} // Faster
        >
          {/* Contestant Card - Purple card style */}
          <motion.div 
            className="o bg-[#1C0240] border border-[#7E3CE0] rounded-lg py-3 px-4 flex-shrink-0 flex flex-col justify-between relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: contestantIdx * 0.05 }} // Faster
          >
            {/* Background pattern/texture - optional */}
            <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* Top section with image */}
              <div className="flex justify-start">
                <motion.div 
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: contestantIdx * 0.05 + 0.15 }} // Faster
                >
                  <Image
                    alt=""
                    src={contestant?.contestant_details?.contestant_photo_url ?? ""}
                    width={40}
                    height={40}
                    className="rounded-full w-full h-full object-cover"
                  />
                </motion.div>
              </div>
              
              {/* Bottom section with text */}
              <div className="flex flex-col mt-2 items-start">
                <motion.p 
                  className="text-white text-base font-medium leading-tight mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: contestantIdx * 0.05 + 0.2 }} // Faster
                >
                  {contestant.contestant_details?.name}
                </motion.p>
                <motion.p 
                  className="text-white text-2xl font-bold leading-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: contestantIdx * 0.05 + 0.25 }} // Faster
                >
                  ₦{addCommasToNumber(
                    Number(getContestantInfo(contestant?.contestant_id)?.actual_balance)
                  )}
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Hustle Cards - Animated reveal */}
          <div className="grid grid-cols-5 relative gap-4 flex-grow">
            <AnimatePresence>
              {contestant.reveals?.map((card, cardIdx) => {
                const cardKey = `${contestantIdx}-${cardIdx}`;
                const isRevealed = revealedCards.has(cardKey);
                
                return (
                  <div key={card.id} className="mb-2 relative">
                    {/* Card Back (Hidden state) */}
                    {!isRevealed && (
                      <motion.div
                        className="w-full min-h-[8rem] bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg border-2 border-gray-500 flex items-center justify-center relative overflow-hidden"
                        initial={{ scale: 1, rotateY: 0 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ duration: 0.2 }} // Faster
                      >
                        {/* Card back pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 opacity-80"></div>
                        <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                        
                        {/* Question mark or logo */}
                        <div className="relative z-10 text-white text-4xl font-bold opacity-60">
                          ?
                        </div>
                        
                        {/* Subtle animation while waiting */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }} // Faster
                        />
                      </motion.div>
                    )}

                    {/* Card Front (Revealed state) */}
                    {isRevealed && (
                      <motion.div
                        initial={{ 
                          scale: 1.2, 
                          rotateY: 180,
                          opacity: 0,
                          z: 10
                        }}
                        animate={{ 
                          scale: 1, 
                          rotateY: 0,
                          opacity: 1,
                          z: 0
                        }}
                        transition={{ 
                          duration: 0.5, // Faster from 0.8
                          ease: "easeOut",
                          opacity: { duration: 0.2, delay: 0.1 } // Faster
                        }}
                        className="relative"
                      >
                        {/* Glow effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-yellow-300/50 to-yellow-400/30 rounded-lg blur-lg"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
                          transition={{ duration: 0.6, ease: "easeOut" }} // Faster from 1
                        />
                        
                        {/* Sparkle effects */}
                        <motion.div
                          className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                          transition={{ duration: 0.6, delay: 0.15 }} // Faster
                        />
                        <motion.div
                          className="absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-300 rounded-full"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                          transition={{ duration: 0.6, delay: 0.25 }} // Faster
                        />

                        <HustleCardTwo
                          id={card.id.toString()}
                          title={convertKebabAndSnakeToTitleCase(
                            card.hustle_name?.split(" ")[0]
                          )}
                          number={card.hustle_number}
                          amount={`₦${addCommasToNumber(Number(card.hustle_amount.toFixed(0)))}`}
                          pattern={hustlePattern[cardIdx % hustlePattern.length].pattern}
                          titleContainer="w-full flex justify-center items-center absolute left-0 truncate top-[5px] font-bold text-white leading-tight line-clamp-2"
                          titleClassName="text-[1.5rem] truncate"
                          numberClassName="text-[3rem] top-5"
                          amountClassName="2xl:text-[1.2rem] top-2 text-[1.4rem] 3xl:text-[1.8rem] font-bold"
                          className="w-full min-h-[8rem]"
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HustleBoardInvestCapitall;