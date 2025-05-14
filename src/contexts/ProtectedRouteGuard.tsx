"use client";

import * as React from "react";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/authentication"
import Logo from "@/app/icons/Logo";
import Loader from "@/app/shared/Loader";


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
        <div className="bg-black rounded-lg p-6 flex flex-col items-center justify-center">
          <Loader/>
          <p className="text-white py-4 text-sm">Loading Game ...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
