"use client";

import React from "react";
import {
  salaryAxios,
  deleteAxiosDefaultToken,
  setAxiosDefaultToken,
} from "@/lib/axios";
import { tokenStorage } from "@/utils/auth";
import { ContestantDetails } from "@/types/types";

// Extended type for user with game_episode
interface ExtendedContestantDetails extends ContestantDetails {
  game_episode?: number;
}

// Define AuthState
interface AuthState {
  isAuthenticated: boolean;
  user: ExtendedContestantDetails | null;
  isLoading: boolean;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
}

// Define AuthAction
type AuthAction = 
  | { type: "LOGIN"; payload: ExtendedContestantDetails }
  | { type: "LOGOUT" }
  | { type: "STOP_LOADING" };

// Define AuthDispatch
type AuthDispatch = React.Dispatch<AuthAction> | null;

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isAdminAuthenticated: false,
  isAdminLoading: true
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isAuthenticated: true, user: action.payload };

    case "LOGOUT":
      tokenStorage.clearToken();
      return { ...state, isAuthenticated: false, user: null };

    case "STOP_LOADING":
      return { ...state, isLoading: false };

    default:
      return state;
  }
};

// Create the context and export it
export const AuthContext = React.createContext<{
  authState: AuthState;
  authDispatch: AuthDispatch;
}>({
  authState: initialAuthState,
  authDispatch: null
});

// Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, authDispatch] = React.useReducer(
    authReducer,
    initialAuthState
  );

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = tokenStorage.getToken();

        if (token === null || token === undefined) {
          authDispatch({ type: "STOP_LOADING" });
          return;
        }

        setAxiosDefaultToken(token, salaryAxios);

        const user = tokenStorage.getUser();
        if (user) {
          authDispatch({ type: "LOGIN", payload: user });
        }
      } catch (err) {
        tokenStorage.clearToken();
        deleteAxiosDefaultToken();
      } finally {
        authDispatch({ type: "STOP_LOADING" });
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, authDispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create and export the hook
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


