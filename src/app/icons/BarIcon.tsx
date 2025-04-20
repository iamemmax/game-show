import * as React from "react";
import { SVGProps } from "react";

const BarIcon = ({ stroke = "white", ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={14}
    viewBox="0 0 16 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15.1114 7.00152H6.22249M15.1114 0.779297H0.88916M15.1114 13.2237H0.88916"
      stroke={stroke}
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default BarIcon;
