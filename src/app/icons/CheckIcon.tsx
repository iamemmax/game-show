import * as React from "react";
import { SVGProps } from "react";

interface CustomSVGProps extends SVGProps<SVGSVGElement> {
  backgroundColor?: string;
  checkColor?: string;
  size?: number;
}

const CheckIcon = ({
  backgroundColor = "#10A151",
  checkColor = "white",
  size = 15,
  ...props
}: CustomSVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7.5 13.75C10.9518 13.75 13.75 10.9518 13.75 7.5C13.75 4.04822 10.9518 1.25 7.5 1.25C4.04822 1.25 1.25 4.04822 1.25 7.5C1.25 10.9518 4.04822 13.75 7.5 13.75Z"
      fill={backgroundColor}
    />
    <path
      d="M6.61289 9.7375C6.48789 9.7375 6.36914 9.6875 6.28164 9.6L4.51289 7.83125C4.33164 7.65 4.33164 7.35 4.51289 7.16875C4.69414 6.9875 4.99414 6.9875 5.17539 7.16875L6.61289 8.60625L9.82539 5.39375C10.0066 5.2125 10.3066 5.2125 10.4879 5.39375C10.6691 5.575 10.6691 5.875 10.4879 6.05625L6.94414 9.6C6.85664 9.6875 6.73789 9.7375 6.61289 9.7375Z"
      fill={checkColor}
    />
  </svg>
);

export default CheckIcon;