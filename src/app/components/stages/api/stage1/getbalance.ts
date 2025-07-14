import { salaryAxios, tokenlessAxios } from '@/lib/axios';
import {  useQuery } from 'react-query';

export interface balanceProp {
  status: string;
  message: string;
  data: Data;
}

interface Data {
  balances: Balance[];
}

interface Balance {
  contestant_id: number;
  contestant_attr: string;
  contestant_name: string;
  actual_balance: number;
  book_balance: number;
}
export const getWalletBalance = async (episode_id: number) => {
  if (!episode_id) return null;
  const response = await tokenlessAxios.post(`api/accounts/contestant_wallets/${episode_id}/`);
  return response?.data as  balanceProp 
    ;
};

export const useGetWalletBalance = (episode_id: number) =>
  useQuery({
    queryKey: ["get-wallet-balance", episode_id],
    queryFn: () => getWalletBalance(episode_id),
    enabled: !!episode_id,
    
  });
 
