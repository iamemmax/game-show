import { salaryAxios } from '@/lib/axios';
import { useMutation } from 'react-query';



interface stageThree {
  game_episode: number;
  contestant_id: number;
position: number;
}
interface cardFlipResult {
  message: string;
  type: string;
  position: number;
  contestant: Contestant;
  next_turn: number;
}
interface Contestant {
  id: number;
  name: string;
  contestant_attr: string;
}

export const contestantFlipCard = async ({contestant_id,game_episode,position}:stageThree) => {
  const response = await salaryAxios.post(`api/game/request_dud_pass`,{
    contestant_id,
    game_episode,
    position
});
  return response?.data as  cardFlipResult;
};

export const useContestantFlipCard = () =>
  useMutation({
    mutationFn:  contestantFlipCard,
  });

