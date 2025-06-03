import { salaryAxios } from '@/lib/axios';
import {  useQuery } from 'react-query';




export interface hustleRevealProps {
  status: string;
  message: string;
  data: Datum[];
}

interface Datum {
  contestant_id: number;
  contestant_details: Contestantdetails;
  reveals: Reveal[];
}

export interface Reveal {
  id: number;
  hustle_name: string;
  hustle_number: number;
  hustle_state: string;
  hustle_amount: number;
}

interface Contestantdetails {
  name: string;
  constestant_attr: string;
  phone_number: string;
  final_pot: number;
  eliminated_stage: null | string;
}

export const getHustleReveal = async (episode_id: number) => {
  if (!episode_id) return null;
  const response = await salaryAxios.post(`api/game/get_hustle_reveal/${episode_id}`);
  return response?.data as hustleRevealProps;
};

export const useGetHustleReveal = (episode_id: number) =>
  useQuery({
    queryKey: ["all-hustle-reveals", episode_id],
    queryFn: () => getHustleReveal(episode_id),
    enabled: !!episode_id,
    // refetchInterval: 1000, // Refetch every second
    staleTime: 0, // Consider data stale immediately
    cacheTime: 0, // Don't cache the data
  });
 
