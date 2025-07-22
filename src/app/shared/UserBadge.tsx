import * as React from "react";
import { SVGProps } from "react";
import Image from "next/image";
import { cn } from "@/utils/classNames";

interface UserBadgeProps extends SVGProps<SVGSVGElement> {
  username?: string;
  amount?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  backgroundFill?: string;
  customDefs?: React.ReactNode;
  isActive?: boolean;
  className?: string;
  correctAnswerColor?: string;
  usernameClassName?: string;
  amountClassName?: string;
  // Add new props for dot positioning
  dotPosition?: { x?: number; y?: number };
  dotRadius?: number;
  showDot?: boolean;
  backgroundGradient?: {
    startColor: string;
    middleColor?: string; // Add middle color option
    endColor: string;
    direction: "horizontal" | "vertical";
  };
  textGradient?: {
    startColor: string;
    endColor: string;
    direction: "horizontal" | "vertical";
  };
  route?:string;
}

const UserBadge = ({
  username = "Marvin",
  amount = "₦0.16",
  avatarUrl = "/images/userImage.png",
  isOnline = true,
  color,
  borderColor,
  borderWidth = 0.4,
  backgroundFill,
  customDefs,
  isActive = false,
  className,
  correctAnswerColor = "#04DA6A",
  usernameClassName,
  amountClassName,
  // Add new props with default values
  dotPosition = { x: 22, y: undefined },
  dotRadius = 5,
  showDot = true,
  backgroundGradient,
  route,
  textGradient,
  ...props
}: UserBadgeProps) => {
  const width = 157;
  const height = 53;
  const radius = 26;
  const clipId = React.useId();
  const bgGradientId = React.useId();
  const textGradientId = React.useId();
  
  // Avatar dimensions and position
  const avatarSize = 36;
  const avatarX = width - avatarSize - 14;
  const avatarY = (height - avatarSize) / 2;
  
  // Fallback styles based on active/inactive
  const activeColor = color || "#FFFFFF";
  const inactiveColor = "#AAAAAA";
  const activeBorder = borderColor || "url(#gradient)";
  const inactiveBorder = "#5d400b";
  const activeBg = backgroundFill || "rgba(255, 255, 255, 0.1)";
  const inactiveBg = "rgba(255, 255, 255, 0.05)";
  
  // Determine if we're using gradients - only apply when active
  const useBackgroundGradient = isActive && backgroundGradient;
  const useTextGradient = isActive && textGradient;
  
  // Calculate dot position with defaults
  const dotX = dotPosition.x ?? 22;
  const dotY = dotPosition.y ?? height * 0.64;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {customDefs || (
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
          
          {useBackgroundGradient && (
            <linearGradient 
              id={bgGradientId} 
              x1="0%" 
              y1={backgroundGradient.direction === "vertical" ? "0%" : "50%"} 
              x2={backgroundGradient.direction === "vertical" ? "50%" : "100%"} 
              y2={backgroundGradient.direction === "vertical" ? "100%" : "50%"}
            >
              <stop offset="0%" stopColor={backgroundGradient.startColor} />
              {backgroundGradient.middleColor && (
                <stop offset="50%" stopColor={backgroundGradient.middleColor} />
              )}
              <stop offset="100%" stopColor={backgroundGradient.endColor} />
            </linearGradient>
          )}
          
          {useTextGradient && (
            <linearGradient 
              id={textGradientId} 
              x1="0%" 
              y1={textGradient.direction === "vertical" ? "0%" : "50%"} 
              x2={textGradient.direction === "vertical" ? "50%" : "100%"} 
              y2={textGradient.direction === "vertical" ? "100%" : "50%"}
            >
              <stop offset="0%" stopColor={textGradient.startColor} />
              <stop offset="100%" stopColor={textGradient.endColor} />
            </linearGradient>
          )}
          
          <clipPath id={clipId}>
            <circle cx={avatarX + avatarSize/2} cy={height/2} r={avatarSize/2} />
          </clipPath>
        </defs>
      )}

      {/* Background */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={radius}
        fill={useBackgroundGradient ? `url(#${bgGradientId})` : (isActive ? activeBg : inactiveBg)}
      />

      {/* Border (no left side) */}
      <path
        d={`
          M ${radius},0
          H ${width - radius}
          A ${radius},${radius} 0 0 1 ${width},${radius}
          V ${height - radius}
          A ${radius},${radius} 0 0 1 ${width - radius},${height}
          H ${radius}
        `}
        stroke={isActive ? activeBorder : inactiveBorder}
        strokeWidth={borderWidth}
        fill="none"
      />
      
      {/* Username */}
      <foreignObject x={20} y={height * 0.3 - 10} width={width - avatarSize - 40} height={20}>
        <div 
          className={cn(
            "text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap",
            isActive ? "text-[#9D8AA8]" : "text-[#AAAAAA]",
            usernameClassName
          )}
          style={{ 
            fontFamily: "Arial, sans-serif",
            lineHeight: "1",
            color: isActive ? activeColor : inactiveColor,
          }}
        >
          {username}
        </div>
      </foreignObject>
      
      {/* Amount */}
      <foreignObject className="" x={35} y={height * 0.8 - 15} width={route === "hustle-board" ? width : width - avatarSize - 60} height={30}>
        <div 
          className={cn(
            `text-base font-bold ${route === "hustle-board" ? "" : "overflow-hidden"} overflow-hidden text-ellipsis whitespace-nowrap`,
            isActive ? "text-white" : "text-[#AAAAAA]",
            amountClassName
          )}
          style={{ 
            fontFamily: "Arial, sans-serif",
            lineHeight: "1",
            color: isActive ? "#FFFFFF" : inactiveColor,
          }}
        >
          {amount}
        </div>
      </foreignObject>
      
      {/* Online indicator - only render if showDot is true */}
      {showDot && (
        <circle 
          cx={dotX} 
          cy={dotY} 
          r={dotRadius} 
          fill={correctAnswerColor} 
        />
      )}
      
      {/* Avatar */}
    
    </svg>
  );
};

export default UserBadge;













