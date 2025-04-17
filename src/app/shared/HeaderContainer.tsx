import * as React from "react";
import { SVGProps } from "react";

interface CustomButtonSVGProps extends SVGProps<SVGSVGElement> {
  backgroundColor?: string;
  borderGradientStart?: string;
  borderGradientEnd?: string;
  textGradientStart?: string;
  textGradientEnd?: string;
  textColor?: string;
  text?: string;
  maskText?: boolean;
  fontSize?: number;
  fontFamily?: string;
  textStrokeColor?: string;
  textStrokeWidth?: number;
}

const HeaderTitleContainer = ({
  backgroundColor = "#051D13",
  borderGradientStart = "#04FE91",
  borderGradientEnd = "#7EFFE9",
  textGradientStart = "#04FE91",
  textGradientEnd = "#7EFFE9",
  textColor = "#FFFFFF",
  text = "CUSTOM BUTTON",
  maskText = false,
  fontSize = 24,
  fontFamily = "Arial",
  textStrokeColor = "#000",
  textStrokeWidth = 0,
  ...props
}: CustomButtonSVGProps) => {
  const masked = maskText ? "●".repeat(text.length) : text;

  return (
    <svg
      width={561}
      height={161}
      viewBox="0 0 561 161"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="buttonBackground" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={backgroundColor} />
          <stop offset="100%" stopColor={backgroundColor} />
        </linearGradient>

        <linearGradient id="borderGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={borderGradientStart} />
          <stop offset="100%" stopColor={borderGradientEnd} />
        </linearGradient>

        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={textGradientStart} />
          <stop offset="100%" stopColor={textGradientEnd} />
        </linearGradient>

        <filter
          id="glow_effect"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation={22} result="effect1_foregroundBlur" />
        </filter>
      </defs>

      {/* Outer Shape */}
      <g filter="url(#glow_effect)">
        <path
          d="M45.709 71.3029C40.5634 58.184 50.2361 44 64.328 44H496.073C510.325 44 520.004 58.4824 514.552 71.6506L500.889 104.651C497.795 112.126 490.501 117 482.411 117H77.2716C69.0445 117 61.6568 111.962 58.6527 104.303L45.709 71.3029Z"
          fill="url(#buttonBackground)"
        />
        <path
          d="M48.5019 70.2075C44.1281 59.0564 52.3499 47 64.328 47H496.073C508.188 47 516.414 59.31 511.78 70.503L498.118 103.503C495.487 109.857 489.287 114 482.411 114H77.2716C70.2786 114 63.999 109.718 61.4455 103.208L48.5019 70.2075Z"
          stroke="url(#borderGradient)"
          strokeWidth={6}
        />
      </g>

      {/* Inner Path */}
      <path
        d="M56.8284 76.9196C52.7031 65.814 60.9174 54 72.7645 54H479.676C491.653 54 499.875 66.0549 495.502 77.2057L482.563 110.206C480.01 116.717 473.73 121 466.736 121H85.0226C77.917 121 71.5609 116.581 69.0866 109.92L56.8284 76.9196Z"
        fill="url(#buttonBackground)"
        stroke="url(#borderGradient)"
        strokeWidth={6}
      />

      {/* Gradient Text with Stroke */}
      <text
        x="50%"
        y="57%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily={fontFamily}
        fontSize={fontSize}
        fontWeight="bold"
        stroke={textStrokeColor}
        strokeWidth={textStrokeWidth}
        fill="url(#textGradient)"
        style={{
          fill: textColor,
         WebkitTextStroke: `20px ${textStrokeColor}`
        }}
      >
        {masked}
      </text>
    </svg>
  );
};

export default HeaderTitleContainer;
