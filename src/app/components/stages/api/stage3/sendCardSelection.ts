import { salaryAxios } from '@/lib/axios';
import { useMutation, useQuery } from 'react-query';



interface stageThree {
  game_episode: number;
  contestant_id: number;
  pick: string;
}


export const cardSelection = async ({contestant_id,game_episode,pick}:stageThree) => {
  const response = await salaryAxios.post(`api/game/stage_three_picks`,{contestant_id,game_episode,pick});
  return response?.data as stageThree;
};

export const useCardSelection = () =>
  useMutation({
    mutationFn:  cardSelection,
  });
 
