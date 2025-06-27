import { salaryAxios } from '@/lib/axios';
import { useQuery } from 'react-query';

interface PickNumberProp {
  contestant_id: number;
  episode_id: number;
}

export const getLastContestantPick = async ({ contestant_id, episode_id }: PickNumberProp) => {
  const response = await salaryAxios.get(
    `api/admin-controller/get_hustle_picks?game_episode=${episode_id}&contestant_id=${contestant_id}`
  );
  return response?.data;
};

export const useGetLastContestantPick = ({ contestant_id, episode_id }: PickNumberProp) =>
  useQuery({
    queryKey: ['get-hustle-pick', contestant_id, episode_id],
    queryFn: () => getLastContestantPick({ contestant_id, episode_id }),
    enabled: !!contestant_id && !!episode_id, // Optional: prevents query from running on undefined
  });
