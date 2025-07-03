import React from "react";

type GreenBadgeSVGProps = {
  text: string;
  amount?: string | number;
  fontSize?: number | string;
  color?: string;
  className?: string;
  backgroundGradient?: {
    startColor: string;
    endColor: string;
  };
  gradientId?: string; // ← new prop
  badgeColor?: string;
  style?: React.CSSProperties;
};

const StageTallyCard: React.FC<GreenBadgeSVGProps> = ({
  text,
  amount,
  fontSize = 25,
  color = "#083718",
  className = "",
  backgroundGradient = { startColor: "", endColor: "" },
  badgeColor = "#035D2E",
   gradientId= `tally-${Math.random().toString(36).substring(2, 9)}`,
  style,
  ...props
}) => (
  <svg
    width="450"
    height="60"
    viewBox="0 0 675 94"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block", ...style }}
    {...props}
  >
    {/* Outer path */}
    <path 
      d="M4.80531 19.7776C2.35805 9.70522 9.98758 0 20.353 0H654.161C664.677 0 672.334 9.97163 669.619 20.1312L657.314 66.169C655.444 73.1688 649.102 78.0377 641.857 78.0377H31.5386C24.1572 78.0377 17.7337 72.9881 15.991 65.8153L4.80531 19.7776Z" 
      fill={badgeColor}
    />
    
    {/* Inner path with gradient */}
    <path 
      d="M18.3574 18.594C16.7201 11.1102 22.4193 4.0293 30.0801 4.0293H648.394C656.158 4.0293 661.878 11.2893 660.061 18.837L645.801 78.0942C644.503 83.4861 639.68 87.2864 634.134 87.2864H43.0443C37.4052 87.2864 32.5269 83.36 31.3216 77.8511L18.3574 18.594Z" 
      fill={`url(#badge-gradient-${gradientId})`}
    />
    
    {/* Drop shadow filter */}
    <filter
      id={gradientId}
      x="0"
      y="0"
      width="100%"
      height="100%"
      filterUnits="userSpaceOnUse"
    >
      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#137839" floodOpacity="0.25" />
    </filter>
    
    {/* Main text */}
    <text
  x={amount ? "33%" : "50%"}
  y="56%"
  textAnchor="middle"
  dominantBaseline="middle"
  fontWeight="bold"
  fontSize={fontSize}
  fill={color} // Inner text color
  stroke={badgeColor} // Outline color
  strokeWidth="2" // Adjust as needed
  filter="url(#text-shadow)"
  style={{
    // fontFamily: "Inter, Arial, sans-serif",
    letterSpacing: 1,
    userSelect: "none",
  }}
>
  {text}
</text>
    
    {/* Amount text if provided */}
    {amount && (
     <text
     x="75%"
     y="56%"
     textAnchor="middle"
     dominantBaseline="middle"
     fontWeight="bold"
     fontSize={Number(fontSize) + 4}
     fill={color}
     stroke={badgeColor}
     strokeWidth="2"
     filter="url(#text-shadow)"
     className="font-lucky"
     style={{
      //  fontFamily: "Inter, Arial, sans-serif",
       letterSpacing: 1,
       userSelect: "none"
     }}
   >
     {amount}
   </text>
   
    )}
    
    {/* Gradient definition */}
    <defs>
      <linearGradient 
        id={`badge-gradient-${gradientId}`} 
        x1="339.398" 
        y1="4.0293" 
        x2="339.398" 
        y2="87.2864" 
        gradientUnits="userSpaceOnUse"
        // id={`${gradientId}-badge-gradient`}
      >
        <stop id={gradientId} stopColor={backgroundGradient.startColor} />
        <stop id={gradientId} offset="1" stopColor={backgroundGradient.endColor} />
      </linearGradient>
    </defs>
  </svg>
);

export default StageTallyCard;
