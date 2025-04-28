"use client";

import { useEffect } from "react";

const FullscreenWrapper = () => {
  useEffect(() => {
    const handleInteraction = () => {
      const element = document.documentElement;

      // Request fullscreen
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen(); // Safari
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen(); // IE11
      }

      // Lock orientation to landscape if supported
      if ('orientation' in screen) {
        // Type assertion to access the lock method
        const screenOrientation = (screen.orientation as any);
        if (screenOrientation && typeof screenOrientation.lock === 'function') {
          screenOrientation.lock('landscape').catch((err: Error) => {
            // Handle error silently - some devices might not support orientation lock
            console.log('Orientation lock failed:', err);
          });
        }
      }

      // Remove listeners after entering fullscreen
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    // Wait for user interaction
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  return null; // No UI needed
};

export default FullscreenWrapper;
