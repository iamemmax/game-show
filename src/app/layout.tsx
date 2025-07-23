"use client";

import { DM_Sans, Wix_Madefor_Display, Outfit, Montserrat, Platypi,Luckiest_Guy, Anton } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils/classNames";
import FullscreenWrapper from "./components/AutoFullScreenMode";
import ReactQueryProvider from "@/lib/reactQuery";
import { AuthProvider } from "@/contexts/authentication";
import ProtectedRouteGuard from "@/contexts/ProtectedRouteGuard";
import { Suspense } from "react";
import { Wrapper } from "@/contexts/Wrapper";
import { MQTTProvider } from "@/contexts/MQTTProvider";

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
  weight: "400"
});
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
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
const platypi = Platypi({
  subsets: ["latin"],
  variable: "--font-platypi",
  display: "swap",
});


const lucky = Luckiest_Guy({
  subsets: ["latin"],
  variable: "--font-lucky",
  display: "swap",
  weight: "400", // Luckiest Guy only has one weight: 400
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(sans.className, display.variable, outfit.variable, montserrat.variable, platypi.variable, lucky.variable, anton.variable)}
      lang="en"
    >
      <body>
        <div className="w-[100dw] h-[100vh] overflow-y-auto bg-[url('/images/salary-bg.png')] bg-no-repeat bg-cover bg-bottom">
          <ReactQueryProvider>
            <AuthProvider>
              <MQTTProvider>
                <ProtectedRouteGuard>
                  <Suspense fallback={<></>}>
                  
                    <FullscreenWrapper />
                    <Wrapper>{children}</Wrapper>
                  </Suspense>
                </ProtectedRouteGuard>
              </MQTTProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </div>
      </body>
    </html>
  );
}





