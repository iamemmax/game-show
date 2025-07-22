import * as React from "react";
import { SVGProps } from "react";

interface StarProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  filled?: boolean;
  animated?: boolean;
  gradient?: boolean;
  gradientColors?: [string, string];
}

const FillStarIcon = ({
  size = 32,
  color = "#000000",
  strokeColor = "none",
  strokeWidth = 0,
  filled = true,
  animated = false,
  gradient = false,
  gradientColors = ["#FFD700", "#FFA500"],
  ...props
}: StarProps) => {
  const gradientId = `star-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? "animate-pulse hover:animate-spin" : ""}
      {...props}
    >
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
      )}
      <path
        d="M19.5445 1.65268L23.1536 7.52849C23.2522 7.687 23.3686 7.81558 23.4972 7.90979C23.6324 8.00734 23.7909 8.07938 23.9683 8.12261L30.784 9.76864C31.3394 9.91163 31.8293 10.1799 32.2283 10.5479C32.6418 10.9303 32.9543 11.4158 33.1361 11.9777C33.3212 12.5453 33.3556 13.1194 33.247 13.6659C33.1372 14.2157 32.8845 14.7366 32.4977 15.1911L27.9487 20.5271C27.8478 20.6546 27.7746 20.7887 27.7303 20.9273C27.6804 21.0847 27.6627 21.2576 27.6771 21.446L28.2147 28.3815C28.2601 28.9701 28.1581 29.5376 27.9232 30.0475C27.6882 30.5573 27.3213 31.004 26.8402 31.3532C26.3603 31.7024 25.8227 31.913 25.2485 31.9806C24.6899 32.0404 24.1312 31.9606 23.5914 31.7378L17.1603 29.0831C16.9929 29.0144 16.8233 28.9789 16.6548 28.9789C16.4863 28.9789 16.3156 29.0144 16.1494 29.0831L9.71933 31.7378C9.16844 31.9651 8.5987 32.0449 8.02564 31.9761C7.46255 31.903 6.93937 31.6935 6.4694 31.3532C5.98944 31.004 5.62255 30.5562 5.38646 30.0475C5.15147 29.5387 5.04949 28.9712 5.09494 28.3815L5.63253 21.446C5.64694 21.2576 5.6292 21.0847 5.57378 20.9128C5.51836 20.7521 5.43633 20.6147 5.3266 20.485L0.810834 15.1911C0.422882 14.7366 0.171267 14.2157 0.0615322 13.6659C-0.0470945 13.1194 -0.012733 12.5453 0.171267 11.9777C0.354159 11.4158 0.665629 10.9314 1.08018 10.5479C1.49031 10.1677 2.00019 9.895 2.57546 9.75534L9.33913 8.12261C9.51648 8.07938 9.6761 8.00734 9.81133 7.90979C9.93991 7.81558 10.0552 7.687 10.1527 7.52849L13.7939 1.60391C14.1043 1.09735 14.5222 0.696097 15.0143 0.421205C15.5054 0.146314 16.0629 0 16.6537 0C17.2445 0 17.8009 0.146314 18.2931 0.421205C18.7863 0.697206 19.2042 1.09735 19.5445 1.65268Z"
        fill={filled ? (gradient ? `url(#${gradientId})` : color) : "none"}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className={animated ? "transition-all duration-300 hover:scale-110" : ""}
      />
    </svg>
  );
};

export default FillStarIcon