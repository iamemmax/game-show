import { salaryAxios } from '@/lib/axios';
import {  useQuery } from 'react-query';

export interface winninData {
  status: string;
  data: Data;
}

interface Data {
  amount: number;
  game_episode: number;
}



export const getStage3WiningAmount = async (game_episode:string) => {
  const response = await salaryAxios.get(`api/admin-controller/amount_for_pass?game_episode=${game_episode}`);
  return response?.data as winninData ;
};

export const useGetStage3WiningAmount = (game_episode:string) =>
  useQuery({
    queryKey: ["get-stage-3-winning-amount",game_episode],
    queryFn: ()=> getStage3WiningAmount(game_episode),
    enabled:!!game_episode,
  });
 
