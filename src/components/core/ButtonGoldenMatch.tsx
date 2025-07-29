import { cn } from "@/utils/classNames";

interface Props {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  variant: "ORANGE" | "PURPLE";
}
const GoldenMatchButton = ({
  children,
  className,
  variant = "ORANGE",
  containerClassName,
}: Props) => {
  const fillColor = variant == "ORANGE" ? "#E05F02" : "#4BO75F";
  const strokeColor = variant == "ORANGE" ? "#E56C01" : "#3f044e";
  const stroke2Color = variant == "ORANGE" ? "#EE8200" : "#6f0388";
  const gradientStart = variant == "ORANGE" ? "#F39200" : "#9203ae";
  const gradientStop = variant == "ORANGE" ? "#E26301" : "#9203ae";


  return (
    <div
      className={cn(
        "min-w-[226px] min-h-[60px] relative inline-flex items-center justify-center text-center transition-all duration-300 hover:opacity",
        containerClassName
      )}
      // {...props}
    >
      <svg
        className="absolute inset-0"
        width={226}
        height={60}
        viewBox="0 0 226 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={3.5}
          y={3.5}
          width={218.984}
          height={53}
          rx={26.5}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={7}
        />
        <rect
          x={6.84766}
          y={4.14941}
          width={212.282}
          height={51.7003}
          rx={25.8502}
          fill="url(#paint0_linear_4235_8212)"
          stroke={stroke2Color}
          strokeWidth={4}
        />
        <defs>
          <linearGradient
            id="paint0_linear_4235_8212"
            x1={113.191}
            y1={2.14941}
            x2={113.191}
            y2={39.0875}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={gradientStart} />
            <stop offset={1} stopColor={gradientStop} />
          </linearGradient>
        </defs>
      </svg>

      <div className={cn("relative py-1 px-4 z-10", className)}>{children}</div>
    </div>
  );
};

export default GoldenMatchButton;
