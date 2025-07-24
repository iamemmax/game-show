import { salaryAxios } from '@/lib/axios';
import { useMutation, useQuery } from 'react-query';



interface stageThree {
  game_episode: number;
  contestant_id: number;
}


export const checkWhetherToRevealPass = async ({data}:{data:any}) => {
  const response = await salaryAxios.post(`api/game/request_for_pass`);
  return response?.data ;
};

export const useCheckWhetherToRevealPass = () =>
  useMutation({
    mutationFn:  checkWhetherToRevealPass,
  });
 
