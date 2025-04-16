"use client";

import { DM_Sans, Wix_Madefor_Display,Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils/classNames";
import FullscreenWrapper from "./components/AutoFullScreenMode";


const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const display = Wix_Madefor_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn(sans.variable, display.variable, outfit.variable)} lang="en">
      <body
        
        
      >
       <div className=" w-[100dw] h-[100dvh] overflow-y-auto  bg-[url('/images/salary-bg.png')] bg-no-repeat bg-cover bg-bottom">
<FullscreenWrapper/>
        {children}

        </div>
      </body>
    </html>
  );
}
