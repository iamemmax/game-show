import { cn } from "@/utils/classNames";
import React from "react";

interface PickCardContainerProps {
  text?: string | React.ReactNode;
  containerLabel?: string;
  textColor?: string;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  backgroundColor?: string;
  rayColor?: string;
  cornerColor?: string;
  labelColor?: string;
  labelBackgroundColor?: string;
  innerCircleColor?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  textClassName?: string;
  labelClassName?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  showPatternLabel?: boolean;
  labelFontSize?: number;
  labelPadding?: number;
}

// The main reusable component 
const PickCardContainer: React.FC<PickCardContainerProps> = ({ 
  text = "?", 
  containerLabel = "",
  textColor = "#FFFFFF",
  textStrokeColor = "#000000",
  textStrokeWidth = 1,
  backgroundColor = "#000000",
  rayColor = "#FFA500",  // Default orange/yellow ray color
  cornerColor,
  labelColor = "#FFFFFF",
  labelBackgroundColor = "#8E17AA",
  innerCircleColor = "#222222",
  width = "100%",
  height = "100%",
  className = "",
  textClassName = "",
  labelClassName = "",
  fontSize = 46,
  fontFamily = "sans-serif",
  fontWeight = "bold",
  showPatternLabel = true,
  labelFontSize = 20,
  labelPadding = 30
}) => {
  // If cornerColor is not provided, default to rayColor
  const patternId = `pattern-${Math.random().toString(36).substring(2, 9)}`;
  
  // Calculate dimensions
  const totalHeight = 240;
  const cardHeight = showPatternLabel ? totalHeight - labelPadding : totalHeight;
  const cardY = showPatternLabel ? labelPadding : 0;
  
  return (
    <div 
      style={{ width, height, userSelect: "none" }} 
      className={cn("relative w-full h-full", className)}
    >
      <svg viewBox={`0 0 220 ${totalHeight}`} className="w-full h-full">
        <defs>
          {/* Pattern for the label background */}
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="30" height="30" patternTransform="scale(0.5)">
            <path d="M15,0 C6.716,0 0,6.716 0,15 C0,23.284 6.716,30 15,30 C23.284,30 30,23.284 30,15 C30,6.716 23.284,0 15,0 Z M15,24 C9.478,24 5,19.522 5,14 C5,8.478 9.478,4 15,4 C20.522,4 25,8.478 25,14 C25,19.522 20.522,24 15,24 Z" 
                  fill="#6B1FFF" fillOpacity="0.3"/>
            <circle cx="15" cy="15" r="3" fill="#6B1FFF" fillOpacity="0.5"/>
            <path d="M45,15 C45,6.716 38.284,0 30,0 C21.716,0 15,6.716 15,15 C15,23.284 21.716,30 30,30 C38.284,30 45,23.284 45,15 Z M30,24 C24.478,24 20,19.522 20,14 C20,8.478 24.478,4 30,4 C35.522,4 40,8.478 40,14 C40,19.522 35.522,24 30,24 Z" 
                  fill="#6B1FFF" fillOpacity="0.3"/>
            <circle cx="30" cy="15" r="2" fill="#6B1FFF" fillOpacity="0.5"/>
            <path d="M0,15 C0,23.284 6.716,30 15,30 C23.284,30 30,23.284 30,15 C30,6.716 23.284,0 15,0 C6.716,0 0,6.716 0,15 Z M15,6 C20.522,6 25,10.478 25,16 C25,21.522 20.522,26 15,26 C9.478,26 5,21.522 5,16 C5,10.478 9.478,6 15,6 Z" 
                  fill="#6B1FFF" fillOpacity="0.3"/>
            <circle cx="15" cy="15" r="4" fill="#6B1FFF" fillOpacity="0.5"/>
          </pattern>
        </defs>
        
        {/* Label at the top - only show if containerLabel exists and showPatternLabel is true */}
        {containerLabel && showPatternLabel && (
          <>
            {/* Label background */}
            <rect 
              x="0" 
              y="0" 
              width="220" 
              height={labelPadding} 
              fill={labelBackgroundColor} 
            />
            
            {/* Label text */}
            <foreignObject x="0" y="0" width="220" height={labelPadding}>
              <div
                className={cn(
                  "w-full h-full flex items-center justify-center text-center px-2",
                  labelClassName
                )}
                style={{
                  color: labelColor,
                  fontSize: `${labelFontSize}px`,
                  fontWeight: "bold",
                  fontFamily: fontFamily,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textShadow: "0px 0px 4px rgba(0, 0, 0, 0.7)",
                  userSelect: "none"
                }}
              >
                {containerLabel}
              </div>
            </foreignObject>
          </>
        )}
        
        {/* Card background */}
        <rect 
          x="0" 
          y={cardY} 
          width="220" 
          height={cardHeight} 
          rx="15" 
          ry="15" 
          fill={backgroundColor} 
        />
        
        {/* Corner dots - positioned at the edges */}
        <circle cx="5" cy={cardY + 5} r="6" fill={cornerColor || rayColor} />
        <circle cx="215" cy={cardY + 5} r="6" fill={cornerColor || rayColor} />
        <circle cx="5" cy={cardY + cardHeight - 5} r="6" fill={cornerColor || rayColor} />
        <circle cx="215" cy={cardY + cardHeight - 5} r="6" fill={cornerColor || rayColor} />
        
        {/* Rays - contained within the card */}
        <g clipPath="url(#containerClip)">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15) * Math.PI / 180;
            const centerX = 110;
            const centerY = cardY + cardHeight / 2; // Center of the card
            const innerRadius = 55; // Increased inner circle radius
            
            // Calculate ray endpoint - extend beyond container to ensure it touches edge
            const rayLength = 220; // Long enough to guarantee intersection
            const endX = centerX + rayLength * Math.cos(angle);
            const endY = centerY + rayLength * Math.sin(angle);
            
            // Calculate inner start point of ray
            const x1 = centerX + innerRadius * Math.cos(angle);
            const y1 = centerY + innerRadius * Math.sin(angle);
            
            return (
              <line 
                key={i}
                x1={x1}
                y1={y1}
                x2={endX}
                y2={endY}
                stroke={rayColor}
                strokeWidth="2.5"  // Slightly thicker rays
              />
            );
          })}
        </g>
        
        {/* Center circle with custom background - increased size */}
        <circle 
          cx="110" 
          cy={cardY + cardHeight / 2} 
          r="55" 
          fill={innerCircleColor} 
          stroke={rayColor} 
          strokeWidth="3" 
        />
        
        {/* Text with stroke */}
        {typeof text === 'string' ? (
          <text 
            x="110" 
            y={cardY + cardHeight / 2} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill={textColor} 
            stroke={textStrokeColor}
            strokeWidth={textStrokeWidth}
            fontSize={fontSize}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            className={textClassName}
            style={{ userSelect: "none" }}
          >
            {text}
          </text>
        ) : (
          // If text is a React node, render it in a foreignObject
          <foreignObject 
            x="55" 
            y={cardY + cardHeight / 2 - 55} 
            width="110" 
            height="110"
          >
            <div 
              className={cn("w-full h-full flex items-center justify-center", textClassName)}
              style={{ userSelect: "none" }}
            >
              {text}
            </div>
          </foreignObject>
        )}
        
        {/* Clip path for rays */}
        <defs>
          <clipPath id="containerClip">
            <rect 
              x="0" 
              y={cardY} 
              width="220" 
              height={cardHeight} 
              rx="15" 
              ry="15" 
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

export default PickCardContainer;
