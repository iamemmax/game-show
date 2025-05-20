"use client";

import { useEffect, useState } from "react";

const FullscreenWrapper = () => {
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);

  // Function to check if we're in fullscreen mode
  const checkFullscreen = () => {
    return !!(
      document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).msFullscreenElement ||
      (document as any).mozFullScreenElement
    );
  };

  // Function to request fullscreen
  const requestFullscreen = () => {
    const element = document.documentElement;
    
    try {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen(); // Safari
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen(); // IE11
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen(); // Firefox
      }
      
      // Lock orientation to landscape if supported
      if ('orientation' in screen) {
        const screenOrientation = (screen.orientation as any);
        if (screenOrientation && typeof screenOrientation.lock === 'function') {
          screenOrientation.lock('landscape').catch((err: Error) => {
            console.log('Orientation lock failed:', err);
          });
        }
      }
    } catch (error) {
      console.error("Fullscreen request failed:", error);
    }
  };

  // Handle any user interaction
  const handleInteraction = () => {
    if (!checkFullscreen()) {
      requestFullscreen();
    }
  };

  // Handle fullscreen change events
  const handleFullscreenChange = () => {
    const fullscreenStatus = checkFullscreen();
    setIsFullscreenActive(fullscreenStatus);
    
    if (!fullscreenStatus) {
      console.log("Exited fullscreen, will re-enter on next interaction");
    }
  };

  useEffect(() => {
    // Initial fullscreen request on component mount
    requestFullscreen();
    
    // Set up event listeners
    const addEventListeners = () => {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.addEventListener("msfullscreenchange", handleFullscreenChange);
      document.addEventListener("mozfullscreenchange", handleFullscreenChange);
      
      window.addEventListener("click", handleInteraction);
      window.addEventListener("touchstart", handleInteraction);
      window.addEventListener("keydown", handleInteraction);
    };
    
    addEventListeners();
    
    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Add a visible button as a fallback for mobile devices
  return (
    <div 
      onClick={requestFullscreen}
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        display: isFullscreenActive ? 'none' : 'block',
        padding: '8px',
        background: 'transparent',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
      }}
    >
    </div>
  );
};

export default FullscreenWrapper;
