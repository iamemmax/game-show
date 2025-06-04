import Logo from "@/app/icons/Logo";
import HeaderTitleContainer from "@/app/shared/HeaderContainer";
import Salary4LifeTrophy from "@/app/shared/SalaryForLifeTrophy";
import { GlowyStrokeText, Button } from "@/components/core";
import { cn } from "@/utils/classNames";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import HustleSideBar from "../hustle/HustleSideBar";
import HustleStages from "../hustle/HustleStages";
import { useMQTT } from "@/hooks/useMqttService";
import { tokenStorage } from "@/utils/auth";
import PickCardContainer from "@/app/shared/PickCardContainer";
import { useErrorModalState } from "@/hooks";
import { useGetGameContestants } from "@/app/admin/misc/api";
import { Card, CARD_STYLES, PASS_CARD_STYLE } from "./CardStyles";


const Stage3CardSelection = () => {
  const user = tokenStorage.getUser();
  const { isConnected, sendMessage, onMessage } = useMQTT();
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  
  // Add a constant for the minimum number of cards to reveal before PASS can be found
  const MIN_CARDS_BEFORE_PASS = 15;

  // Define card types as constants to avoid typos
  const CARD_TYPES = {
    DUD: "DUD",
    PASS: "PASS"
  };

  // Create an array of 24 cards with GUARANTEED one PASS card
  const [cards, setCards] = useState<Card[]>(() => {
    // First create 23 DUD cards
    const cardArray = Array(23).fill(null).map(() => ({
      type: CARD_TYPES.DUD,
      originalType: CARD_TYPES.DUD,
      revealed: false,
      style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
      contestant_id: null
    }));
    
    // Then add exactly one PASS card at a random position
    const passIndex = Math.floor(Math.random() * 24);
    const passCard = {
      type: CARD_TYPES.PASS,
      originalType: CARD_TYPES.PASS,
      revealed: false,
      style: CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)],
      contestant_id: null
    };
    
    // Insert the PASS card at the random position
    cardArray.splice(passIndex, 0, passCard);
    
    // If we somehow ended up with more than 24 cards, trim the array
    if (cardArray.length > 24) {
      cardArray.length = 24;
    }
    
    console.log("Initializing cards with PASS at index:", passIndex, "Total cards:", cardArray.length);
    console.log("PASS card count:", cardArray.filter(card => card.originalType === CARD_TYPES.PASS).length);
    
    return cardArray;
  });

  // Debug log to verify PASS card is included
  useEffect(() => {
    const passCards = cards.filter(card => card.originalType === CARD_TYPES.PASS);
    console.log("PASS cards count:", passCards.length);
    
    if (passCards.length === 0) {
      console.error("No PASS card found! Regenerating cards...");
      // Force regenerate cards if no PASS card is found
      setCards(prevCards => {
        const newCards = [...prevCards];
        // Ensure at least one card is a PASS
        const randomIndex = Math.floor(Math.random() * 24);
        newCards[randomIndex] = {
          ...newCards[randomIndex],
          type: CARD_TYPES.PASS,
          originalType: CARD_TYPES.PASS
        };
        return newCards;
      });
    } else if (passCards.length > 1) {
      console.error("Multiple PASS cards found! Fixing...");
      // Keep only one PASS card
      setCards(prevCards => {
        const newCards = [...prevCards];
        let foundPass = false;
        
        return newCards.map(card => {
          if (card.originalType === CARD_TYPES.PASS) {
            if (!foundPass) {
              foundPass = true;
              return card;
            } else {
              return {
                ...card,
                type: CARD_TYPES.DUD,
                originalType: CARD_TYPES.DUD
              };
            }
          }
          return card;
        });
      });
    }
  }, []);

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

  // Add state to track all currently flipping cards (not just one)
  const [flippingCards, setFlippingCards] = useState<number[]>([]);

  // Add a state to track contestant names
  const [contestantNames, setContestantNames] = useState<Record<number, string>>({});
  
  // Add state to track who found the PASS card
  const [passFinderName, setPassFinderName] = useState<string>("");
  const [passFinderIsCurrentUser, setPassFinderIsCurrentUser] = useState(false);
  
  // Add a state variable to track the index of the PASS card
  const [passCardIndex, setPassCardIndex] = useState<number>(-1);

  const {data:contestantsData,isLoading:isLoadingContestants} = useGetGameContestants(user?.game_episode as number);

  // Add useEffect to fetch contestant names when component mounts
  useEffect(() => {
    // Function to fetch contestant names
    const fetchContestantNames = async () => {
      if (!user?.game_episode) return;
      
      try {
       
        
        if ( Array.isArray(contestantsData?.data)) {
          // Create a map of contestant_id to name
          const namesMap: Record<number, string> = {};
          contestantsData?.data.forEach((contestant: any) => {
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

  // Add state to track whose turn it is
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true); // Default to true so someone can start

  // Add state to track the other contestant in the showdown
  const [otherContestantId, setOtherContestantId] = useState<number | null>(null);
  const [otherContestantName, setOtherContestantName] = useState<string>("");

  // Add useEffect to determine initial turn
  useEffect(() => {
    if (!user?.contestant_id || !contestantsData?.data) return;
    
    // Find the two contestants in the showdown (should be only 2 left)
    const showdownContestants = contestantsData.data.filter(
      (contestant: any) => contestant.eliminated_stage === null
    );
    
    if (showdownContestants.length === 2) {
      // Find the other contestant
      const otherContestant = showdownContestants.find(
        (contestant: any) => contestant.id !== user.contestant_id
      );
      
      if (otherContestant) {
        setOtherContestantId(otherContestant.id);
        setOtherContestantName(otherContestant.name || "Opponent");
      }
      
      // Determine initial turn - anyone can start
      // We'll use a simple rule: lower contestant ID goes first
      const firstTurnId = Math.min(
        showdownContestants[0].id,
        showdownContestants[1].id
      );
      setCurrentTurn(firstTurnId);
      setIsMyTurn(firstTurnId === user.contestant_id);
      
      console.log("Turn initialized:", {
        firstTurnId,
        myId: user.contestant_id,
        isMyTurn: firstTurnId === user.contestant_id
      });
    }
  }, [contestantsData?.data, user?.contestant_id]);

  // Add a useEffect to ensure otherContestantName is set correctly
  useEffect(() => {
    if (!user?.contestant_id || !contestantsData?.data) return;
    
    // Find the two contestants in the showdown (should be only 2 left)
    const showdownContestants = contestantsData.data.filter(
      (contestant: any) => contestant.eliminated_stage === null
    );
    
    if (showdownContestants.length === 2) {
      // Find the other contestant
      const otherContestant = showdownContestants.find(
        (contestant: any) => contestant.id !== user.contestant_id
      );
      
      if (otherContestant) {
        setOtherContestantId(otherContestant.id);
        setOtherContestantName(otherContestant.name || "Opponent");
        
        // Also add to contestantNames map for consistency
        setContestantNames(prev => ({
          ...prev,
          [otherContestant.id]: otherContestant.name || "Opponent"
        }));
        
      }
    }
  }, [contestantsData?.data, user?.contestant_id]);

  // Custom celebration animation component with ribbons and celebrating person
  const CelebrationAnimation = ({ isVisible, finderName }: { isVisible: boolean, finderName?: string }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Ribbons falling from top */}
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => {
            // Create ribbon properties
            const width = Math.random() * 8 + 4;
            const height = Math.random() * 200 + 100;
            const color = [
              "#FFD700", // Gold
              "#FF6B6B", // Red
              "#4ECDC4", // Teal
              "#FF8C42", // Orange
              "#A78BFA", // Purple
              "#34D399", // Green
              "#F472B6", // Pink
            ][Math.floor(Math.random() * 7)];
            
            // Create wavy motion for ribbons
            const startX = Math.random() * 100;
            const waveAmplitude = Math.random() * 100 + 50;
            const waveSpeed = Math.random() * 2 + 1;
            
            return (
              <motion.div
                key={i}
                className="absolute rounded-sm"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: color,
                  top: `-${height}px`,
                  left: `${startX}%`,
                  transformOrigin: "top center",
                }}
                initial={{ 
                  y: -height, 
                  rotate: 0,
                  scaleY: 1
                }}
                animate={{
                  y: `${window.innerHeight + height}px`,
                  rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
                  x: [
                    0,
                    waveAmplitude,
                    -waveAmplitude,
                    waveAmplitude / 2,
                    -waveAmplitude / 2,
                    0
                  ],
                  scaleY: [1, 0.9, 1.1, 0.95, 1.05, 1]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  ease: "linear",
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  x: {
                    duration: waveSpeed * 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "reverse"
                  },
                  scaleY: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "reverse"
                  }
                }}
              />
            );
          })}
          
          {/* Curly ribbons */}
          {Array.from({ length: 20 }).map((_, i) => {
            const size = Math.random() * 30 + 20;
            const color = [
              "#FFD700", // Gold
              "#FF6B6B", // Red
              "#4ECDC4", // Teal
              "#FF8C42", // Orange
              "#A78BFA", // Purple
              "#34D399", // Green
              "#F472B6", // Pink
            ][Math.floor(Math.random() * 7)];
            
            return (
              <motion.div
                key={`curl-${i}`}
                className="absolute"
                style={{
                  width: size,
                  height: size * 3,
                  borderRadius: "50%",
                  border: `${Math.random() * 3 + 2}px solid ${color}`,
                  borderTopWidth: 0,
                  borderLeftWidth: 0,
                  top: `-${size}px`,
                  left: `${Math.random() * 100}%`,
                }}
                initial={{ y: -size, rotate: 0 }}
                animate={{
                  y: `${window.innerHeight + size}px`,
                  rotate: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
                  x: Math.random() * 300 - 150,
                }}
                transition={{
                  duration: Math.random() * 6 + 4,
                  ease: "linear",
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            );
          })}
        </div>
        
        {/* Celebration content in the center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          {/* Celebrating person instead of trophy */}
          <div className="relative">
            <motion.div
              className="w-48 h-48 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Celebrating person emoji */}
              <span className="text-7xl">🎉</span>
              <span className="text-7xl absolute">🙌</span>
            </motion.div>
            
            {/* Add a separate glow animation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0px 0px 0px rgba(255,215,0,0)", 
                  "0px 0px 30px rgba(255,215,0,0.7)",
                  "0px 0px 0px rgba(255,215,0,0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Decorative ribbons around the celebrating person */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * 360;
              const color = [
                "#FFD700", // Gold
                "#FF6B6B", // Red
                "#4ECDC4", // Teal
                "#FF8C42", // Orange
                "#A78BFA", // Purple
                "#34D399", // Green
                "#F472B6", // Pink
              ][i % 7];
              
              return (
                <motion.div
                  key={`ribbon-${i}`}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: "4px",
                    height: "120px",
                    backgroundColor: color,
                    transformOrigin: "top center",
                    transform: `rotate(${angle}deg) translateX(-50%)`,
                  }}
                  animate={{
                    height: ["120px", "140px", "120px"],
                    rotate: `${angle + 360}deg`,
                  }}
                  transition={{
                    height: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.2,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }
                  }}
                />
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <GlowyStrokeText
                strokeWidth={3}
                strokeColor="black"
                glowColor="#FF7D01"
                glowIntensity="high"
                textclassName="text-[4rem] font-extrabold font-gilroyBold"
                fillColor="#FFFFFF"
              >
                PASS FOUND!
              </GlowyStrokeText>
            </motion.div>
            
            <motion.div
              className="bg-black bg-opacity-70 p-4 rounded-lg mt-4 border-2 border-yellow-400"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <p className="text-white text-xl mb-2">Winner:</p>
              <p className="text-yellow-400 text-3xl font-gilroyBold">
                {passFinderIsCurrentUser ? "YOU!" : passFinderName}
              </p>
              <p className="text-white text-lg mt-4">
                {passFinderIsCurrentUser 
                  ? "Congratulations! You found the PASS card!" 
                  : `${passFinderName} found the PASS card!`}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  // Add this function to create ribbon effects around the PASS card
  const PassCardEffect = ({ isVisible, cardIndex }: { isVisible: boolean, cardIndex: number }) => {
    if (!isVisible || cardIndex < 0) return null;
    
    return (
      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Radiating ribbons from the PASS card */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * 360;
          const color = [
            "#FFD700", // Gold
            "#FFA500", // Orange
            "#FFFF00", // Yellow
          ][i % 3];
          
          // Calculate position based on the card's position in the grid
          const row = Math.floor(cardIndex / 6);
          const col = cardIndex % 6;
          
          // Approximate position calculation (adjust based on your actual layout)
          const left = col * 120 + 60; // Assuming cards are ~120px wide
          const top = row * 120 + 60;  // Assuming cards are ~120px tall
          
          return (
            <motion.div
              key={`pass-ribbon-${i}`}
              className="absolute"
              style={{
                width: "4px",
                height: "0px",
                backgroundColor: color,
                left: `${left}px`,
                top: `${top}px`,
                transformOrigin: "center bottom",
                transform: `rotate(${angle}deg)`,
              }}
              animate={{
                height: ["0px", "150px", "0px"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          );
        })}
        
        {/* Add ribbons that flow from top to bottom over the card */}
        {Array.from({ length: 8 }).map((_, i) => {
          const color = [
            "#FFD700", // Gold
            "#FFA500", // Orange
            "#FFFF00", // Yellow
          ][i % 3];
          
          // Calculate position based on the card's position in the grid
          const row = Math.floor(cardIndex / 6);
          const col = cardIndex % 6;
          
          // Approximate position calculation
          const left = col * 120 + 60 + (Math.random() * 40 - 20); // Add some randomness
          const startTop = row * 120 - 50; // Start above the card
          
          return (
            <motion.div
              key={`flow-ribbon-${i}`}
              className="absolute"
              style={{
                width: "6px",
                height: "30px",
                backgroundColor: color,
                left: `${left}px`,
                top: `${startTop}px`,
                borderRadius: "3px",
              }}
              animate={{
                top: [`${startTop}px`, `${startTop + 200}px`],
                opacity: [0, 1, 0],
                rotate: [0, Math.random() * 180 - 90],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                repeatType: "loop",
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
    );
  };

  // Add a function to check if the PASS card is still available
  const isPassCardAvailable = () => {
    // Check if any card with originalType="PASS" is not yet revealed
    return cards.some(card => card.originalType === CARD_TYPES.PASS && !card.revealed);
  };

  // Add a debug button to reveal the PASS card location (for testing)
  const DebugControls = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    const handleRevealPassLocation = () => {
      const passCardIndex = cards.findIndex(card => card.originalType === CARD_TYPES.PASS);
      if (passCardIndex >= 0) {
        alert(`PASS card is at index ${passCardIndex} (position ${passCardIndex + 1})`);
      } else {
        alert("No PASS card found in the array!");
      }
    };
    
    return (
      <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2">
        <button 
          onClick={() => setIsMyTurn(true)}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Reset Turn (Debug)
        </button>
        <button 
          onClick={handleRevealPassLocation}
          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
        >
          Reveal PASS Location (Debug)
        </button>
      </div>
    );
  };

  // Handle MQTT messages for real-time updates
  useEffect(() => {
    if (!isConnected) return;
    
    const handler = (receivedMessage: any) => {
      // Handle card selection events
      if (receivedMessage?.event === "stage3_card_selection") {
        const { contestant_id, card_index, card_type: originalCardType, contestant_name } = receivedMessage.payload;
        
        // Don't process if this is our own selection
        if (contestant_id === user?.contestant_id) return;
        
        console.log("Received card selection:", card_index, originalCardType, "by", contestant_name);
        
        // Add this card to flipping cards
        setFlippingCards(prev => [...prev, card_index]);
        
        // Count how many cards are already revealed
        const revealedCount = cards.filter(card => card.revealed).length;
        
        // Determine what type to reveal based on the number of cards revealed
        let card_type = originalCardType;
        
        if (originalCardType === CARD_TYPES.PASS && revealedCount < MIN_CARDS_BEFORE_PASS - 1) {
          // If it's the PASS card but not enough cards have been revealed, show DUD
          card_type = CARD_TYPES.DUD;
          console.log(`PASS card selected by ${contestant_name} but only ${revealedCount} cards revealed. Showing DUD for now.`);
        }
        
        // After the flip animation completes, update the card state
        setTimeout(() => {
          setCards(prevCards => {
            const newCards = [...prevCards];
            newCards[card_index] = {
              ...newCards[card_index],
              revealed: true,
              type: card_type,
              contestant_id: contestant_id,
              style: card_type === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[card_index].style
            };
            return newCards;
          });
          
          // If this is the PASS card, update the passCardIndex
          if (card_type === CARD_TYPES.PASS) {
            setPassCardIndex(card_index);
          }
          
          // Remove from flipping cards
          setFlippingCards(prev => prev.filter(idx => idx !== card_index));
          
          // Add to recently updated cards for visual feedback
          setRecentlyUpdated([card_index]);
          setTimeout(() => {
            setRecentlyUpdated([]);
          }, 1000);
          
          // If PASS was found by someone else
          if (card_type === CARD_TYPES.PASS) {
            console.log("MQTT: PASS found by another contestant");
            
            // Set the finder's name
            const finderName = contestant_name || contestantNames[contestant_id] || "Opponent";
            setPassFinderName(finderName);
            setPassFinderIsCurrentUser(false);
            
            setTimeout(() => {
              setPassFound(true);
            }, 300);
          } else {
            // Switch turns - now it's my turn
            console.log("Switching turn to me");
            setCurrentTurn(user?.contestant_id || null);
            setIsMyTurn(true);
          }
        }, 600); // Wait for full flip animation
      }
    };
    
    onMessage(handler);
    
    return () => {
      // Clean up
    };
  }, [isConnected, onMessage, cards, user?.contestant_id, contestantNames]);

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
  
  // Handle card click with improved PASS card logic
  const handleCardClick = (index: number) => {
    // Don't allow clicking if card is already revealed
    if (cards[index].revealed) return;
    
    // Don't allow clicking if pass is already found
    if (passFound) return;
    
    // Don't allow clicking if we're currently sending a selection
    if (isSending) return;
    
    // Don't allow clicking if any card is currently flipping
    if (flippingCards.length > 0) return;
    
    // Only enforce turn-based selection after the first card has been revealed
    if (!isMyTurn) {
      console.log("Not your turn");
      return;
    }
    
    // Add this card to flipping cards
    setFlippingCards([index]);
    
    // Increment attempts
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Get the original card type (what the card actually is)
    const originalCardType = cards[index].originalType;
    
    // Count how many cards are already revealed
    const revealedCount = cards.filter(card => card.revealed).length;
    
    // Special case: if this is the last card, it must be the PASS
    const isLastCard = revealedCount === 23;
    
    // Determine what type to reveal based on attempts and original type
    let revealedType = originalCardType;
    
    if (originalCardType === CARD_TYPES.PASS) {
      // Only reveal the PASS card if enough cards have been revealed or it's the last card
      if (revealedCount >= MIN_CARDS_BEFORE_PASS - 1 || isLastCard) {
        revealedType = CARD_TYPES.PASS;
        console.log("PASS card found!");
      } else {
        // Otherwise, show a DUD card for now
        revealedType = CARD_TYPES.DUD;
      }
    } else if (isLastCard) {
      // If this is the last card and not originally PASS, make it PASS anyway
      revealedType = CARD_TYPES.PASS;
      console.log("Last card forced to be PASS");
    }
    
    // After the flip animation completes, update the card state
    setTimeout(() => {
      // Create a new array with the clicked card revealed
      const newCards = [...cards];
      newCards[index] = {
        ...newCards[index],
        revealed: true,
        type: revealedType,
        contestant_id: user?.contestant_id || null,
        // Update style based on the revealed type
        style: revealedType === CARD_TYPES.PASS ? PASS_CARD_STYLE : newCards[index].style
      };
      setCards(newCards);
      
      // If this is the PASS card, update the passCardIndex
      if (revealedType === CARD_TYPES.PASS) {
        setPassCardIndex(index);
      }
      
      // Send the selection to other contestants
      sendCardSelection(index, revealedType);
      
      // Remove from flipping cards
      setFlippingCards([]);
      
      // If PASS was found, handle the pass found logic
      if (revealedType === CARD_TYPES.PASS) {
        // Play a success sound if available
        const successSound = new Audio("/sounds/success-sound.wav");
        successSound.play().catch(e => console.log("Could not play sound", e));
        
        // Set the finder's name (current user)
        setPassFinderName(user?.name || "You");
        setPassFinderIsCurrentUser(true);
        
        setPassRevealed(true);
        // Set a small delay before showing the pass found message/animation
        setTimeout(() => {
          setPassFound(true);
        }, 300);
      } else {
        // Switch turns - now it's the other contestant's turn
        setCurrentTurn(otherContestantId);
        setIsMyTurn(false);
      }
    }, 600); // Wait for full flip animation (300ms * 2)
  };

 

 
  // Add a more prominent status indicator
  const StatusIndicator = () => {
    if (passFound) return null; // Don't show status indicator if game is over
    return (
      <div className="absolute top-2 right-1 transform  flex items-center bg-transparent bg-opacity-70 px-4 py-2 rounded-full z-30">
        <div 
          className={`w-4 h-4 rounded-full ${isMyTurn ? 'bg-green-500' : 'bg-red-500'} animate-pulse mr-3`}
        ></div>
        <span className={`font-bold text-xxs ${isMyTurn ? 'text-green-400 ' : 'text-red-400'}`}>
         
        </span>
      </div>
    );
  };

//   // Add a function to check if the PASS card can be revealed yet
//   const canRevealPassCard = () => {
//     // Count how many cards are already revealed
//     const revealedCount = cards.filter(card => card.revealed).length;
//     return revealedCount >= MIN_CARDS_BEFORE_PASS;
//   };

  // Add a status message to show how many more cards need to be revealed

  // Add the status indicator to the main component return
  return (
    <div className="grid grid-cols-[1.2fr_5fr_1fr] h-full relative">
      

      
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
                  
                  {/* Add attempts counter and debug info */}
                  <div className="text-white flex flex-col items-center gap-2">
                        <span className="font-gilroyBold text-[#D5B9FF] text-sm">Select business elements you want for your hustle </span>
                        {!passFound&&<StatusIndicator />}
                      
                  </div>
                </div>
              </div>

              {
                isLoadingContestants? <div className="flex justify-center items-center h-full w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>:
                <div className="mt-4 flex flex-wrap justify-center gap-y-1 ">
                {(() => {
      
                  
                  return cards.map((card, index) => {
                    // Check if this card is currently flipping
                    const isFlipping = flippingCards.includes(index);
                    
                    // Get the text to display on the card
                    const cardText = card.revealed ? card.type : "?";
                    
                    // Get the appropriate style based on card state
                    const style = card.revealed && card.type === CARD_TYPES.PASS 
                      ? PASS_CARD_STYLE 
                      : card.style;
                    
                    // Check if this card was recently updated
                    const isRecentlyUpdated = recentlyUpdated.includes(index);
                    
                    // Check if this is the PASS card and it's revealed
                    const isRevealedPass = card.revealed && card.type === CARD_TYPES.PASS;
                    
                    // Get contestant name if available - use their actual name
                    let displayName = "";
                    if (card.revealed && card.contestant_id) {
                      if (card.contestant_id === user?.contestant_id) {
                        displayName = user?.name ?? "YOU";
                      } else {
                        // For cards revealed by the opponent, try multiple sources for the name
                        if (contestantNames[card.contestant_id]) {
                          displayName = contestantNames[card.contestant_id];
                        } else if (card.contestant_id === otherContestantId && otherContestantName) {
                          displayName = otherContestantName;
                        } else {
                          displayName = "OPPONENT";
                        }
                        
                        console.log("Opponent card:", card.contestant_id, "Name:", displayName, 
                                    "otherContestantId:", otherContestantId, 
                                    "otherContestantName:", otherContestantName);
                      }
                    }
                    
                    return (
                      <div 
                        key={index} 
                        onClick={() => handleCardClick(index)}
                        className={cn(
                          "relative transition-transform perspective-[1000px]",
                          card.revealed ? "cursor-default pointer-events-none opacity-70" : 
                            isMyTurn ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-80",
                          (isSending || flippingCards.length > 0) ? "cursor-wait pointer-events-none" : "",
                          isRecentlyUpdated ? "animate-pulse" : "",
                          isRevealedPass ? "z-10 opacity-100" : "" // Keep PASS card fully visible
                        )}
                        style={{ perspective: "1000px" }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`card-${index}-${card.revealed ? "revealed" : "hidden"}`}
                            initial={isFlipping ? { rotateY: 0, opacity: 1 } : false}
                            animate={
                              isFlipping 
                                ? { rotateY: 180, opacity: 0 } 
                                : isRevealedPass 
                                  ? { rotateY: 0, opacity: 1 } 
                                  : { rotateY: 0, opacity: 1 }
                            }
                            transition={{ 
                              duration: isRevealedPass ? 0.5 : 0.3, 
                              ease: "easeInOut"
                            }}
                            style={{ 
                              transformStyle: "preserve-3d",
                              backfaceVisibility: "hidden"
                            }}
                            className="relative"
                          >
                            <PickCardContainer
                              backgroundColor={style.backgroundColor}
                              text={cardText}
                              width="108px"
                              height="100px"
                              rayColor={style.rayColor}
                              innerCircleColor={style.innerCircleColor}
                              textColor={style.textColor}
                              cornerColor={style.cornerColor}
                              fontFamily={style.fontFamily}
                              fontSize={style.fontSize}
                              textStrokeWidth={cardText === CARD_TYPES.PASS ? 1.5 : 2}
                              textStrokeColor={cardText === CARD_TYPES.PASS ? "#000000" : "#D91FFF"}
                              containerLabel={card.revealed ? displayName : ""}
                              labelBackgroundColor={card.revealed ? style.labelBackgroundColor : "transparent"}
                              labelColor="#FFFFFF"
                              labelFontSize={20}
                              labelPadding={34}
                              className={cn(
                                "transition-transform p-0 duration-300 ease-in-out 2xl:w-[800px]",
                                isRecentlyUpdated ? "ring-2 ring-white" : "",
                                isFlipping ? "shadow-lg" : "",
                                isRevealedPass ? "ring-4 ring-yellow-400 shadow-xl shadow-yellow-400/50" : ""
                              )}
                              textClassName={cn(
                                "font-extrabold text-[2rem] font-gilroyBold",
                                isRevealedPass ? "animate-pulse" : ""
                              )}
                              labelClassName={`${card.revealed ? "font-bold tracking-wide" : "hidden"}`}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    );
                  });
                })()}
              </div>
              

              }
            
              
             
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
      
      {/* Pass Card Ribbon Effect - only show if a PASS card is revealed */}
      {passCardIndex >= 0 && (
        <PassCardEffect isVisible={true} cardIndex={passCardIndex} />
      )}
      
      {/* Celebration Animation - now with finder's name */}
      <CelebrationAnimation 
        isVisible={passFound} 
        finderName={passFinderIsCurrentUser ? undefined : passFinderName} 
      />
      
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
