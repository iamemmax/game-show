import Logo from "@/app/icons/Logo";
import GradientButton from "@/app/shared/GradientButton";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import NumberCardContainer from "@/app/shared/NumberContainer";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { GlowyStrokeText, Button } from "@/components/core";
import { addCommasToNumber } from "@/utils";
import { cn } from "@/utils/classNames";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
// import FastestFingerResult from "../hustle/FastestFingerResult";
import HustleSideBar from "../hustle/HustleSideBar";
import HustleStages from "../hustle/HustleStages";
import HustleCard from "@/app/shared/HustleCard";
import { useMQTT } from "@/hooks/useMqttService";
import { tokenStorage } from "@/utils/auth";
import PickCardContainer from "@/app/shared/PickCardContainer";
import { useErrorModalState } from "@/hooks";

// Define card color schemes
const CARD_STYLES = [
  {
    backgroundColor: "#13051E",
    rayColor: "#D91FFF",
    innerCircleColor: "#2D0A3E",
    textColor: "#D5B9FF",
    cornerColor: "#D91FFF",  // Same as rayColor
    fontFamily: "gilroyBold",
    fontSize: 46,
    labelBackgroundColor: "#791192"
  },
  {
    backgroundColor: "#051E13",
    rayColor: "#1FD977",
    innerCircleColor: "#0A3E2D",
    textColor: "#B9FFD5",
    cornerColor: "#1FD977",  // Same as rayColor
    fontFamily: "gilroyHeavy",
    fontSize: 48,
    labelBackgroundColor: "#0A3E2D"
  },
  {
    backgroundColor: "#1E1305",
    rayColor: "#FF7D1F",
    innerCircleColor: "#3E2D0A",
    textColor: "#FFD5B9",
    cornerColor: "#FF7D1F",  // Same as rayColor
    fontFamily: "verdana",
    fontSize: 44,
    labelBackgroundColor: "#3E2D0A"
  },
  {
    backgroundColor: "#051319",
    rayColor: "#1FB8FF",
    innerCircleColor: "#0A2D3E",
    textColor: "#B9E8FF",
    cornerColor: "#1FB8FF",  // Same as rayColor
    fontFamily: "gilroyMedium",
    fontSize: 50,
    labelBackgroundColor: "#0A2D3E"
  },
  {
    backgroundColor: "#190513",
    rayColor: "#FF1F77",
    innerCircleColor: "#3E0A2D",
    textColor: "#FFB9D5",
    cornerColor: "#FF1F77",  // Same as rayColor
    fontFamily: "gilroyBold",
    fontSize: 46,
    labelBackgroundColor: "#3E0A2D"
  },
  {
    backgroundColor: "#131905",
    rayColor: "#B8FF1F",
    innerCircleColor: "#2D3E0A",
    textColor: "#E8FFB9",
    cornerColor: "#B8FF1F",  // Same as rayColor
    fontFamily: "verdana",
    fontSize: 44,
    labelBackgroundColor: "#2D3E0A"
  },
  {
    backgroundColor: "#0D0D1A",
    rayColor: "#6B1FFF",
    innerCircleColor: "#1A0A3E",
    textColor: "#C5B9FF",
    cornerColor: "#6B1FFF",  // Same as rayColor
    fontFamily: "gilroyHeavy",
    fontSize: 48,
    labelBackgroundColor: "#1A0A3E"
  },
  {
    backgroundColor: "#1A0D0D",
    rayColor: "#FF1F6B",
    innerCircleColor: "#3E0A1A",
    textColor: "#FFB9C5",
    cornerColor: "#FF1F6B",  // Same as rayColor
    fontFamily: "gilroyMedium",
    fontSize: 50,
    labelBackgroundColor: "#3E0A1A"
  },
  {
    backgroundColor: "#0D1A0D",
    rayColor: "#1FFF6B",
    innerCircleColor: "#0A3E1A",
    textColor: "#B9FFC5",
    cornerColor: "#1FFF6B",  // Same as rayColor
    fontFamily: "verdana",
    fontSize: 44,
    labelBackgroundColor: "#0A3E1A"
  },
  {
    backgroundColor: "#1A1A0D",
    rayColor: "#FFD700",
    innerCircleColor: "#3E3E0A",
    textColor: "#FFFCB9",
    cornerColor: "#FFD700",  // Same as rayColor
    fontFamily: "gilroyBold",
    fontSize: 46,
    labelBackgroundColor: "#3E3E0A"
  }
];

// Pass card style
const PASS_CARD_STYLE = {
  backgroundColor: "#FF7D01",
  rayColor: "#FFD700",
  innerCircleColor: "#FF4500",
  textColor: "#FFFFFF",
  cornerColor: "#FFD700",  // Same as rayColor
  fontFamily: "gilroyHeavy",
  fontSize: 42,
  textStrokeWidth: 1.5,
  textStrokeColor: "#000000",
  labelBackgroundColor: "#8E17AA"
};



// First, let's define a proper interface for our card objects
interface Card {
  type: string;
  revealed: boolean;
  style: {
    backgroundColor: string;
    rayColor: string;
    innerCircleColor: string;
    textColor: string;
    cornerColor: string;
    fontFamily: string;
    fontSize: number;
    labelBackgroundColor: string;
    textStrokeWidth?: number;
    textStrokeColor?: string;
  };
  contestant_id: number | null;
}

const Stage3CardSelection = () => {
  const user = tokenStorage.getUser();
  const { isConnected, sendMessage, onMessage } = useMQTT();
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  
  // Create an array of 24 cards (23 duds and 1 pass)
  const [cards, setCards] = useState<Card[]>(() => {
    // Create array with 23 duds and 1 pass
    const cardArray = Array(24).fill("DUD");
    
    // Randomly place the PASS card
    const passIndex = Math.floor(Math.random() * 23);
    cardArray[passIndex] = "PASS";
    
    // Create objects with revealed state and random style
    return cardArray.map((type) => {
      // Assign a random style to each DUD card
      const styleIndex = Math.floor(Math.random() * CARD_STYLES.length);
      
      return {
        type,
        revealed: false,
        style: type === "PASS" ? PASS_CARD_STYLE : CARD_STYLES[styleIndex],
        contestant_id: null, // Track which contestant revealed this card
      };
    });
  });
  
  // Track if the pass card has been found
  const [passFound, setPassFound] = useState(false);
  
  // Track number of attempts
  const [attempts, setAttempts] = useState(0);
  
  // Track if the PASS card is revealed but not yet "found" (for animation purposes)
  const [passRevealed, setPassRevealed] = useState(false);
  
  // Track recently updated cards for visual feedback
  const [recentlyUpdated, setRecentlyUpdated] = useState<number[]>([]);
  
  // Track if we're currently sending a selection
  const [isSending, setIsSending] = useState(false);

  // Add state to track which card is currently flipping
  const [flippingCard, setFlippingCard] = useState<number | null>(null);

  // Add a state to track contestant names
  const [contestantNames, setContestantNames] = useState<Record<number, string>>({});

  // Add useEffect to fetch contestant names when component mounts
  useEffect(() => {
    // Function to fetch contestant names
    const fetchContestantNames = async () => {
      if (!user?.game_episode) return;
      
      try {
        // Use the existing API to get game contestants
        const response = await fetch(`/api/accounts/game_contestants/${user.game_episode}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.status === "success" && Array.isArray(data.data)) {
          // Create a map of contestant_id to name
          const namesMap: Record<number, string> = {};
          data.data.forEach((contestant: any) => {
            if (contestant.id && contestant.name) {
              namesMap[contestant.id] = contestant.name;
            }
          });
          
          setContestantNames(namesMap);
        }
      } catch (error) {
        // console.error("Failed to fetch contestant names:", error);
      }
    };
    
    fetchContestantNames();
  }, [user?.game_episode]);

  // Handle MQTT messages for real-time updates
  useEffect(() => {
    if (isConnected) {
      const handler = (receivedMessage: any) => {
        console.log("Stage3 received message:", receivedMessage);
        
        // Handle card selection events
        if (receivedMessage?.event === "stage3_card_selection") {
          const { contestant_id, card_index, card_type, contestant_name } = receivedMessage.payload;
          
          // Don't process our own selections (they're handled locally)
          if (contestant_id === user?.contestant_id) return;
          
          // Store contestant name if provided and not already known
          if (contestant_name && !contestantNames[contestant_id]) {
            setContestantNames(prev => ({
              ...prev,
              [contestant_id]: contestant_name
            }));
          }
          
          // Update the card state
          setCards(prevCards => {
            const newCards = [...prevCards];
            newCards[card_index] = {
              ...newCards[card_index],
              revealed: true,
              type: card_type,
              contestant_id: contestant_id
            };
            return newCards;
          });
          
          // Add visual feedback for recently updated cards
          setRecentlyUpdated(prev => [...prev, card_index]);
          
          // Remove from recently updated after animation
          setTimeout(() => {
            setRecentlyUpdated(prev => prev.filter(idx => idx !== card_index));
          }, 1000);
          
          // If PASS was found by someone else
          if (card_type === "PASS") {
            // setPassRevealed(true);
            setTimeout(() => {
              setPassFound(true);
            }, 1000);
          }
        }
        
        // Handle game progression events
        if (receivedMessage?.event === "game_s3_complete") {
          // Handle stage completion (could navigate to next stage)
          console.log("Stage 3 complete");
        }
      };
      
      // Register the message handler
      onMessage(handler);
      
      // Clean up function to remove the handler when component unmounts
      return () => {
        onMessage(null);
      };
    }
  }, [isConnected, onMessage, user?.contestant_id, contestantNames]);

  // Function to send card selection to other contestants
  const sendCardSelection = async (index: number, type: string) => {
    if (!isConnected || !user?.contestant_id) {
      openErrorModalWithMessage("Not connected to game server");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Prepare payload for MQTT
      const payload = {
        event: "stage3_card_selection",
        payload: {
          game_episode: user?.game_episode,
          contestant_id: user?.contestant_id,
          contestant_name: user?.name, // Include contestant name in payload
          card_index: index,
          card_type: type
        }
      };
      
      // Send the message
      await sendMessage(payload, "stage3_card_selection");
      console.log("Card selection sent:", payload);
    } catch (error) {
      console.error("Failed to send card selection:", error);
      openErrorModalWithMessage("Failed to send selection");
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle card click - optimize animation timing for maximum speed
  const handleCardClick = (index: number) => {
    // Don't allow clicking if card is already revealed
    if (cards[index].revealed) return;
    
    // Don't allow clicking if pass is already found
    if (passFound) return;
    
    // Don't allow clicking if we're currently sending a selection
    if (isSending) return;
    
    // Don't allow clicking if a card is currently flipping
    if (flippingCard !== null) return;
    
    // Set the current card as flipping
    setFlippingCard(index);
    
    // Increment attempts
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Check if pass was found
    if (cards[index].type === "PASS") {
      // Only allow finding the PASS if they've selected at least 10 cards
      if (newAttempts >= 10) {
        // After flip animation completes, reveal the card - ultra fast 150ms
        setTimeout(() => {
          // Create a new array with the clicked card revealed
          const newCards = [...cards];
          newCards[index].revealed = true;
          newCards[index].contestant_id = user?.contestant_id || null;
          setCards(newCards);
          
          setPassRevealed(true);
          // Send the selection to other contestants
          sendCardSelection(index, "PASS");
          
          // Reset flipping state
          setFlippingCard(null);
          
          // Set a small delay before showing the pass found message/animation - reduced to 100ms
          setTimeout(() => {
            setPassFound(true);
          }, 100);
        }, 150); // Wait for flip animation to complete - ultra fast 150ms
      } else {
        // After flip animation completes, reveal as DUD - ultra fast 150ms
        setTimeout(() => {
          // If they find the PASS too early, treat it as a DUD
          const newCards = [...cards];
          newCards[index] = {
            ...newCards[index],
            type: "DUD", // Override the type to DUD
            revealed: true,
            contestant_id: user?.contestant_id || null,
            style: newCards[index].style
          };
          setCards(newCards);
          
          // Send the selection to other contestants (as a DUD)
          sendCardSelection(index, "DUD");
          
          // Reset flipping state
          setFlippingCard(null);
        }, 150); // Wait for flip animation to complete - ultra fast 150ms
      }
    } else {
      // After flip animation completes, reveal the DUD card - ultra fast 150ms
      setTimeout(() => {
        // Create a new array with the clicked card revealed
        const newCards = [...cards];
        newCards[index].revealed = true;
        newCards[index].contestant_id = user?.contestant_id || null;
        setCards(newCards);
        
        // Send the DUD selection to other contestants
        sendCardSelection(index, "DUD");
        
        // Reset flipping state
        setFlippingCard(null);
      }, 150); // Wait for flip animation to complete - ultra fast 150ms
    }
  };

  // Add a connection status indicator
  const ConnectionStatus = () => (
    <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
      <div
        className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
      ></div>
      <span className="text-xs text-gray-300">
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
      {/* Connection status indicator */}
      <ConnectionStatus />
      
      {/* Left Sidebar */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-center items-center h-3.5 w-full mt-8">
          <Logo />
        </div>
        <div>
          <HustleStages activeStage={3} />
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

          <div className="relative w-full py-[2rem] 2xl:py-[2.5rem] max-xl:max-w-[46.5rem] 2xl:max-w-[65rem] px-6 -mt-3 rounded-[.875rem] 2xl:px-[3rem] overflow-hidden">
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

            {/* Content container - increased border width from 5px to 8px for bolder appearance */}
            <div className="absolute inset-[8px] bg-[#13051E] rounded-[.675rem]" />
            <div className="relative">
              <div className="flex justify-between items-center ">
                <div className="flex justify-between items-center flex-col w-full">
                  <GlowyStrokeText
                    strokeWidth={2}
                    strokeColor="#D91FFF"
                    glowColor="#13051E"
                    glowIntensity="low"
                    textclassName="text-[2.125rem] font-extrabold font-gilroyBold"
                    fillColor="#000"
                  >
                    Stage 3: Showdown for pass
                  </GlowyStrokeText>
                  
                  {/* Add attempts counter */}
                  <div className="text-white ">
                        <span className="font-gilroyBold text-[#D5B9FF] text-sm">Select business elements you want for your hustle </span>
                   
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-y-1 ">
                {cards.map((card, index) => {
                  // Get the appropriate style based on card state
                  const style = card.revealed && card.type === "PASS" 
                    ? PASS_CARD_STYLE 
                    : card.style;
                  
                  // Check if this card was recently updated
                  const isRecentlyUpdated = recentlyUpdated.includes(index);
                  
                  // Check if this card is currently flipping
                  const isFlipping = flippingCard === index;
                  
                  // Get contestant name if available
                  const contestantName = card.contestant_id 
                    ? (card.contestant_id === user?.contestant_id 
                        ? user?.name?.toUpperCase() ??"" // Use uppercase for better visibility
                        : contestantNames[card.contestant_id]?.toUpperCase() || "CONTESTANT") 
                    : "";
                  
                  return (
                    <div 
                      key={index} 
                      onClick={() => handleCardClick(index)}
                      className={cn(
                        "cursor-pointer transition-transform  perspective-[1000px]",
                        card.revealed || passFound ? "cursor-default" : "",
                        isSending || isFlipping ? "cursor-wait" : "",
                        isRecentlyUpdated ? "animate-pulse" : ""
                      )}
                      style={{ perspective: "1000px" }}
                    >
                     <p className="text-white">   {card?.revealed}</p>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
                          initial={isFlipping ? { rotateY: 0 } : false}
                          animate={isFlipping ? { rotateY: 180 } : {}}
                          exit={{ rotateY: 180 }}
                          transition={{ duration: 0.15, ease: "easeOut" }} // Ultra-fast 150ms with easeOut for snappier feel
                          style={{ 
                            transformStyle: "preserve-3d",
                            backfaceVisibility: "hidden"
                          }}
                          className="relative"
                        >
                          <PickCardContainer
                            backgroundColor={style.backgroundColor}
                            text={card.revealed || isFlipping ? card.type : "?"}
                            width="108px"
                            height="100px"
                            
                            rayColor={style.rayColor}
                            innerCircleColor={style.innerCircleColor}
                            textColor={style.textColor}
                            cornerColor={style.cornerColor}
                            fontFamily={style.fontFamily}
                            fontSize={style.fontSize}
                            textStrokeWidth={2}
                            textStrokeColor={"#D91FFF"}
                            containerLabel={card.revealed ? contestantName : ""}
                            labelBackgroundColor={card?.revealed ? style.labelBackgroundColor : "transparent"}
                            labelColor="#FFFFFF"
                            labelFontSize={20} // Smaller font size for better fit
                            labelPadding={34} // Slightly smaller padding for better proportions
                            className={cn(
                              "transition-transform  p-0  duration-300 ease-in-out",
                              isRecentlyUpdated ? "ring-2 ring-white" : "",
                              isFlipping ? "shadow-lg" : ""
                            )}

                            textClassName="font-extrabold  text-[2rem] font-gilroyBold"
                            labelClassName={`${card?.revealed ? "font-bold tracking-wide" : "hidden"}`} // Add letter spacing for better readability
                            // showPatternLabel={}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
              
             
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div>
        <HustleSideBar
          showEmptyCard={false}
          showHustlerCard={true}
          eliminated={4}
        />
      </div>
      
      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#13051E] border-2 border-[#D91FFF] p-6 rounded-lg max-w-md">
            <h3 className="text-white text-xl font-bold mb-4">Error</h3>
            <p className="text-white mb-4">{errorModalMessage}</p>
            <Button 
              onClick={() => setErrorModalState(false)}
              className="bg-[#D91FFF] text-white hover:bg-[#B017D7]"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stage3CardSelection;
