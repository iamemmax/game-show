import * as React from "react";

interface GradientIconProps {
  size?: number;
  strokeColor?: string;
  gradientColors?: {
    startColor?: string;
    midColor?: string;
    endColor?: string;
  };
  icon?: React.ReactNode;
}

const IconBoard = ({
  size = 48,
  strokeColor = "white",
  gradientColors = {
    startColor: "#780C4B",
    midColor: "#4E0754",
    endColor: "#E50CFD",
  },
  icon,
}: GradientIconProps) => {
  const gradientId = React.useId(); // <-- ✅ Unique per component instance

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={0.888889}
        y={0.888889}
        width={46.2222}
        height={46.2222}
        rx={23.1111}
        fill={`url(#${gradientId})`}
        style={{
          mixBlendMode: "multiply",
        }}
      />
      <rect
        x={0.888889}
        y={0.888889}
        width={46.2222}
        height={46.2222}
        rx={23.1111}
        stroke={strokeColor}
        strokeWidth={1.77778}
        style={{
          mixBlendMode: "overlay",
        }}
      />

      {/* Centered icon */}
      <g transform={`translate(${(48 - 16) / 2}, ${(48 - 16) / 2})`}>
        {icon || (
          <path
            d="M15 8H6M15 2H0M15 14H0"
            stroke={strokeColor}
            strokeWidth={1.33333}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>

      <defs>
        <linearGradient
          id={gradientId}
          x1={0}
          y1={48}
          x2={48}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={gradientColors.startColor} stopOpacity={0} />
          <stop offset={0.56} stopColor={gradientColors.midColor} />
          <stop offset={1} stopColor={gradientColors.endColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default IconBoard;
