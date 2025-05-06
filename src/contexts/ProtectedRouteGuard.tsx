"use client";

import * as React from "react";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/authentication"
import Logo from "@/app/icons/Logo";


interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRouteGuard({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authState } = useAuth();

  const protectedRoutes = ["/",]; // Define your protected routes here

  const { isAuthenticated, isLoading } = authState;

  const path = pathname; // Access pathname using useRouter

  // const { data, isError, error } = useUser();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && protectedRoutes.includes(path)) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, path, router]);

  if ((isLoading || !isAuthenticated) && protectedRoutes.includes(path)) {
    return (
      <div className="flex h-screen w-screen bg-[url('/images/landing-page/background-loading.jpg')] bg-no-repeat bg-cover bg-center items-center justify-center">
        <div className="flex h-screen w-screen  backdrop-blur-md bg-[#080D27]/90 items-center justify-center">
        <Logo/>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
