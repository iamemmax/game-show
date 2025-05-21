import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/classNames";
import { GlowyStrokeText } from "./GlowyText";
import { darkenColor } from "@/utils/colors";
import { TrapeziumButtonPattern } from "./ButtonTrapezium.Patterns";


const trapeziumVariants = cva(
  "relative inline-flex items-center justify-center text-center transition-all duration-300 hover:opacity-90 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        red: "text-white",
        green: "text-white",
        yellow: "text-white",
        blue: "text-white",
        purple: "text-white",
        custom: "",
      },
      size: {
        default: "h-14 px-0 py-5 px-2 text-base",
        sm: "h-8 px-0 py-4 text-sm min-h-[38px]",
        lg: "h-16 px-4 py-4 text-lg",
        xl: "h-14 px-12 py-5 text-xl",
      },
      glowIntensity: {
        none: "",
        low: "",
        medium: "",
        high: "",
      },
    },
    defaultVariants: {
      variant: "red",
      size: "default",
      glowIntensity: "medium",
    },
  }
);

export interface TrapeziumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof trapeziumVariants> {
  children: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  glowColor?: string;
  // patternImageHref is removed from here
}

export const TrapeziumButton = React.forwardRef<HTMLButtonElement, TrapeziumButtonProps>(
  (
    {
      className,
      variant, // We'll use this to determine the pattern
      size,
      glowIntensity,
      children,
      backgroundColor,
      borderColor,
      textColor,
      glowColor,
      ...props
    },
    ref
  ) => {
    // Define color presets based on variant
    const getColors = () => {
      const colorMap = {
        red: {
          bg: "#c82333",
          border: "#9e1c28",
          text: "#ffffff",
          glow: "#ff4d4d",
        },
        green: {
          bg: "#28a745",
          border: "#1e7e34", // Using a greener border for consistency
          text: "#ffffff",
          glow: "#5cff5c",
        },
        yellow: {
          bg: "#ffc107",
          border: "#d39e00",
          text: "#000000",
          glow: "#ffe066",
        },
        blue: {
          bg: "#007bff",
          border: "#0062cc",
          text: "#ffffff",
          glow: "#66b3ff",
        },
        purple: {
          bg: "#6f42c1",
          border: "#59339d",
          text: "#ffffff",
          glow: "#b388ff",
        },
        custom: {
          bg: backgroundColor || "#3a3a3a",
          border: borderColor || darkenColor(backgroundColor || "#3a3a3a", 20),
          text: textColor || "#ffffff",
          glow: glowColor || backgroundColor || "#3a3a3a",
        },
      };

      return variant && colorMap[variant] ? colorMap[variant] : colorMap.custom;
    };

    const colors = getColors();

    const currentPatternImageHref = TrapeziumButtonPattern

    // Generate unique IDs for the SVG elements
    const gradientId = React.useId();
    const maskId = React.useId();
    const patternId = React.useId();
    const imageId = React.useId();


    return (
      <button
        className={cn(trapeziumVariants({ variant, size, glowIntensity, className }))}
        ref={ref}
        {...props}
      >
        <svg
          className="absolute inset-0 w-full h-full min-h-[30px]"
          viewBox="0 0 138 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          preserveAspectRatio="none"
        >
          {/* Outer shape (border) - Assuming this is the solid background path */}
          <path
            d="M1.2868 12.3761C0.598731 5.75846 5.7895 0 12.4429 0H124.951C131.651 0 136.856 5.83467 136.095 12.4907L134.411 27.212C133.763 32.8765 128.969 37.1537 123.268 37.1537H13.9735C8.22804 37.1537 3.41161 32.8121 2.81743 27.0974L1.2868 12.3761Z"
            fill={colors.border} // Dynamic border color
          />
          {/* Inner shape (main fill with gradient) */}
          <path
            d="M4.14556 10.9473C3.58308 5.95964 7.48546 1.59244 12.5047 1.59244H125.686C130.742 1.59244 134.656 6.02191 134.034 11.0402L132.039 27.1234C131.516 31.3366 127.936 34.5 123.691 34.5H14.3185C10.0374 34.5 6.43908 31.2847 5.95932 27.0305L4.14556 10.9473Z"
            fill={`url(#${gradientId})`} // Reference dynamic gradient ID
          />
          {/* Mask for effects/patterns */}
          <mask
            id={maskId}
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x={1}
            y={0}
            width={100}
            height={38}
          >
            <path
              d="M1.28753 12.3765C0.599463 5.75884 5.79023 0.00038147 12.4436 0.00038147H124.952C131.652 0.00038147 136.857 5.83505 136.096 12.4911L134.412 27.2124C133.764 32.8768 128.97 37.1541 123.268 37.1541H13.9742C8.22878 37.1541 3.41234 32.8125 2.81816 27.0978L1.28753 12.3765Z"
              fill="#C95700" // This fill for the mask itself doesn't typically affect the final color
            />
          </mask>
          {/* Group for mixBlendMode and pattern */}
          <g mask={`url(#${maskId})`}>
            <g style={{ mixBlendMode: "screen" }} opacity={0.3}>
              <rect
                x={1.5459}
                y={0.00038147}
                width={135.978}
                height={37.1537}
                rx={11.2162}
                fill={`url(#${patternId})`} // Reference dynamic pattern ID
              />
            </g>
          </g>
          <defs>
            <pattern
              id={patternId} // Dynamic ID
              patternContentUnits="objectBoundingBox"
              width={0.52788}
              height={1.93198}
            >
              <use xlinkHref={`#${imageId}`} transform="scale(0.00239945 0.00878174)" />
            </pattern>
            <linearGradient
              id={gradientId} // Dynamic ID
              x1={69.1482}
              y1={1.59244}
              x2={69.1482}
              y2={34.5}
              gradientUnits="userSpaceOnUse"
            >
              {/* These gradient stop colors are hardcoded from your Figma SVG.
                  If they need to change per variant, you'll need to make them dynamic.
                  Example:
                  <stop stopColor={variant === 'red' ? '#ff4d4d' : '#8EFE9B'} />
                  <stop offset={1} stopColor={variant === 'red' ? '#c82333' : '#03984A'} />
                  Or define them within your `colorMap` if more complex.
                  */}
                  <stop stopColor={
                    variant === 'red' ? '#ff4d4d' :
                    variant === 'green' ? '#8EFE9B' :
                    variant === 'yellow' ? '#fff6b7' :
                    variant === 'blue' ? '#66b3ff' :
                    variant === 'purple' ? '#b388ff' :
                    colors.glow
                  } />
                  <stop offset={1} stopColor={
                    variant === 'red' ? '#c82333' :
                    variant === 'green' ? '#03984A' :
                    variant === 'yellow' ? '#ffc107' :
                    variant === 'blue' ? '#007bff' :
                    variant === 'purple' ? '#6f42c1' :
                    colors.bg
                  } />
              {/* <stop stopColor={variant === 'red' ? '#ff4d4d' : '#8EFE9B'} /> */}
              {/* <stop offset={1} stopColor={variant === 'red' ? '#c82333' : '#03984A'} /> */}
            </linearGradient>
            <image
              id={imageId} // Dynamic ID
              width={220}
              height={220}
              preserveAspectRatio="none"
              xlinkHref={currentPatternImageHref} // Now dynamic based on variant
            />
          </defs>
        </svg>

        {/* Button content with glow effect */}
        <div className="relative py-1 px-4 z-10">
          <GlowyStrokeText
            glowColor={colors.glow}
            strokeColor={darkenColor(colors.bg, 30)}
            fillColor={colors.text}
            glowIntensity={glowIntensity || "none"}
            strokeWidth={3}
          >
            {children}
          </GlowyStrokeText>
        </div>
      </button>
    );
  }
);

TrapeziumButton.displayName = "TrapeziumButton";