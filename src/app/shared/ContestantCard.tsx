import * as React from "react";
import { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  title?: string;
  subtitle?: string;
  isActive?: boolean;
  imageUrl?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  id?: string;
  gradientColors?: {
    startColor?: string;
    startOpacity?: number;
    midColor?: string;
    endColor?: string;
  };
};

const ContestantCard = ({
  title = "Your Title",
  subtitle = "Your Subtitle",
  isActive = true,
  imageUrl = "",
  backgroundColor = "#F1C40F",
  borderColor = "white",
  borderWidth = 1.68224,
  id = `contestant-${Math.random().toString(36).substring(2, 9)}`,
  gradientColors = {
    startColor: "#FFB804",
    startOpacity: 0.8,
    midColor: "#FEC124",
    endColor: "#E5AA18"
  },
  ...props
}: Props) => {
  const patternId = `pattern-${id}`;
  const filterId = `filter-${id}`;
  const activeFilterId = `active-filter-${id}`;
  const activeGradientId = `active-gradient-${id}`;
  const gradientId = `gradient-${id}`;

  const useDefaultBackground = backgroundColor === "gradient";

  return (
    <svg
      width={168}
      height={53}
      viewBox="0 0 168 53"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {imageUrl && (
          <pattern
            id={patternId}
            patternUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <image
              href={imageUrl}
              x="0"
              y="0"
              width="50"
              height="50"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        )}

        <filter 
          id={activeFilterId} 
          x="0" 
          y="0.710938" 
          width="168" 
          height="52" 
          filterUnits="userSpaceOnUse" 
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix 
            in="SourceAlpha" 
            type="matrix" 
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" 
            result="hardAlpha" 
          />
          <feMorphology 
            radius="13.4579" 
            operator="erode" 
            in="SourceAlpha" 
            result="effect1_dropShadow_406_3523" 
          />
          <feOffset dy="3.36449" />
          <feGaussianBlur stdDeviation="3.36449" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix 
            type="matrix" 
            values="0 0 0 0 0.444454 0 0 0 0 0.321389 0 0 0 0 0.745278 0 0 0 0.35 0" 
          />
          <feBlend 
            mode="normal" 
            in2="BackgroundImageFix" 
            result="effect1_dropShadow_406_3523" 
          />
          <feBlend 
            mode="normal" 
            in="SourceGraphic" 
            in2="effect1_dropShadow_406_3523" 
            result="shape" 
          />
        </filter>

        <linearGradient 
          id={gradientId} 
          x1="0" 
          y1="0" 
          x2="168" 
          y2="52" 
          gradientUnits="userSpaceOnUse"
        >
          <stop 
            offset="0" 
            stopColor={gradientColors.startColor} 
            stopOpacity={gradientColors.startOpacity} 
          />
          <stop 
            offset="0.5" 
            stopColor={gradientColors.midColor} 
          />
          <stop 
            offset="1" 
            stopColor={gradientColors.endColor} 
          />
        </linearGradient>
      </defs>

      <g filter={isActive ? `url(#${activeFilterId})` : undefined}>
        {/* Background */}
        {useDefaultBackground ? (
          <rect
            y="0.710938"
            width={168}
            height={52}
            rx={26}
            fill={`url(#${gradientId})`}
          />
        ) : (
          <rect
            y={0.710938}
            width={168}
            height={52}
            rx={26}
            fill={backgroundColor}
          />
        )}

        {/* Border */}
        <rect
          x={0.84}
          y={1.55}
          width={166.318}
          height={50.318}
          rx={25.1589}
          stroke={borderColor}
          strokeWidth={borderWidth}
          style={{ mixBlendMode: "overlay" }}
          shapeRendering="crispEdges"
        />

        {/* Title */}
        <text
          x={24}
          y={22}
          fontSize="12"
          fontWeight="bold"
          fill="white"
          fontFamily="Arial, sans-serif"
        >
          {title}
        </text>

        {/* Subtitle */}
        <text
          x={40}
          y={36}
          fontSize="10"
          fill="#EEF2F6"
          fontFamily="Arial, sans-serif"
        >
          {subtitle}
        </text>

        {/* Active Status Indicator */}
        {isActive && (
          <>
            <circle cx={29} cy={33} r={7} fill="white" opacity={0.15} />
            <circle 
              cx={29} 
              cy={33} 
              r={5} 
              fill="#04DA6A" 
              stroke="white" 
              strokeWidth={1.5} 
            />
          </>
        )}

        {/* Avatar */}
        <circle
          cx={142}
          cy={26}
          r={20}
          fill={imageUrl ? `url(#${patternId})` : "#ccc"}
        />
        <circle
          cx={142}
          cy={26}
          r={19}
          stroke="white"
          strokeOpacity={0.56}
          strokeWidth={2}
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
    </svg>
  );
};

export default ContestantCard;
