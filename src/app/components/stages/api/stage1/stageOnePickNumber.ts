import { salaryAxios } from '@/lib/axios';
import { useMutation } from 'react-query';

interface PickNumberProp {
  contestant_id: number;
  picks: number;
  episode_id: number;
}
export const stageOnePickNumber = async ({contestant_id, picks, episode_id}: PickNumberProp) => {
  const response = await salaryAxios.post(`api/game/hustle_picks/${episode_id}/`, {
    contestant_id,
    picks
  });
  return response?.data;
};


export const useStageOnePickNumber = () =>
  useMutation({
    mutationFn: stageOnePickNumber
  });

