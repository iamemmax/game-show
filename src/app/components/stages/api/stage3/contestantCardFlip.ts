import { salaryAxios } from '@/lib/axios';
import { useMutation } from 'react-query';



interface stageThree {
  game_episode: number;
  contestant_id: number;
position: number;
}


export const contestantFlipCard = async ({contestant_id,game_episode,position}:stageThree) => {
  const response = await salaryAxios.post(`api/game/request_dud_pass`,{
    contestant_id,
    game_episode,
    position
});
  return response?.data as stageThree;
};

export const useContestantFlipCard = () =>
  useMutation({
    mutationFn:  contestantFlipCard,
  });
 
