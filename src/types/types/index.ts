import { ReactElement, ReactNode } from 'react';

import type { NextPage } from 'next';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};



export interface UserDataTypes {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  agent_code: string;
  email: string;
  location: string;
  account_number: string;
  has_pre_funding: boolean;
  pre_funded_amount: number;
  created_at: string;
  updated_at: string;
}

export type ToastNotification = 'success' | 'error' | 'neutral';

export interface Root {
  dashData: GenericObject;
}

type GenericObject = { [key: string]: unknown };


export type AuthState = {
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  user: ContestantDetails | null;
  isLoading: boolean;
  isAdminLoading: boolean;
};

export type AuthAction =
  | { type: "LOGIN"; payload: ContestantDetails }
  | { type: "LOGOUT" }
  | { type: "STOP_LOADING" };

export type AuthDispatch = React.Dispatch<AuthAction> | null;

export interface ContestantDetails {
  name: string;
  contestant_id: number;
  contestant_attr: string;
  contestant_photo_url:string
}
