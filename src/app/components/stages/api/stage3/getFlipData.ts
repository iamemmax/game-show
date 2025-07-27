import { salaryAxios, tokenlessAxios } from '@/lib/axios';
import {  useQuery } from 'react-query';

interface flipDataTypes {
  type: string;
  next_turn: number;
  position: number;
  contestant: Contestant;
}

interface Contestant {
  id: number;
  anme: string;
}

export const getFlipData = async (episodeId:string) => {
  const response = await tokenlessAxios.get(`api/game/get_dud_pass_state?game_episode=${episodeId}`);
  return response?.data as flipDataTypes[];
};

export const useGetFlipData = (episodeId:string) =>
  useQuery({
    queryFn: ()=> getFlipData(episodeId),
    queryKey: ["get-flip-data",episodeId],
    enabled:!!episodeId,
  });