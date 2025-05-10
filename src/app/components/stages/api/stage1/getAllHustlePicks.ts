import { salaryAxios } from '@/lib/axios';
import {  useQuery } from 'react-query';

interface hustlePicksProps {
  status: string;
  message: string;
  data: Datum[];
}

interface Datum {
  contestant_id: number;
  picks: number[];
}
export const getAllHustleNumbers = async (episode_id: number) => {
  if (!episode_id) return null;
  const response = await salaryAxios.post(`api/game/get_hustle_picks/${episode_id}/`);
  return response?.data as hustlePicksProps;
};

export const useGetAllHustleNumbers = (episode_id: number) =>
  useQuery({
    queryKey: ["all-hustle-picks", episode_id],
    queryFn: () => getAllHustleNumbers(episode_id),
    enabled: !!episode_id,
    // refetchInterval: 1000, // Refetch every second
    staleTime: 0, // Consider data stale immediately
    cacheTime: 0, // Don't cache the data
  });
 
