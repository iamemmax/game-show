import Logo from "@/app/icons/Logo";
import Trophy from "@/app/icons/Trophy";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import StageTallyCard from "@/app/shared/StageTallyCard";
import { addCommasToNumber } from "@/utils";
import { cn } from "@/utils/classNames";
import { Button, Dialog, GlowyStrokeText } from "@/components/core";
import { tokenStorage } from "@/utils/auth";
import { useMQTT } from "@/hooks/useMqttService";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { useParams, useRouter } from "next/navigation";
import { formatAmount } from "@/utils/currency";
import Stage3HustleBoardGetReadyPage from "@/app/hustle-board/components/stage3/Stage3GetReadyScreen";
import ViewOnlyQuestionTwoScreen from "./statge2/StageTwoQuestionScreen";
import HustleStages from "@/app/components/stages/components/hustle/HustleStages";
import { contestantImages } from "@/app/components/stages/components/mocks/contestantImages";
import HustleBottomCard from "@/app/components/stages/components/hustle/HustleBottomCard";
import HustleSideBar from "@/app/components/stages/components/hustle/HustleSideBar";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import RafflePickReveal from "./stage4/RafflePickReveal";

interface StageOneTallyProps {
  eliminationCount?: number;
  removeCount?: number;
  title?: string;
  activeState: number;
  onNext?: () => void;
}

// Sound effects configuration
const SOUND_EFFECTS = {
  reveal: [
    '/sounds/mixkit-game-level-completed-2059.wav',
    '/sounds/mixkit-game-level-completed-2059.wav', 
    '/sounds/mixkit-game-level-completed-2059.wav',
    '/sounds/mixkit-game-level-completed-2059.wav',
    '/sounds/mixkit-game-level-completed-2059.wav',
    '/sounds/mixkit-game-level-completed-2059.wav'
  ],
  elimination: '/sounds/mixkit-game-level-completed-2059.wav',
  success: '/sounds/success.mp3',
  dramatic: '/sounds/dramatic-reveal.mp3'
};

// Custom hook for sound management with proper error handling and user interaction
const useSoundEffects = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Initialize user interaction detection
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      // console.log('User interaction detected - audio enabled');
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);
  
  const preloadSounds = useCallback(() => {
    try {
      // Clear existing audio objects
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.removeEventListener('canplaythrough', () => {});
        audio.removeEventListener('error', () => {});
      });
      audioRefs.current = {};

      // Preload reveal sounds
      SOUND_EFFECTS.reveal.forEach((soundPath, index) => {
        const audio = new Audio(soundPath);
        audio.preload = 'auto';
        audio.volume = 0.7;
        
        // Add error handling
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load reveal sound ${index}:`, e);
        });
        
        // Add load event handler
        audio.addEventListener('canplaythrough', () => {
          console.log(`Reveal sound ${index} loaded successfully`);
        });
        
        audioRefs.current[`reveal-${index}`] = audio;
      });
      
      // Preload other sounds with error handling
      const soundConfigs = [
        { key: 'elimination', path: SOUND_EFFECTS.elimination, volume: 0.8 },
        { key: 'success', path: SOUND_EFFECTS.success, volume: 0.6 },
        { key: 'dramatic', path: SOUND_EFFECTS.dramatic, volume: 0.8 }
      ];

      soundConfigs.forEach(({ key, path, volume }) => {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = volume;
        
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load ${key} sound:`, e);
        });
        
        audio.addEventListener('canplaythrough', () => {
          console.log(`${key} sound loaded successfully`);
        });
        
        audioRefs.current[key] = audio;
      });

      setIsAudioInitialized(true);
      console.log('All sounds preloaded');
      
    } catch (error) {
      console.error('Error preloading sounds:', error);
    }
  }, []);
  
  const playSound = useCallback(async (soundKey: string) => {
    // Check if user has interacted with the page (required by browsers)
    if (!hasUserInteracted) {
      console.warn('Cannot play sound: User has not interacted with the page yet');
      return;
    }

    const audio = audioRefs.current[soundKey];
    if (!audio) {
      console.warn(`Sound not found: ${soundKey}`);
      return;
    }

    try {
      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Try to play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log(`Playing sound: ${soundKey}`);
      }
    } catch (error) {
      console.warn(`Sound playback failed for ${soundKey}:`, error);
      
     
    }
  }, [hasUserInteracted]);
  
  const stopSound = useCallback((soundKey: string) => {
    const audio = audioRefs.current[soundKey];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);
  
  const stopAllSounds = useCallback(() => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);


  
  return { 
    preloadSounds, 
    playSound, 
    stopSound, 
    stopAllSounds, 
    isAudioInitialized,
    hasUserInteracted,
  };
};

// Simple fallback audio hook
const useSimpleAudio = () => {
  const playSound = useCallback((soundPath: string, volume: number = 0.7) => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audio.play().catch(error => {
        console.warn('Simple audio play failed:', error);
      });
    } catch (error) {
      console.error('Simple audio creation failed:', error);
    }
  }, []);

  return { playSound };
};

const HustleBoardStageTallyPage = ({
  eliminationCount = 2,
  removeCount = 0,
  title = "Stage 1",
  activeState,
  onNext
}: StageOneTallyProps) => {
  const borderArray = [
    "#7E3CE0",
    "#04DA6A",
    "#FF7D01",
    "#AE0F69",
    "#E5AA18",
    "#9E5CFF",
  ];

  const params = useParams();
  const router = useRouter();
  
  // Sound effects hook with debugging
  const { 
    preloadSounds, 
    playSound, 
    stopSound, 
    stopAllSounds,
    isAudioInitialized,
    hasUserInteracted,
    
  } = useSoundEffects();

  // Fallback simple audio hook
  const { playSound: playSimpleSound } = useSimpleAudio();
  
  // Add key for forcing re-render and ensure episodeId is properly extracted
  const episodeId = useMemo(() => {
    if (!params?.episodeId) return null;
    return Array.isArray(params.episodeId) ? Number(params.episodeId[0]) : Number(params.episodeId);
  }, [params?.episodeId]);

  const { isConnected, addMessageListener, removeMessageListener } = useMQTT();
  const [goToStage2, setGoToStage2] = useState(false);
  const [goToStage3, setGoToStage3] = useState(false);
  const [goToStage4, setGoToStage4] = useState(false);
  const [showEliminationModal, setShowEliminationModal] = useState(false);
  const [processedBalances, setProcessedBalances] = useState<any[]>([]);
  const [revealedItems, setRevealedItems] = useState<Set<number>>(new Set());
const [stage, setStage] = useState(1)
  const user = tokenStorage.getUser();

  // Use episodeId consistently and add dependency to force re-fetch
  const gameEpisodeId = episodeId || (user?.game_episode as number);
  const { data: allContestsant, isLoading } = useGetGameContestants(gameEpisodeId);

  // Initialize sounds on component mount
  useEffect(() => {
    console.log('Initializing sounds...');
    preloadSounds();
    
    return () => {
      console.log('Cleaning up sounds...');
      stopAllSounds();
    };
  }, [preloadSounds, stopAllSounds]);

  // Debug audio status
  useEffect(() => {
    console.log('Audio Status:', {
      initialized: isAudioInitialized,
      userInteracted: hasUserInteracted
    });
  }, [isAudioInitialized, hasUserInteracted]);

  // Reset component state when episodeId changes
  useEffect(() => {
    setGoToStage2(false);
    setGoToStage3(false);
    setShowEliminationModal(false);
    setProcessedBalances([]);
    setRevealedItems(new Set());
    stopAllSounds();
  }, [episodeId, stopAllSounds]);

  // Check if current user is eliminated
  useEffect(() => {
    if (allContestsant?.data && user?.contestant_id) {
      const currentContestant = allContestsant.data.find(
        (contestant) => contestant.id === user.contestant_id
      );

      if (currentContestant?.is_eliminated) {
        console.log('Player eliminated, playing elimination sound');
        setShowEliminationModal(true);
        
        // Try both audio methods
        playSound('elimination');
        playSimpleSound('/sounds/mixkit-game-level-completed-2059.wav', 0.8);
      }
    }
  }, [allContestsant?.data, user?.contestant_id, playSound, playSimpleSound]);

  // Dynamic tally array based on elimination count
  const tallyArray = [
    "PRO HUSTLER",
    "SUPER HUSTLER",
    "MINI HUSTLER",
    "MICRO HUSTLER",
  ];

  // Sort contestants - non-eliminated first, then eliminated
  const sortedContestants = useMemo(() => {
    if (!allContestsant?.data) return [];

    // Create a copy of the data to avoid mutating the original
    return [...allContestsant.data].sort((a, b) => {
      // Sort by elimination status first
      if (a.is_eliminated && !b.is_eliminated) return 1;
      if (!a.is_eliminated && b.is_eliminated) return -1;

      // If both have same elimination status, sort by balance (if available)
      if (a.actual_balance && b.actual_balance) {
        return Number(b.actual_balance) - Number(a.actual_balance);
      }

      // Default to original order
      return 0;
    });
  }, [allContestsant?.data]);

  // Handle sound effects for item reveals
  const handleItemReveal = useCallback(async (index: number, isEliminated: boolean) => {
    if (!revealedItems.has(index)) {
      setRevealedItems(prev => new Set([...prev, index]));
      
      console.log(`Revealing item ${index}, eliminated: ${isEliminated}`);
      
      // Play appropriate sound based on contestant status
      if (isEliminated) {
        await playSound('elimination');
        // Fallback
        playSimpleSound('/sounds/mixkit-game-level-completed-2059.wav', 0.8);
      } else {
        // Use different reveal sounds for different positions
        const soundIndex = index % SOUND_EFFECTS.reveal.length;
        await playSound(`reveal-${soundIndex}`);
        // Fallback
        playSimpleSound('/sounds/mixkit-game-level-completed-2059.wav', 0.7);
      }
    }
  }, [revealedItems, playSound, playSimpleSound]);

  // Play dramatic sound when all items are revealed
  useEffect(() => {
    if (sortedContestants.length > 0 && revealedItems.size === sortedContestants.length) {
      setTimeout(() => {
        playSound('dramatic');
        // Fallback
        playSimpleSound('/sounds/dramatic-reveal.mp3', 0.8);
      }, 500);
    }
  }, [revealedItems.size, sortedContestants.length, playSound, playSimpleSound]);

  // MQTT message handling
  useEffect(() => {
    if (!isConnected) return;

    const handleMQTTMessage = (receivedMessage: any) => {
      console.log("Main page received message:", receivedMessage);

      // Handle stage transition events
      if (receivedMessage?.event === "game_s2_prep") {
        stopAllSounds();
        setGoToStage2(true);
      }
      if (receivedMessage?.event === "game_s3_prep") {
        stopAllSounds();
        setGoToStage3(true);
      }
      if (receivedMessage?.event === "game_s4_prep") {
        stopAllSounds();
        setGoToStage4(true);
      }
    };

    if (isConnected) {
      addMessageListener(handleMQTTMessage);
    }

    return () => {
      removeMessageListener(handleMQTTMessage);
    };


  }, [isConnected, addMessageListener, removeMessageListener, stopAllSounds]);

  // Early returns for stage transitions
  if (goToStage2) {
    return <ViewOnlyQuestionTwoScreen key={`stage2-question-${episodeId}`} />;
  }

  if (goToStage3) {
    return (
      <Stage3HustleBoardGetReadyPage 
        key={`stage3-board-ready-${episodeId}`}
      
      />
    );
  }
  if (goToStage4) {
    return (
      <RafflePickReveal key={`stage4-raffle-pick-${episodeId}`} />
    );
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading...</div>
      </div>
    );
  }


  return (
    <div key={`stage-one-tally-${episodeId || 'default'}`}>
  
      {/* Elimination Modal */}
      {showEliminationModal && (
        <Dialog
          open={showEliminationModal}
          onOpenChange={setShowEliminationModal}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-gradient-to-b from-[#980306] to-[#FE8E8E] p-1 rounded-xl max-w-md w-full">
              <div className="bg-[#13051E] rounded-lg p-6 flex flex-col items-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  You've Been Eliminated!
                </h2>
                <div className="mb-4">
                  <Trophy height={80} width={80} />
                </div>
                <p className="text-white text-center mb-6">
                  Unfortunately, your journey ends here. Thank you for
                  participating!
                </p>
                <Button
                  onClick={() => {
                    stopAllSounds();
                    router.push("/login");
                    setShowEliminationModal(false);
                  }}
                  className="bg-[#D91FFF] hover:bg-[#b01ad3] text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      <div
        className={`grid ${episodeId ? "grid-cols-[1fr_4fr_1fr] " : "grid-cols-[1fr_2.5fr_1fr] 2xl:grid-cols-[1fr_1.5fr_1fr]"} h-full `}
      >
        {/* Left Sidebar */}
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center h-3.5 w-full mt-8">
            <Logo />
          </div>
          <div>
            <HustleStages activeStage={activeState} />
          </div>
            <div className="pb-4 ">
            <Salary4LifeTrophy className="max-xl:h-[13.25rem]" />
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col justify-between items-center min-h-full">
          {/* Top section */}
          <div className="flex flex-col w-full items-center">
            <div className="w-full h-[100px] flex items-center justify-center">
              <HeaderTitleContainer
                backgroundColor="#791192"
                color="#ed99ff"
                text={title}
                textGradientEnd="#8E17AA"
                className="font-display"
                textGradientStart="#8E17AA"
                borderGradientStart="#f712fc"
                borderGradientEnd="#e151fe"
                fontSize={45}
                fontFamily="Verdana"
                textStrokeColor="#a219c1"
                textStrokeWidth={4.4}
              />
            </div>

            <div
              className={`relative w-full ${processedBalances?.length <= 4 ? "py-[3rem]" : "py-[1rem]"}   2xl:py-[2.5rem] ${episodeId ? "w-full" : "max-xl:max-w-[40.5rem] 2xl:max-w-[60rem]"}  px-4 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden`}
              style={{
                backdropFilter: "blur(74px)",
                WebkitBackdropFilter: "blur(74px)",
              }}
            >
              {/* Animated border */}
              <div className="absolute inset-0">
                <motion.div
                  className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%,
#d91fff 0deg,
#d91fff 120deg,
#00ffff 100deg,
#00ffff 240deg,
#FFD700 220deg,
#FFD700 360deg,
#d91fff 340deg
                    )`,
                    backdropFilter: "blur(74px)",
                    WebkitBackdropFilter: "blur(74px)",
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
              </div>

              {/* Content container */}
              <div className="absolute inset-[8px] bg-[#13051E]  rounded-[.675rem]" />
              <div className="relative">
                <div className="flex justify-center flex-col items-center">
                  <div>
                    <GlowyStrokeText
                      strokeWidth={2}
                      strokeColor="#D91FFF"
                      glowIntensity="low"
                      glowColor="#13051E"
                      textclassName={`${episodeId ? "text-[4.5rem]" : "text-[2.5rem]"} font-extrabold font-lucky`}
                      fillColor="#000"
                    >
                      Leaderboard
                    </GlowyStrokeText>
                  </div>

              

<motion.div
  className={`flex items-center gap-1 ${allContestsant && allContestsant?.data?.length <= 4 ? "gap-3" : "gap-1"} 2xl:gap-2 flex-col`}
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 1.2, // Increased stagger time for better sound timing
      },
    },
  }}
>
  {sortedContestants.map((tally, idx: number) => (
    <motion.div
      key={`${tally.id}-${idx}`}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.8,
            ease: "easeOut",
            delay: 0.2, // Small additional delay for smoother reveal
          },
        },
      }}
      onAnimationStart={() => {
        // Trigger sound when animation actually starts
        setTimeout(() => {
          handleItemReveal(idx, tally.is_eliminated);
        }, 400); // Delay sound to sync with visual reveal
      }}
      className={`flex justify-center gap-[.6875rem] 2xl:gap-1 items-center ${tally.is_eliminated ? "opacity-50" : ""}`}
    >
      {/* Rest of your existing content remains the same */}
      <div
        className={`${cn(`${episodeId ? "!h-[6rem]  !w-[12.8125rem]" : "h-[3.125rem] w-[7.8125rem]"} gap-3  grid grid-cols-[1fr_3fr] 2xl:grid-cols-[1fr_2fr]  bg-[#1C0240] 2xl:h-[3.8rem] p-2 border-[.0531rem] border-opacity-55 border-[${borderArray[idx]}] rounded-[.4594rem]`)} `}
      >
        {/* <div className="shrink-0">
          <Image
            alt=""
            src={tally?.contestant_photo_url??"/images/userImage.png"}
            width={18}
            height={18}
            className={`rounded-full shrink-0 ${episodeId ? "w-[80px] h-[60px]" : "2xl:w-[60px] 2xl:h-[30px]"} `}
          />
        </div> */}
        <div className={`${cn(` flex flex-col`)}`}>
          <p
            className={`text-3xl font-gilroyMedium truncate font-normal text-white`}
          >
            {tally.name?.split(" ")[0]}
          </p>
          <p className="text-3xl font-gilroyMedium font-normal text-white">
              {`₦${addCommasToNumber(Number(tally?.actual_balance || 0))}`}
          </p>
        </div>
      </div>
      <div className="">
        <StageTallyCard
          text={
            tally.is_eliminated
              ? "ELIMINATED"
              : tallyArray[idx]
          }
          fontSize={40}
          className={`font-lucky text-center ${episodeId ? "w-full h-[120px]" : "2xl:w-[700px] 2xl:h-[90px]"} `}
          color="#fff"
          // amount={`N${addCommasToNumber(Number(Math.ceil(Number(tally?.actual_balance) / 1000) * 1000)) ?? 0}`}
          amount={`N${addCommasToNumber(Number(tally?.actual_balance)) ?? 0}`}
          badgeColor={
            tally.is_eliminated ? "#760F1B" : "#035D2E"
          }
          backgroundGradient={{
            endColor: tally.is_eliminated
              ? "#980306"
              : "#03984A",
            startColor: tally.is_eliminated
              ? "#FE8E8E"
              : "#8EFE9B",
          }}
          gradientId={`gradient-${idx}-${tally.id}`}
        />
      </div>
    </motion.div>
  ))}
</motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="w-full max-w-[35rem] lg:max-w-[46.5rem] 2xl:max-w-[80rem] mt-2">
            <HustleBottomCard inline={true} />
          </div> */}
        </div>

    
        <div>
          <HustleSideBar showHustlerCard={true} eliminated={eliminationCount} />
        </div>
      </div>
    </div>
  );
};

export default HustleBoardStageTallyPage;