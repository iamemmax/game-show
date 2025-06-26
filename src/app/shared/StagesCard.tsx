import * as React from "react";
import { SVGProps } from "react";
import MedalIcon from "../icons/MedalIcon";
import Trophy from "../icons/Trophy";

interface StagesCardProps extends SVGProps<SVGSVGElement> {
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  iconText?: string;
  title?: string;
  subTitle?: string;
  backgroundFill?: string;
  customDefs?: React.ReactNode;
  isActive?: boolean;
  finalStage?: boolean;
  showIcon?: boolean;
  className?: string; // new className prop
}

const StagesCard = ({
  color,
  borderColor,
  borderWidth = 0.7,
  iconText = "1",
  title = "Stage 1",
  subTitle = "Grind & Grow",
  finalStage = false,
  backgroundFill,
  customDefs,
  isActive = false,
  showIcon = true,
  className, // destructure className
  ...props
}: StagesCardProps) => {
  const width = 157;
  const height = 53;
  const radius = 26;

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
      className={className} // apply className to svg element
      {...props}
    >
      {customDefs}

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

      {/* Medal */}
      {showIcon && (
        <g transform="translate(10, 10)">
          {finalStage ? (
            <Trophy height={32} width={32} />
          ) : (
            <MedalIcon width={32} height={32} text={iconText} />
          )}
        </g>
      )}

      {/* Text */}
      <text
        x="50"
        y="24"
        fill={isActive ? activeColor : inactiveColor}
        fontSize="14"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {title}
      </text>

      <text
        x="50"
        y="40"
        fill={isActive ? activeColor : inactiveColor}
        fontSize="12"
        fontFamily="Arial, sans-serif"
        opacity="0.7"
      >
        {subTitle}
      </text>

      {/* Accent sparkle */}
      <path
        d="M132.732 10.9824L135.649 9.35335L138.945 13.2003L137.992 16.8729L132.732 10.9824Z"
        fill="white"
        fillOpacity={0.5}
      />
    </svg>
  );
};

export default StagesCard;