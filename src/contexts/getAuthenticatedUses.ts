import { salaryAxios } from "@/lib/axios";
// import axios from "axios";

import { useQuery } from "react-query";


export interface NoPinError {
  error: string;
  message: string;
  create_transaction_pin_link: string;
}

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
  wallet_details: Walletdetails;
}

interface Walletdetails {
  id: number;
  phone_number: string;
  account_number: string;
  balance: number;
  has_pre_funding: boolean;
  pre_funded_amount: number;
  created_at: string;
  updated_at: string;
  agent: number;
  bank: string;
}


export const getAuthenticatedUser = async (): Promise<UserDataTypes> => {
  const { data } = await salaryAxios.get("/agent/details/");
  return data ;
};

export const useUser = () =>
  useQuery("agent-details", getAuthenticatedUser, { retry: 2 });