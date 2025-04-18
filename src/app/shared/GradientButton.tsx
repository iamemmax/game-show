import * as React from "react";
import { cn } from "@/utils/classNames";

interface GradientButtonProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  text?: string;
  startColor?: string;
  endColor?: string;
  baseColor?: string;
  textColor?: string;
  className?: string;
}

const GradientButton = ({
  width = 148,
  height = 40,
  text = "SUBMIT",
  startColor = "#8EFE9B",
  endColor = "#03984A",
  baseColor = "#035D2E",
  textColor = "white",
  className,
  ...props
}: GradientButtonProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 148 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("cursor-pointer", className)}
    {...props}
  >
    <path
      d="M1.86861 17.6815C0.869999 8.23229 8.27814 0 17.78 0H130.032C139.601 0 147.03 8.3429 145.925 17.8476L145.072 25.1857C144.134 33.2531 137.301 39.3381 129.179 39.3381H18.5555C10.3699 39.3381 3.50438 33.1599 2.64411 25.0197L1.86861 17.6815Z"
      fill={baseColor}
    />
    <path
      d="M4.45025 15.3995C3.6328 8.27677 9.20252 2.03125 16.372 2.03125H132.306C139.53 2.03125 145.116 8.36726 144.211 15.5342L142.823 26.5343C142.065 32.5329 136.963 37.0312 130.917 37.0312H17.6344C11.5364 37.0312 6.40798 32.4578 5.71269 26.3995L4.45025 15.3995Z"
      fill={`url(#gradient-${text})`}
    />
    <g filter={`url(#filter-${text})`}>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={textColor}
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          fontFamily:"verdana",
        //   filter: `drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))`,
          WebkitTextStroke: "2px #00AF53" 
        }}
      >
        {text}
      </text>
    </g>
    <defs>
      <filter
        id={`filter-${text}`}
        x="0"
        y="0"
        width="100%"
        height="100%"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={4} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.00993986 0 0 0 0 0.385885 0 0 0 0 0.188134 0 0 0 1 0"
        />
        {/* <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" /> */}
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
      <linearGradient
        id={`gradient-${text}`}
        x1="50%"
        y1="0%"
        x2="50%"
        y2="100%"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={startColor} />
        <stop offset={1} stopColor={endColor} />
      </linearGradient>
    </defs>
  </svg>
);

export default GradientButton;