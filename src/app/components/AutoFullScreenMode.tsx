"use client";

import { useEffect } from "react";

const FullscreenWrapper = () => {
  useEffect(() => {
    const handleInteraction = () => {
      const element = document.documentElement;

      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen(); // Safari
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen(); // IE11
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
