import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/utils/classNames";

interface AnimatedTextProps {
  text: string;
  fontSize?: string;
  speed?: number; // milliseconds between characters
  volume?: number;
  enableSound?: boolean;
  soundUrl?: string;
}

const AnimatedText = ({ 
  text = "", 
  fontSize = "text-3xl",
  speed = 50,
  volume = 0.5,
  enableSound = true,
  soundUrl = "/sounds/comtype_typewriter-id-1065_bsb-121672.mp3"
}: AnimatedTextProps) => {
  const [revealedText, setRevealedText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundReady, setSoundReady] = useState(false);
  
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Initialize audio
  useEffect(() => {
    if (!enableSound) return;
    
    const audio = new Audio(soundUrl);
    audio.volume = volume;
    audio.preload = "auto";
    
    const handleCanPlay = () => setSoundReady(true);
    const handleError = () => {
      console.warn("Could not load typewriter sound");
      setSoundReady(false);
    };
    
    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("error", handleError);
    
    audioRef.current = audio;
    
    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [enableSound, soundUrl, volume]);

  // Play sound function
  const playSound = useCallback(() => {
    if (!enableSound || !audioRef.current || !soundReady) return;
    
    try {
      // Stop current playback and reset to beginning
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        console.warn("Could not play typewriter sound:", e);
      });
    } catch (error) {
      console.warn("Could not play typewriter sound:", error);
    }
  }, [enableSound, soundReady]);

  // Clean up function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Stop any playing sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsAnimating(false);
  }, []);

  // Animation function
  const startAnimation = useCallback(() => {
    if (!text || !isMountedRef.current) return;

    cleanup(); // Clear any existing animation
    
    setRevealedText("");
    indexRef.current = 0;
    setIsAnimating(true);

    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        cleanup();
        return;
      }

      const currentIndex = indexRef.current;
      
      if (currentIndex < text.length) {
        const nextChar = text.charAt(currentIndex);
        
        setRevealedText(prev => prev + nextChar);
        
        // Only play sound for visible characters (not spaces)
        if (nextChar.trim()) {
          playSound();
        }
        
        indexRef.current += 1;
      } else {
        cleanup();
      }
    }, speed);
  }, [text, speed, playSound, cleanup]);

  // Effect to start animation when text changes
  useEffect(() => {
    if (text) {
      startAnimation();
    } else {
      cleanup();
      setRevealedText("");
    }
  }, [text, startAnimation, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return (
    <p 
      className={cn(
        fontSize,
        "text-white leading-[4rem] text-center font-gilroyMedium font-extrabold"
      )}
      aria-live="polite"
      aria-label={isAnimating ? "Typing text..." : text}
    >
      {revealedText}
      {isAnimating && (
        <span className="animate-pulse opacity-70">|</span>
      )}
    </p>
  );
};

export default AnimatedText;