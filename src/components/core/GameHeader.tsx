'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/utils/classNames";
import { GlowyStrokeText } from "./GlowyText";

interface GameHeaderProps {
  text: string;
  className?: string;
  padding?: string;
}

export function GameHeader({
  className,
  text,
  padding = "px-6 py-4",
}: GameHeaderProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);

  // Measure the actual rendered text width
  useLayoutEffect(() => {
    if (textRef.current) {
      const width = textRef.current.offsetWidth;
      setTextWidth(width);
    }
  }, [text]);

  const minSvgWidth = 250;
  const basePadding = 60;
  const svgWidth = Math.max(textWidth + basePadding, minSvgWidth);
  const svgHeight = 73;

  return (
    <div className={cn("relative inline-block", className)}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={`M20 3H${svgWidth - 20}C${svgWidth - 8} 3 ${svgWidth} 14 ${svgWidth - 4} 25L${svgWidth - 16} 60C${svgWidth - 20} 67 ${svgWidth - 30} 70 ${svgWidth - 38} 70H38C30 70 20 66 16 60L4 25C0 14 10 3 20 3Z`}
          fill="#13051E"
          stroke="url(#glowStroke)"
          strokeWidth={6}
        />
        <defs>
          <linearGradient
            id="glowStroke"
            x1="0"
            y1="73"
            x2={svgWidth}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FE04FD" />
            <stop offset={1} stopColor="#E97EFF" />
          </linearGradient>
        </defs>
      </svg>

      <div
        ref={textRef}
        className={cn("absolute z-10 inset-0 flex items-center justify-center", padding)}
      >
        <GlowyStrokeText
          className="text-center whitespace-nowrap"
          glowIntensity="high"
          strokeWidth={5}
        >
          {text}
        </GlowyStrokeText>
      </div>
    </div>
  );
}
