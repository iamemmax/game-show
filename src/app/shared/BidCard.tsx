import * as React from "react";
import { SVGProps } from "react";

interface BidCardContainerProps extends SVGProps<SVGSVGElement> {
  title?: string; // Name
  subTitle?: string; // Label like "Bid:"
amount?: string; // Keep string version
  amountNode?: React.ReactNode; // Add this
  avatarUrl?: string;
  borderColor?: string;
  backgroundFill?: string;
  isActive?: boolean;
  borderWidth?: number;
  color?: string;
  subTitleClassName?: string;
  amountClassName?: string;
}

const BidCardContainer = ({
  color,
  title = "Mary",
  subTitle = "Bid:",
  amount = "₦12,000",
  avatarUrl = "/images/mary-avatar.png",
  borderColor = "#FFC125",
  backgroundFill = "#302339",
  borderWidth = 1.3,
  isActive = false,
  subTitleClassName = "",
  amountClassName = "",
  amountNode,
  ...props
}: BidCardContainerProps) => {
  const width = 290;
  const height = 104;
  const radius = height / 2;

  const activeColor = color || "#FFFFFF";
  const activeBorder = borderColor || "url(#gradient)";
  const inactiveBorder = "#5d400b";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <clipPath id="avatarClip">
          <circle cx={width - 52} cy={height / 2} r="32" />
        </clipPath>
        <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFC125" />
          <stop offset="100%" stopColor="#FEC124" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect
        x={0}
        y={0}
        rx={radius}
        ry={radius}
        width={width}
        height={height}
        fill={backgroundFill}
      />

      {/* Right border stroke */}
      <path
        d={`M ${radius},0 H ${width - radius} A ${radius},${radius} 0 0 1 ${width},${radius} V ${
          height - radius
        } A ${radius},${radius} 0 0 1 ${width - radius},${height} H ${radius}`}
        stroke={isActive ? activeBorder : inactiveBorder}
        strokeWidth={borderWidth}
        fill="none"
      />

      {/* Title (name) */}
      <text
        x="32"
        y="45"
        fill={activeColor}
        fontSize="20"
        fontWeight="600"
        fontFamily="Arial, sans-serif"
      >
        {title}
      </text>

      {/* Bid label */}
      {/* <text
        x="62"
        y="78"
        fill={activeColor}
        fontSize="20"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        className={subTitleClassName}
      >
        {subTitle}
      </text> */}

      {/* Amount */}
     <foreignObject x="32" y="53" width="200" height="40">
  <div  className="flex gap-1 items-center">
    <span className="text-white text-xl font-semibold">{subTitle}</span>
    {amountNode ? (
      <span className="text-white text-3xl font-bold">{amountNode}</span>
    ) : (
      <span className="text-white text-3xl font-bold">{amount}</span>
    )}
  </div>
</foreignObject>


      {/* Avatar Image */}
      <image
        href={avatarUrl}
        x={width - 84}
        y={height / 2 - 32}
        width="64"
        height="64"
        clipPath="url(#avatarClip)"
        preserveAspectRatio="xMidYMid slice"
      />
    </svg>
  );
};

export default BidCardContainer;
