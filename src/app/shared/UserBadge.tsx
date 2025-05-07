import * as React from "react";
import { SVGProps } from "react";
import Image from "next/image";

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
  correctAnswerColor?:string
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
  isActive = true,
  className,
  correctAnswerColor="#04DA6A",
  ...props
}: UserBadgeProps) => {
  const width = 157;
  const height = 53;
  const radius = 26;
  const clipId = React.useId();
  
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
        fill={isActive ? activeBg : inactiveBg}
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
      <text
        x={20}
        y={height * 0.4}
        fill={isActive ? "#9D8AA8" : inactiveColor}
        fontSize={14}
        fontFamily="Arial, sans-serif"
      >
        {username}
      </text>
      
      {/* Amount */}
      <text
        x={35}
        y={height * 0.8}
        fill={isActive ? activeColor : inactiveColor}
        fontSize={18}
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {amount}
      </text>
      
      {/* Online indicator */}
    
        <circle 
          cx={22} 
          cy={height * 0.64} 
          r={5} 
          fill={correctAnswerColor} 
         
        />
      
      
      {/* Avatar */}
      <foreignObject 
        x={avatarX} 
        y={avatarY} 
        width={avatarSize} 
        height={avatarSize} 
        clipPath={`url(#${clipId})`}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Image
            src={avatarUrl}
            alt={`${username}'s avatar`}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </foreignObject>
    </svg>
  );
};

export default UserBadge;


