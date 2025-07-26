import { salaryAxios } from '@/lib/axios';
import { useMutation, useQuery } from 'react-query';



interface dataTypes {
  data: Data;
}

interface Data {
  pass_found: boolean;
}

export const checkWhetherToRevealPass = async ({data}:{data:any}) => {
  const response = await salaryAxios.post(`api/game/request_for_pass`);
  return response?.data as dataTypes ;
};

export const useCheckWhetherToRevealPass = () =>
  useMutation({
    mutationFn:  checkWhetherToRevealPass,
  });
 
