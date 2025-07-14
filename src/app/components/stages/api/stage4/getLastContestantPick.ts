import { salaryAxios, tokenlessAxios } from '@/lib/axios';
import { useQuery } from 'react-query';

interface PickNumberProp {
  contestant_id: number;
  episode_id: number;
}


export interface finalePicksProp {
  contestant_id: number;
  picks: number[];
}
export const getLastContestantPick = async ({ contestant_id, episode_id }: PickNumberProp) => {
  const response = await tokenlessAxios.get(
    `api/admin-controller/get_hustle_picks?game_episode=${episode_id}&contestant_id=${contestant_id}`
  );
  return response?.data as finalePicksProp[];
};

export const useGetLastContestantPick = ({ contestant_id, episode_id }: PickNumberProp) =>
  useQuery({
    queryKey: ['get-last-contestant-4-pick', contestant_id, episode_id],
    queryFn: () => getLastContestantPick({ contestant_id, episode_id }),
    enabled: !!contestant_id && !!episode_id, // Optional: prevents query from running on undefined
  });
