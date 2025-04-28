import React from 'react';
import { cn } from '@/utils/classNames';

interface TextStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fill?: string;
  strokeWidth?: number;
  strokeColor?: string;
  yPosition?: number;
  className?: string;
}

interface PrizeCardProps {
  title: string;
  amount: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  gradientColors?: {
    start: string;
    end: string;
  };
  titleStyle?: TextStyle;
  amountStyle?: TextStyle;
  className?: string;
  titleClassName?: string;
  amountClassName?: string;
}

const PrizeCard: React.FC<PrizeCardProps> = ({ 
  title, 
  amount, 
  width = 220, 
  height = 70,  // Increased default height
  backgroundColor = "#C95700",
  gradientColors = {
    start: "#FEE800",
    end: "#F9A800"
  },
  titleStyle = {
    fontSize: 14,
    fontFamily: "gilroyMedium",
    fontWeight: "500",
    fill: "white",
    strokeWidth: 0,
    strokeColor: "none",
    yPosition: 35
  },
  amountStyle = {
    fontSize: 16,
    fontFamily: "gilroyHeavy",
    fontWeight: "700",
    fill: "white",
    strokeWidth: 0,
    strokeColor: "none",
    yPosition: 70
  },
  className,
  titleClassName,
  amountClassName
}) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 209 70" // Adjusted viewBox height to 70
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn('transition-all duration-200', className)}
    >
      {/* Outer path - adjusted height */}
      <path 
        d="M0 16C0 7.16343 7.16344 0 16 0H192.248C201.085 0 208.248 7.16344 208.248 16V53.9438C208.248 62.8023 201.051 69.9747 192.192 69.9437L15.9439 69.3253C7.12928 69.2944 0 62.1401 0 53.3254V16Z" 
        fill={backgroundColor}
      />
      
      {/* Inner path - adjusted height */}
      <path 
        d="M3 15.873C3 9.24563 8.37258 3.87305 15 3.87305H193.986C200.613 3.87305 205.986 9.24563 205.986 15.873V54.0611C205.986 60.714 200.573 66.0971 193.92 66.0609L14.9347 65.0865C8.33283 65.0505 3 59.6886 3 53.0866V15.873Z" 
        fill={`url(#${gradientId})`}
      />

      {/* Title Text */}
      <text
        x="50%"
        y={`${titleStyle.yPosition}%`}
        dominantBaseline="middle"
        textAnchor="middle"
        fill={titleStyle.fill}
        fontSize={titleStyle.fontSize}
        fontFamily={titleStyle.fontFamily}
        fontWeight={titleStyle.fontWeight}
        stroke={titleStyle.strokeColor}
        strokeWidth={titleStyle.strokeWidth}
        className={cn('select-none', titleClassName)}
      >
        {title}
      </text>

      {/* Amount Text */}
      <text
        x="50%"
        y={`${amountStyle.yPosition}%`}
        dominantBaseline="middle"
        textAnchor="middle"
        fill={amountStyle.fill}
        fontSize={amountStyle.fontSize}
        fontFamily={amountStyle.fontFamily}
        fontWeight={amountStyle.fontWeight}
        stroke={amountStyle.strokeColor}
        strokeWidth={amountStyle.strokeWidth}
        className={cn('select-none', amountClassName)}
      >
        {amount}
      </text>

      <defs>
        <linearGradient 
          id={gradientId} 
          x1="104.493" 
          y1="3.87305" 
          x2="104.493" 
          y2="65.0215" // Adjusted gradient end point
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={gradientColors.start}/>
          <stop offset="1" stopColor={gradientColors.end}/>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default PrizeCard;


