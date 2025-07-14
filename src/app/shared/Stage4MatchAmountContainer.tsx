import * as React from "react";
import { SVGProps } from "react";

export interface CustomSVGProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;

  textColor?: string;
  circleColor?: string;
  circleTextColor?: string;
  strokeColor?: string;

  gradientStart?: string;
  gradientEnd?: string;
  borderGradientStart?: string;
  borderGradientEnd?: string;

  mainText?: string;
  circleText?: string;

  blurRadius?: number;
  strokeOpacity?: number;
  borderRadius?: number;

  isActive?: boolean;
}

const Stage4MatchAmountContainer: React.FC<CustomSVGProps> = ({
  width = 210,
  height = 59,

  isActive = false,

  textColor = "#EEF2F6",
  strokeColor = "#FFFFFF",
  borderGradientStart = "#04DA6A",
  borderGradientEnd = "#7E3CE0",
  blurRadius = 17,
  strokeOpacity = 0.56,
  borderRadius = 11.5,
  circleText = "P",
  className,
  style,
  ...props
}) => {
  // Inactive fallback gradients
  const inactiveGradientStart = "#505050";
  const inactiveGradientEnd = "#7E3CE0";

const resolvedMainText = props.mainText ?? "";
  const resolvedCircleColor = isActive ? props.circleColor ?? "#01642B" : "#7E3CE0";
  const resolvedCircleTextColor = isActive ? props.circleTextColor ?? "#FFFFFF" : "#FFFFFF";
  const resolvedGradientStart = isActive ? props.gradientStart ?? "#00EE57" : inactiveGradientStart;
  const resolvedGradientEnd = isActive ? props.gradientEnd ?? "#014320" : inactiveGradientEnd;

  const idSuffix = isActive ? "active" : "inactive";
  const clipPathId = `bgblur_clip_path_${idSuffix}`;
  const gradientId = `paint_linear_fill_${idSuffix}`;
  const borderGradientId = `paint_linear_stroke_${idSuffix}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 210 59"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      <foreignObject x={-34} y={-34} width={255} height={127}>
        <div
          style={{
            backdropFilter: `blur(${blurRadius}px)`,
            clipPath: `url(#${clipPathId})`,
            height: "100%",
            width: "100%",
          }}
        />
      </foreignObject>

      <rect
        data-figma-bg-blur-radius={blurRadius}
        x={-0.5}
        y={0.5}
        width={186}
        height={58}
        rx={borderRadius}
        transform="matrix(-1 0 0 1 186 0)"
        fill={`url(#${gradientId})`}
        stroke={`url(#${borderGradientId})`}
      />

      <text
        x="15"
        y="38"
        fill={textColor}
        fontSize="23"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        {resolvedMainText}
      </text>

      <circle
        cx={23}
        cy={23}
        r={23}
        transform="matrix(-1 0 0 1 210 7)"
        fill={resolvedCircleColor}
      />
      <circle
        cx={23}
        cy={23}
        r={22}
        transform="matrix(-1 0 0 1 210 7)"
        stroke={strokeColor}
        strokeOpacity={strokeOpacity}
        strokeWidth={2}
        style={{ mixBlendMode: "overlay" }}
      />

      <text
        x="187"
        y="36"
        textAnchor="middle"
        fill={resolvedCircleTextColor}
        fontSize="16"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        {circleText}
      </text>

      <defs>
        <clipPath id={clipPathId} transform="translate(34 34)">
          <rect
            x={-0.5}
            y={0.5}
            width={186}
            height={58}
            rx={borderRadius}
            transform="matrix(-1 0 0 1 186 0)"
          />
        </clipPath>

        <linearGradient
          id={gradientId}
          x1={92.9298}
          y1={0}
          x2={94.0702}
          y2={59}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={resolvedGradientStart} />
          <stop offset={1} stopColor={resolvedGradientEnd} />
        </linearGradient>

        <linearGradient
          id={borderGradientId}
          x1={274.225}
          y1={30}
          x2={0}
          y2={30}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={borderGradientStart} />
          <stop offset={1} stopColor={borderGradientEnd} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Stage4MatchAmountContainer;
