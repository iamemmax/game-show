"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button, ErrorModal } from "@/components/core";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import NumberCardContainer from "@/app/shared/NumberContainer";
import { motion } from "framer-motion";
import { tokenStorage } from "@/utils/auth";
import { useStageOnePickNumber } from "./api/stage1/stageOnePickNumber";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { useGetAllHustleNumbers } from "./api/stage1/getAllHustlePicks";
import HustleBottomCard from "./components/hustle/HustleBottomCard";
import HustleSideBar from "./components/hustle/HustleSideBar";
import Logo from "@/app/icons/Logo";
import HustleStages from "./components/hustle/HustleStages";
import PrizeCard from "@/app/shared/PrizeCard";
import { MqttProvider, useMqttContext } from "@/contexts/MqttContext";
import { ContestantDetails } from "@/types/types";

interface Props {
  onNext: () => void;
}

// Create a wrapper component that uses MQTT context
const Stage1WithMqtt = (props: Props) => {
  try {
    // Try to use the MQTT context
    const mqttContext = useMqttContext();
    return <Stage1Inner {...props} mqttContext={mqttContext} />;
  } catch (error) {
    // If MQTT context is not available, wrap with MqttProvider
    return (
      <MqttProvider>
        <Stage1Inner {...props} mqttContext={null} />
      </MqttProvider>
    );
  }
};

// Inner component that receives MQTT context as a prop
interface Stage1InnerProps extends Props {
  mqttContext: ReturnType<typeof useMqttContext> | null;
}

// Define an extended type for the user that includes game_episode
interface ExtendedContestantDetails extends ContestantDetails {
  game_episode?: number;
}

const Stage1Inner = ({ onNext, mqttContext }: Stage1InnerProps) => {
  // Type the user properly
  const user = tokenStorage.getUser() as ExtendedContestantDetails | null;
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();

  // Use provided MQTT context or get it directly
  const mqtt = mqttContext || (() => {
    try {
      return useMqttContext();
    } catch (error) {
      // Return a mock MQTT context if real one is not available
      return {
        connectionStatus: 'Disconnected' as const,
        messages: {},
        subscribe: () => {},
        publish: () => {},
      };
    }
  })();

  const { connectionStatus, messages, subscribe, publish } = mqtt;

  // Explicitly type the state with number[]
  const [selectedNumbers, setSelectedNumbers] = useState<Array<number>>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [autoPicked, setAutoPicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data, refetch } = useGetAllHustleNumbers(user?.game_episode as number);

  // Subscribe to MQTT topics when component mounts
  useEffect(() => {
    if (connectionStatus === 'Connected') {
      // Subscribe to number picks topic
      subscribe('game/hustle_picks');
      // Subscribe to timer updates
      subscribe('game/timer');
      
    }
  }, [connectionStatus, subscribe]);

  // Process incoming MQTT messages
  useEffect(() => {
    // Handle hustle picks updates
    if (messages['game/hustle_picks']) {
      try {
        const picksData = JSON.parse(messages['game/hustle_picks']);
        
        // Trigger a refetch of all hustle numbers to get the latest data
        refetch();
      } catch (error) {
        console.error('Error parsing hustle picks data:', error);
      }
    }
   
    
    // Handle timer updates
    if (messages['game/timer']) {
      try {
        const timerData = JSON.parse(messages['game/timer']);
        
        if (timerData.stage === 'hustle_picks' && timerData.timeLeft !== undefined) {
          setTimeLeft(timerData.timeLeft);
        }
      } catch (error) {
        console.error('Error parsing timer data:', error);
      }
    }
  }, [messages, refetch]);

  // Function to send picked numbers to backend
  const { mutate: handleStageOnePickNumber } = useStageOnePickNumber();

  const sendPickedNumbers = async (num: number) => {
    if (!user?.contestant_id) return;

    handleStageOnePickNumber(
      {
        contestant_id: user.contestant_id,
        picks: num,
        episode_id: user.game_episode || 1,
      },
      {
        onSuccess: (data) => {
          // Publish the pick to MQTT so other clients get updated immediately
          if (connectionStatus === 'Connected') {
            const pickPayload = JSON.stringify({
              contestant_id: user.contestant_id,
              pick: num,
              action: selectedNumbers.includes(num) ? 'remove' : 'add',
              timestamp: new Date().toISOString()
            });
            
            publish('game/hustle_picks', pickPayload);
          }
        },
        onError: (error) => {
          const errorMessage = formatAxiosErrorMessage(error as AxiosError);
          openErrorModalWithMessage(String(errorMessage));
        },
      }
    );
  };

  // Load user's previously picked numbers on mount
  useEffect(() => {
    if (user?.contestant_id && data?.data) {
      const userPicks = data.data.find(
        (contestant) => contestant.contestant_id === user.contestant_id
      );
      
      if (userPicks && userPicks.picks && userPicks.picks.length > 0) {
        console.log("Found user's previous picks:", userPicks.picks);
        setSelectedNumbers(userPicks.picks);
        setAutoPicked(true);
      }
    }
  }, [user?.contestant_id, data?.data]);

  // Get all numbers that are already picked by other contestants
  const getDisabledNumbers = () => {
    const currentContestantId = user?.contestant_id;
    return data?.data
      .filter((contestant) => contestant.contestant_id !== currentContestantId)
      .flatMap((contestant) => contestant.picks);
  };

  const isNumberDisabled = (num: number): boolean => {
    // If time has elapsed, all numbers are disabled except already selected ones
    if (timeLeft <= 0) {
      return !selectedNumbers.includes(num);
    }
    
    const disabledNumbers: Array<number> = getDisabledNumbers() || [];
    return disabledNumbers.includes(num);
  };

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeLeft(0); // Ensure timer stops at 0
      if (!autoPicked && selectedNumbers.length < 5) {
        autoSelectRemainingNumbers();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1)); // Prevent negative values
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Handle number click
  const handleNumberClick = async (num: number): Promise<void> => {
    // Allow clicking own selections even if time elapsed
    if (timeLeft <= 0 && !selectedNumbers.includes(num)) return;
    if (isNumberDisabled(num)) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      const newSelectedNumbers = selectedNumbers?.includes(num)
        ? selectedNumbers.filter((n) => n !== num)
        : selectedNumbers.length < 5
          ? [...selectedNumbers, num]
          : selectedNumbers;

      if (JSON.stringify(newSelectedNumbers) !== JSON.stringify(selectedNumbers)) {
        // First update local state for immediate UI feedback
        setSelectedNumbers(newSelectedNumbers);
        
        // Then send to backend
        await sendPickedNumbers(num);
      }
    } catch (error) {
      console.error("Error updating picks:", error);
      // Revert to previous state if there was an error
      const errorMessage = formatAxiosErrorMessage(error as AxiosError);
      openErrorModalWithMessage(String(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const isSelected = (num: number): boolean => selectedNumbers.includes(num);

  // Automatically select remaining numbers
  const autoSelectRemainingNumbers = async (): Promise<void> => {
    const disabledNumbers = getDisabledNumbers();
    const availableNumbers: Array<number> = Array.from(
      { length: 49 },
      (_, i) => i + 1
    ).filter(
      (num: number) =>
        !selectedNumbers.includes(num) && !disabledNumbers?.includes(num)
    );

    const shuffled: Array<number> = availableNumbers.sort(
      () => 0.5 - Math.random()
    );
    const numbersToAdd: Array<number> = shuffled.slice(
      0,
      5 - selectedNumbers.length
    );
    const newSelectedNumbers: Array<number> = [
      ...selectedNumbers,
      ...numbersToAdd,
    ];

    setSelectedNumbers(newSelectedNumbers);
    setAutoPicked(true);
    
    // Send each auto-selected number to the backend and publish to MQTT
    for (const num of numbersToAdd) {
      await sendPickedNumbers(num);
    }
    
    // Publish auto-pick completion event
    if (user?.contestant_id) {
      const autoPickPayload = JSON.stringify({
        contestant_id: user.contestant_id,
        auto_picked: true,
        picks: newSelectedNumbers,
        timestamp: new Date().toISOString()
      });
      
      publish('game/hustle_picks/auto', autoPickPayload);
    }
  };

  // Save selected numbers to localStorage when they change
  useEffect(() => {
    if (user?.contestant_id) {
      if (selectedNumbers.length > 0) {
        // Save to localStorage as backup
        localStorage.setItem(
          `user_picks_${user.contestant_id}`, 
          JSON.stringify(selectedNumbers)
        );
      } else {
        // Remove from localStorage if no numbers are selected
        localStorage.removeItem(`user_picks_${user.contestant_id}`);
      }
      
      // Update local data representation
      if (data?.data) {
        const updatedPicks = data.data.map((contestant) => {
          if (contestant.contestant_id === user.contestant_id) {
            return {
              ...contestant,
              picks: selectedNumbers,
            };
          }
          return contestant;
        });
        // Here you would typically save this to your backend
      }
    }
  }, [selectedNumbers, user?.contestant_id, data?.data]);

  // MQTT connection status indicator
  const renderMqttStatus = () => {
    let statusColor = "bg-red-500";
    let statusText = "Disconnected";
    
    if (connectionStatus === 'Connected') {
      statusColor = "bg-green-500";
      statusText = "Connected";
    } else if (connectionStatus === 'Reconnecting') {
      statusColor = "bg-yellow-500";
      statusText = "Reconnecting";
    }
    
    return (
      <div className="flex items-center gap-2 absolute top-2 right-2">
        <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
        <span className="text-xs text-white">{statusText}</span>
      </div>
    );
  };

  return (

    <>
    
   



      <div className="grid grid-cols-[1fr_5fr_1fr] gap-3 h-full ">
          {/* Left Sidebar */}
          <div className="flex flex-col justify-between">
            <div className="flex justify-center items-center h-3.5 w-full mt-8">
              <Logo />
            </div>
            <div>
              <HustleStages />
            </div>
            <div className=""></div>
         
          </div>
    
          <div className="overflow-y-auto">
      <div className="w-full h-[100px]  flex items-center justify-center">
        <HeaderTitleContainer
          backgroundColor="#791192"
          color="#ed99ff"
          text="Pick-Pad"
          textGradientEnd="#8E17AA"
          textGradientStart="#8E17AA"
          borderGradientStart="#f712fc"
          borderGradientEnd="#e151fe"
          fontSize={45}
          fontFamily="Verdana"
          textStrokeColor="#a219c1"
          textStrokeWidth={4.4}
        />
      </div>

      <div className="flex justify-center  flex-col items-center max-lg:px-3">
        {/* Selection Grid */}
        <div className="w-full py-[1rem] max-xl:max-w-[65rem] 2xl:py-[3rem] max-w-[56.25rem] rounded-[.875rem] px-[2rem] 2xl:px-[3rem] bg-[#13051E] -mt-3 relative overflow-hidden">
          {/* MQTT Status Indicator */}
          {renderMqttStatus()}
          
          {/* Animated border */}
          <div className="absolute inset-0">
            <motion.div
              className="w-[200%] h-[200%] absolute -left-1/2 -top-1/2"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%,
                  transparent 0deg,
                  #d91fff 10deg,
                  #d91fff 60deg,
                  #00ffff 90deg,
                  #00ffff 140deg,
                  transparent 180deg,
                  transparent 360deg
                )`,
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Content container */}
          <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
          <div className="relative">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-[2.125rem] font-extrabold outline-text text-black">
                  Stage 1: Hustle Kick-off {user?.contestant_id}
                </h2>
              </div>
              <div>
                <h2 className="font-extrabold text-[2.75rem] text-white">
                 
                </h2>



                <div className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 border-[2px] border-[#C76000] rounded-xl px-3 py-1.5 shadow-md">
                  <span 
                    className="text-[20px] font-extrabold font-verdana text-white"
                    style={{ 
                      WebkitTextStroke: "1.5px #C76000",
                      textShadow: "0px 1px 2px rgba(199, 96, 0, 0.5)"
                    }}
                  >
                    {`0:${Math.max(0, timeLeft).toString().padStart(2, "0")}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap max-md:gap-[18px] gap-[14px] 2xl:gap-[.875rem] max-xl:gap-y-5 2xl:gap-y-8  2xl:mt-8">
              {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className={`cursor-pointer transition-transform ${
                    timeLeft <= 0
                      ? "cursor-not-allowed"
                      : isNumberDisabled(num)
                        ? "opacity-50 cursor-not-allowed"
                        : selectedNumbers.length >= 5 &&
                            !selectedNumbers.includes(num)
                          ? "opacity-50 cursor-not-allowed"
                          : isLoading
                            ? "cursor-wait"
                            : "hover:scale-105"
                  }`}
                >
                  <NumberCardContainer
                    text={String(num)}
                    textColor={isSelected(num) ? "#fff" : "#F2C94C"}
                    className="max-xl:w-[54px] max-xl:h-[54px]"
                    primaryGradientEndColor={
                      isSelected(num) ? "#FF00FF" : "#3C1272"
                    }
                    backgroundColor={
                      isSelected(num)
                        ? "#FEC124"
                        : timeLeft <= 0
                          ? "#666"
                          : isNumberDisabled(num)
                            ? "#666"
                            : selectedNumbers.length >= 5 &&
                                !selectedNumbers.includes(num)
                              ? "#666"
                              : "black"
                    }
                    active={isSelected(num)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Selected Numbers Display */}
        <div className="flex justify-between items-center mt-4">
          <div
            className="flex items-center gap-[2.125rem] border-[5px] border-[#CE64FF]
        py-[1rem] 2xl:px-[2.6875rem]  max-w-[38.5rem] rounded-[.875rem] px-[2rem] bg-[#13051E] mt-2 xl:mt-7"
          >
            <div className="flex gap-x-3 items-center">
              <div className="relative h-[3rem] w-[3rem] bg-[#bf7222] border-[5px] border-[#dba531] rounded-full overflow-hidden">
                <Image
                  alt="User avatar"
                  src="/images/userImage.png"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-base text-white outline-text-white">Demola</p>
            </div>

            <div className="flex divide-x-2 divide-[#4B1874]">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="px-2">
                  <NumberCardContainer
                    text={selectedNumbers[i] ? String(selectedNumbers[i]) : ""}
                    textColor="#F2C94C"
                    width={55}
                    height={45}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="fixed top-0 right-0 m-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          )}

          <Button
            className="bg-pink-950"
            onClick={onNext}
            disabled={isLoading || selectedNumbers.length !== 5}
          >
            Proceed
          </Button>
        </div>
      </div>

      <ErrorModal
        isErrorModalOpen={isErrorModalOpen}
        setErrorModalState={() => {
          setErrorModalState(false);
        }}
        subheading={
          errorModalMessage || "Please check your inputs and try again."
        }
      ></ErrorModal>
    </div>
       
    
          {/* Right Sidebar */}
          <div>
            <HustleSideBar showJackpot={false} showHustlerCard={false}  showEmptyCard={true}/>
          </div>
        </div>
    </>
  );
};

// Export the wrapper component
export default Stage1WithMqtt;
  
