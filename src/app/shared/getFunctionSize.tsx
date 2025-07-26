
import { useState, useEffect } from 'react';

// Type definitions
type TailwindFontSize = 
  | 'text-xs' 
  | 'text-sm' 
  | 'text-base' 
  | 'text-lg' 
  | 'text-xl' 
  | 'text-2xl' 
  | 'text-3xl' 
  | 'text-4xl' 
  | 'text-5xl' 
  | 'text-6xl';

interface FontSizeMap {
  mobile: {
    short: TailwindFontSize;
    medium: TailwindFontSize;
    long: TailwindFontSize;
    veryLong: TailwindFontSize;
    extraLong: TailwindFontSize;
  };
  desktop: {
    short: TailwindFontSize;
    medium: TailwindFontSize;
    long: TailwindFontSize;
    veryLong: TailwindFontSize;
    extraLong: TailwindFontSize;
  };
}

interface ScaledFontOptions {
  minSize?: TailwindFontSize;
  maxSize?: TailwindFontSize;
  minSizeDesktop?: TailwindFontSize;
  maxSizeDesktop?: TailwindFontSize;
  shortThreshold?: number;
  mediumThreshold?: number;
  longThreshold?: number;
}

interface DynamicFontHookOptions {
  baseSize?: TailwindFontSize;
  responsiveSize?: TailwindFontSize;
}

// Content type for different use cases
type ContentType = 'question' | 'option' | 'custom';

// Function to calculate dynamic font size based on text length and content type
export const getDynamicFontSize = (
  text: string | null | undefined, 
  contentType: ContentType = 'question',
  baseSize?: TailwindFontSize, 
  responsiveSize?: TailwindFontSize
): string => {
  if (!text) {
    const defaultBase = baseSize || (contentType === 'option' ? 'text-sm' : 'text-lg');
    const defaultResponsive = responsiveSize || (contentType === 'option' ? 'text-lg' : 'text-2xl');
    return `${defaultBase} 2xl:${defaultResponsive}`;
  }
  
  const textLength: number = text.length;
  
  // Define breakpoints and corresponding font sizes for different content types
  const fontSizeMaps: Record<ContentType, FontSizeMap> = {
    question: {
      mobile: {
        short: 'text-3xl',      // 0-50 characters
        medium: 'text-2xl',     // 51-100 characters
        long: 'text-xl',     // 101-200 characters
        veryLong: 'text-lg',   // 201-300 characters
        extraLong: 'text-sm'   // 300+ characters
      },
      desktop: {
        short: 'text-3xl',     // 0-50 characters
        medium: 'text-2xl',    // 51-100 characters
        long: 'text-xl',       // 101-200 characters
        veryLong: 'text-lg',   // 201-300 characters
        extraLong: 'text-base' // 300+ characters
      }
    },
    option: {
      mobile: {
        short: 'text-base',    // 0-30 characters
        medium: 'text-sm',     // 31-60 characters
        long: 'text-xs',       // 61-120 characters
        veryLong: 'text-xs',   // 121-180 characters
        extraLong: 'text-xs'   // 180+ characters
      },
      desktop: {
        short: 'text-xl',      // 0-30 characters
        medium: 'text-lg',     // 31-60 characters
        long: 'text-base',     // 61-120 characters
        veryLong: 'text-sm',   // 121-180 characters
        extraLong: 'text-sm'   // 180+ characters
      }
    },
    custom: {
      mobile: {
        short: baseSize || 'text-lg',
        medium: baseSize || 'text-base',
        long: baseSize || 'text-sm',
        veryLong: baseSize || 'text-xs',
        extraLong: baseSize || 'text-xs'
      },
      desktop: {
        short: responsiveSize || 'text-2xl',
        medium: responsiveSize || 'text-xl',
        long: responsiveSize || 'text-lg',
        veryLong: responsiveSize || 'text-base',
        extraLong: responsiveSize || 'text-sm'
      }
    }
  };
  
  const fontSizeMap = fontSizeMaps[contentType];
  
  // Different thresholds for different content types
  const thresholds = {
    question: { short: 50, medium: 100, long: 200, veryLong: 300 },
    option: { short: 30, medium: 60, long: 120, veryLong: 180 },
    custom: { short: 50, medium: 100, long: 200, veryLong: 300 }
  };
  
  const threshold = thresholds[contentType];
  
  let mobileSize: TailwindFontSize;
  let desktopSize: TailwindFontSize;
  
  if (textLength <= threshold.short) {
    mobileSize = fontSizeMap.mobile.short;
    desktopSize = fontSizeMap.desktop.short;
  } else if (textLength <= threshold.medium) {
    mobileSize = fontSizeMap.mobile.medium;
    desktopSize = fontSizeMap.desktop.medium;
  } else if (textLength <= threshold.long) {
    mobileSize = fontSizeMap.mobile.long;
    desktopSize = fontSizeMap.desktop.long;
  } else if (textLength <= threshold.veryLong) {
    mobileSize = fontSizeMap.mobile.veryLong;
    desktopSize = fontSizeMap.desktop.veryLong;
  } else {
    mobileSize = fontSizeMap.mobile.extraLong;
    desktopSize = fontSizeMap.desktop.extraLong;
  }
  
  return `${mobileSize} 2xl:${desktopSize}`;
};

// Alternative function with more granular control
export const getScaledFontSize = (
  text: string | null | undefined, 
  options: ScaledFontOptions = {}
): string => {
  const {
    minSize = 'text-xs',
    maxSize = 'text-2xl',
    minSizeDesktop = 'text-base',
    maxSizeDesktop = 'text-3xl',
    shortThreshold = 50,
    mediumThreshold = 150,
    longThreshold = 250
  } = options;
  
  if (!text) return `${maxSize} 2xl:${maxSizeDesktop}`;
  
  const textLength: number = text.length;
  
  // Calculate scaling factor (0 to 1, where 1 is shortest text)
  const scaleFactor: number = Math.max(0, Math.min(1, (longThreshold - textLength) / longThreshold));
  
  // Define size arrays (from smallest to largest)
  const mobileSizes: TailwindFontSize[] = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
  const desktopSizes: TailwindFontSize[] = ['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'];
  
  // Calculate index based on scaling factor
  const mobileIndex: number = Math.floor(scaleFactor * (mobileSizes.length - 1));
  const desktopIndex: number = Math.floor(scaleFactor * (desktopSizes.length - 1));
  
  const mobileSize: TailwindFontSize = mobileSizes[mobileIndex];
  const desktopSize: TailwindFontSize = desktopSizes[desktopIndex];
  
  return `${mobileSize} 2xl:${desktopSize}`;
};