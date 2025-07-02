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








// "use client";

// import { useEffect, useState } from "react";

// const FullscreenWrapper = () => {
//   const [isFullscreenActive, setIsFullscreenActive] = useState(false);

//   // Function to check if we're in fullscreen mode
//   const checkFullscreen = () => {
//     return !!(
//       document.fullscreenElement || 
//       (document as any).webkitFullscreenElement || 
//       (document as any).msFullscreenElement ||
//       (document as any).mozFullScreenElement
//     );
//   };

//   // Function to apply content protection styles
//   const applyContentProtection = () => {
//     const style = document.createElement('style');
//     style.id = 'content-protection-styles';
//     style.textContent = `
//       * {
//         -webkit-user-select: none !important;
//         -moz-user-select: none !important;
//         -ms-user-select: none !important;
//         user-select: none !important;
//         -webkit-touch-callout: none !important;
//         -webkit-tap-highlight-color: transparent !important;
//       }
      
//       body {
//         -webkit-user-select: none !important;
//         -moz-user-select: none !important;
//         -ms-user-select: none !important;
//         user-select: none !important;
//         pointer-events: auto !important;
//       }
      
//       input, textarea {
//         -webkit-user-select: text !important;
//         -moz-user-select: text !important;
//         -ms-user-select: text !important;
//         user-select: text !important;
//       }
//     `;
    
//     if (!document.head.querySelector('#content-protection-styles')) {
//       document.head.appendChild(style);
//     }
//   };

//   // Function to remove content protection styles
//   const removeContentProtection = () => {
//     const existingStyle = document.head.querySelector('#content-protection-styles');
//     if (existingStyle) {
//       existingStyle.remove();
//     }
//   };

//   // Prevent keyboard shortcuts and navigation
//   const preventKeyboardShortcuts = (e: KeyboardEvent) => {
//     // Prevent Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X, Ctrl+S, Ctrl+P, F12, etc.
//     if (
//       (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'x' || e.key === 's' || e.key === 'p')) ||
//       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
//       e.key === 'F12' ||
//       (e.ctrlKey && e.key === 'u') ||
//       (e.ctrlKey && e.shiftKey && e.key === 'Delete') ||
//       // Prevent tab navigation and window switching
//       (e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w')) || // New tab, new window, close tab
//       (e.ctrlKey && e.shiftKey && (e.key === 'T' || e.key === 'N')) || // Reopen closed tab, new incognito
//       (e.ctrlKey && (e.key === 'Tab' || e.key === 'PageUp' || e.key === 'PageDown')) || // Switch tabs
//       (e.altKey && e.key === 'Tab') || // Alt+Tab (switch applications)
//       (e.altKey && e.key === 'F4') || // Alt+F4 (close window)
//       e.key === 'F11' || // Toggle fullscreen
//       (e.ctrlKey && e.key === 'r') || // Refresh
//       (e.ctrlKey && e.key === 'F5') || // Refresh
//       e.key === 'F5' || // Refresh
//       (e.ctrlKey && e.key === 'l') || // Address bar focus
//       (e.ctrlKey && e.key === 'd') || // Bookmark
//       (e.ctrlKey && e.key === 'h') || // History
//       (e.ctrlKey && e.key === 'j') || // Downloads
//       e.key === 'Escape' // Prevent escape key
//     ) {
//       e.preventDefault();
//       e.stopPropagation();
//       return false;
//     }
//   };

//   // Prevent right-click context menu
//   const preventContextMenu = (e: MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     return false;
//   };

//   // Prevent text selection with mouse
//   const preventSelection = (e: Event) => {
//     e.preventDefault();
//     return false;
//   };

//   // Prevent page navigation and leaving
//   const preventPageLeaving = (e: BeforeUnloadEvent) => {
//     e.preventDefault();
//     e.returnValue = 'Are you sure you want to leave? Your session will be terminated.';
//     return 'Are you sure you want to leave? Your session will be terminated.';
//   };

//   // Prevent window focus loss
//   const handleWindowBlur = () => {
//     // Attempt to refocus the window
//     window.focus();
    
//     // If we lost focus and are in fullscreen, try to re-enter fullscreen
//     if (isFullscreenActive) {
//       setTimeout(() => {
//         if (!checkFullscreen()) {
//           requestFullscreen();
//         }
//       }, 100);
//     }
//   };

//   // Handle visibility change (tab switching)
//   const handleVisibilityChange = () => {
//     if (document.hidden && isFullscreenActive) {
//       // Page became hidden (user switched tabs or minimized)
//       setTimeout(() => {
//         window.focus();
//         if (!checkFullscreen()) {
//           requestFullscreen();
//         }
//       }, 100);
//     }
//   };

//   // Prevent opening links in new tabs/windows
//   const preventLinkNavigation = (e: MouseEvent) => {
//     const target = e.target as HTMLElement;
//     if (target.tagName === 'A' || target.closest('a')) {
//       e.preventDefault();
//       e.stopPropagation();
//       return false;
//     }
//   };

//   // Prevent drag and drop
//   const preventDragDrop = (e: DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     return false;
//   };

//   // Override window.open and monitor navigation attempts
//   const blockWindowMethods = () => {
//     // Store original methods
//     const originalOpen = window.open;
//     const originalAssign = window.location.assign;
//     const originalReplace = window.location.replace;
//     const originalReload = window.location.reload;
    
//     // Override window.open
//     window.open = () => {
//       console.warn('Opening new windows is blocked in secure mode');
//       return null;
//     };
    
//     // Override location methods (these can be overridden)
//     try {
//       window.location.assign = () => {
//         console.warn('Navigation is blocked in secure mode');
//         return false;
//       };
      
//       window.location.replace = () => {
//         console.warn('Navigation is blocked in secure mode');
//         return false;
//       };
      
//       window.location.reload = () => {
//         console.warn('Page reload is blocked in secure mode');
//         return false;
//       };
//     } catch (error) {
//       console.warn('Could not override location methods:', error);
//     }
    
//     // Monitor hash changes
//     const originalPushState = history.pushState;
//     const originalReplaceState = history.replaceState;
    
//     history.pushState = () => {
//       console.warn('History navigation is blocked in secure mode');
//       return false;
//     };
    
//     history.replaceState = () => {
//       console.warn('History navigation is blocked in secure mode');
//       return false;
//     };
    
//     // Return cleanup function
//     return () => {
//       window.open = originalOpen;
//       try {
//         window.location.assign = originalAssign;
//         window.location.replace = originalReplace;
//         window.location.reload = originalReload;
//       } catch (error) {
//         console.warn('Could not restore location methods:', error);
//       }
//       history.pushState = originalPushState;
//       history.replaceState = originalReplaceState;
//     };
//   };

//   // Function to request fullscreen
//   const requestFullscreen = () => {
//     const element = document.documentElement;
    
//     try {
//       if (element.requestFullscreen) {
//         element.requestFullscreen();
//       } else if ((element as any).webkitRequestFullscreen) {
//         (element as any).webkitRequestFullscreen(); // Safari
//       } else if ((element as any).msRequestFullscreen) {
//         (element as any).msRequestFullscreen(); // IE11
//       } else if ((element as any).mozRequestFullScreen) {
//         (element as any).mozRequestFullScreen(); // Firefox
//       }
      
//       // Lock orientation to landscape if supported
//       if ('orientation' in screen) {
//         const screenOrientation = (screen.orientation as any);
//         if (screenOrientation && typeof screenOrientation.lock === 'function') {
//           screenOrientation.lock('landscape').catch((err: Error) => {
//             console.log('Orientation lock failed:', err);
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Fullscreen request failed:", error);
//     }
//   };

//   // Handle any user interaction
//   const handleInteraction = () => {
//     if (!checkFullscreen()) {
//       requestFullscreen();
//     }
//   };

//   // Handle fullscreen change events
//   const handleFullscreenChange = () => {
//     const fullscreenStatus = checkFullscreen();
//     setIsFullscreenActive(fullscreenStatus);
    
//     if (fullscreenStatus) {
//       // Apply content protection when entering fullscreen
//       applyContentProtection();
//     } else {
//       // Remove content protection when exiting fullscreen
//       removeContentProtection();
//       console.log("Exited fullscreen, will re-enter on next interaction");
//     }
//   };

//   useEffect(() => {
//     // Initial fullscreen request on component mount
//     requestFullscreen();
    
//     // Block window methods when component mounts
//     const restoreWindowMethods = blockWindowMethods();
    
//     // Set up event listeners
//     const addEventListeners = () => {
//       // Fullscreen change listeners
//       document.addEventListener("fullscreenchange", handleFullscreenChange);
//       document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
//       document.addEventListener("msfullscreenchange", handleFullscreenChange);
//       document.addEventListener("mozfullscreenchange", handleFullscreenChange);
      
//       // Interaction listeners for fullscreen
//       window.addEventListener("click", handleInteraction);
//       window.addEventListener("touchstart", handleInteraction);
//       window.addEventListener("keydown", handleInteraction);
      
//       // Content protection listeners
//       document.addEventListener("keydown", preventKeyboardShortcuts);
//       document.addEventListener("contextmenu", preventContextMenu);
//       document.addEventListener("selectstart", preventSelection);
//       document.addEventListener("dragstart", preventDragDrop);
//       document.addEventListener("drop", preventDragDrop);
//       document.addEventListener("click", preventLinkNavigation);
      
//       // Page leaving prevention
//       window.addEventListener("beforeunload", preventPageLeaving);
//       window.addEventListener("unload", preventPageLeaving);
      
//       // Focus and visibility listeners
//       window.addEventListener("blur", handleWindowBlur);
//       document.addEventListener("visibilitychange", handleVisibilityChange);
      
//       // Additional protection for mobile
//       document.addEventListener("touchstart", preventSelection);
//       document.addEventListener("touchmove", preventSelection);
      
//       // Prevent print
//       window.addEventListener("beforeprint", (e) => {
//         e.preventDefault();
//         return false;
//       });
      
//       // Prevent hash changes
//       window.addEventListener("hashchange", (e) => {
//         e.preventDefault();
//         console.warn('Hash navigation is blocked in secure mode');
//         return false;
//       });
//     };
    
//     addEventListeners();
    
//     // Clean up event listeners on unmount
//     return () => {
//       // Restore window methods
//       restoreWindowMethods();
      
//       // Remove fullscreen listeners
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("msfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      
//       // Remove interaction listeners
//       window.removeEventListener("click", handleInteraction);
//       window.removeEventListener("touchstart", handleInteraction);
//       window.removeEventListener("keydown", handleInteraction);
      
//       // Remove content protection listeners
//       document.removeEventListener("keydown", preventKeyboardShortcuts);
//       document.removeEventListener("contextmenu", preventContextMenu);
//       document.removeEventListener("selectstart", preventSelection);
//       document.removeEventListener("dragstart", preventDragDrop);
//       document.removeEventListener("drop", preventDragDrop);
//       document.removeEventListener("click", preventLinkNavigation);
//       document.removeEventListener("touchstart", preventSelection);
//       document.removeEventListener("touchmove", preventSelection);
      
//       // Remove page leaving prevention
//       window.removeEventListener("beforeunload", preventPageLeaving);
//       window.removeEventListener("unload", preventPageLeaving);
      
//       // Remove focus listeners
//       window.removeEventListener("blur", handleWindowBlur);
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
      
//       // Remove protection styles
//       removeContentProtection();
//     };
//   }, []);

//   // Add a visible button as a fallback for mobile devices
//   return (
//     <div 
//       onClick={requestFullscreen}
//       style={{
//         position: 'fixed',
//         bottom: '10px',
//         right: '10px',
//         zIndex: 9999,
//         display: isFullscreenActive ? 'none' : 'block',
//         padding: '8px 12px',
//         background: 'rgba(0, 0, 0, 0.7)',
//         color: 'white',
//         borderRadius: '4px',
//         cursor: 'pointer',
//         fontSize: '12px',
//         border: '1px solid rgba(255, 255, 255, 0.3)',
//         userSelect: 'none'
//       }}
//     >
//       🔒 Enter Secure Mode
//     </div>
//   );
// };

// export default FullscreenWrapper;