import { cn } from '@/utils/classNames';
import React from 'react';

export interface ZtCardProps {
  width?: number;
  height?: number;
  className?: string;
  text?: string | React.ReactNode;  // Modified to accept ReactNode
  backgroundColor?: string;
  primaryGradientStartColor?: string;
  primaryGradientEndColor?: string;
  secondaryGradientStartColor?: string;
  secondaryGradientMiddleColor?: string;
  secondaryGradientEndColor?: string;
  tertiaryGradientStartColor?: string;
  tertiaryGradientMiddleColor?: string;
  tertiaryGradientEndColor?: string;
  textColor?: string;
  textStrokeColor?: string;
  bgBlurColor?: string;
  centerBackgroundColor?: string;
  active?: boolean; // New prop for active state
  iconPosition?: { x?: number; y?: number }; // Control icon position
  iconSize?: number; // Control icon size
}

const NumberCardContainer: React.FC<ZtCardProps> = ({
  width = 66,
  height = 58,
  className,
  text = "ZT",
  backgroundColor = "black",
  primaryGradientStartColor = "#7E3CE0",
  primaryGradientEndColor = "#3C1272",
  secondaryGradientStartColor = "#7E3CE0",
  secondaryGradientMiddleColor = "#760F1B",
  secondaryGradientEndColor = "#3C1272",
  tertiaryGradientStartColor = "#CE64FF",
  tertiaryGradientMiddleColor = "#EB001B",
  tertiaryGradientEndColor = "#7B3C99",
  textColor = "#FFFFFF",
  textStrokeColor = "#000000",
  bgBlurColor = "#280458",
  centerBackgroundColor = "transparent",
  active = false, // Default to false
  iconPosition = { x: 33, y: 25 }, // Default position
  iconSize = 16 // Default size
}) => {
  const uniqueId = React.useId();
  const primaryGradientId = `primary_gradient_${uniqueId}`;
  const secondaryGradientId = `secondary_gradient_${uniqueId}`;
  const tertiaryGradientId = `tertiary_gradient_${uniqueId}`;
  const clipPathId = `bgblur_clip_path_${uniqueId}`;

  const renderContent = () => {
    if (React.isValidElement(text)) {
      // If text is a React element (icon), render it with custom position and size
      const iconX = iconPosition.x ?? 33;
      const iconY = iconPosition.y ?? 25;
      const halfSize = iconSize / 2;
      
      return (
        <g transform={`translate(${iconX - halfSize}, ${iconY - halfSize})`}>
          {React.cloneElement(text as React.ReactElement, {
            width: iconSize,
            height: iconSize
          })}
        </g>
      );
    }
    
    // If text is a string, render it with the text element
    // Use fixed position for text, independent of iconPosition
    return (
      <>
        {/* Text stroke outline (rendered first) */}
        <text 
          x="33"
          y="37" // Fixed position for text
          fontSize="19"
          fontFamily="sans-serif"
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textStrokeColor}
          stroke={textStrokeColor}
          strokeWidth="3"
          paintOrder="stroke"
        >
          {text}
        </text>
        
        {/* Text fill (rendered second) */}
        <text 
          x="33"
          y="37" // Fixed position for text
          fontSize="19"
          fontFamily="sans-serif"
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
        >
          {text}
        </text>
      </>
    );
  };

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 66 58" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
    >
      <path 
        d="M17 21V12C17 6.47715 21.4772 2 27 2H40C45.5228 2 50 6.47715 50 12V21" 
        stroke={`url(#${primaryGradientId})`} 
        strokeWidth="3"
      />
      <rect 
        x="2" 
        y="10" 
        width="62" 
        height="46" 
        rx="8" 
        fill={backgroundColor} 
        stroke={`url(#${secondaryGradientId})`} 
        strokeWidth="4"
      />
      
      {/* New center background circle/shape */}
      {centerBackgroundColor !== "transparent" && (
        <circle
          cx="33"
          cy="38"
          r="16"
          fill={centerBackgroundColor}
        />
      )}
      
      <path 
        d="M60 20V20C60 16.6863 57.3137 14 54 14H12C8.68629 14 6 16.6863 6 20V20" 
        stroke={`url(#${tertiaryGradientId})`} 
        strokeWidth="2"
      />
      <foreignObject x="-179" y="-169" width="424" height="375">
        <div 
          style={{ 
            backdropFilter: "blur(92px)", 
            clipPath: `url(#${clipPathId})`, 
            height: "100%", 
            width: "100%" 
          }}
        ></div>
      </foreignObject>
      {!active && <path data-figma-bg-blur-radius="184" d="M5 15H61V22H5V15Z" fill={bgBlurColor} />}
      
      {renderContent()}
      
      <clipPath id={clipPathId}>
        <path d="M5 15H61V22H5V15Z"/>
      </clipPath>

      <defs>
        <linearGradient 
          id={primaryGradientId} 
          x1="33.5" 
          y1="2" 
          x2="33.5" 
          y2="43.42" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={primaryGradientStartColor} />
          <stop offset="1" stopColor={primaryGradientEndColor} />
        </linearGradient>
        
        <linearGradient 
          id={secondaryGradientId} 
          x1="33" 
          y1="8" 
          x2="33" 
          y2="84.5" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={secondaryGradientStartColor} />
          <stop offset="0.5" stopColor={secondaryGradientMiddleColor} />
          <stop offset="1" stopColor={secondaryGradientEndColor} />
        </linearGradient>
        
        {!active && <linearGradient 
          id={tertiaryGradientId} 
          x1="6" 
          y1="17" 
          x2="57.7394" 
          y2="12.2263" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={tertiaryGradientStartColor} />
          <stop offset="0.5" stopColor={tertiaryGradientMiddleColor} />
          <stop offset="1" stopColor={tertiaryGradientEndColor} />
        </linearGradient>}
      </defs>
    </svg>
  );
};

export default NumberCardContainer;
