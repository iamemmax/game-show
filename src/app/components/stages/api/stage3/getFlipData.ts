import { salaryAxios, tokenlessAxios } from '@/lib/axios';
import { useMutation, useQuery } from 'react-query';



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

export const getFlipData = async () => {
  const response = await tokenlessAxios.get(`api/game/test_return_contestant`);
  return response?.data as flipDataTypes[];
};

export const useGetFlipData = () =>
  useQuery({
    queryFn:  getFlipData,
  });