import { salaryAxios } from '@/lib/axios';
import { useMutation, useQueryClient } from 'react-query';

interface PickNumberProp {
  contestant_id: number | undefined;
  question_id: any;
  answer: string;
  amount_staked: number;
  // percentage_staked?: number;
  timestamp: string;
  question_start_time: string;
}

export const answerStageOneQuestion = async ({
  amount_staked,
  answer,
  timestamp,
  contestant_id,
  question_id,
  // percentage_staked,
  question_start_time
}: PickNumberProp) => {
  const response = await salaryAxios.post(`api/game/answer_hustle_reveal_question/${question_id}`, {
    amount_staked,
    answer,
    timestamp,
    contestant_id,
    question_id,
    // percentage_staked,
    question_start_time
  });
  return response?.data;
};

export const useAnswerStageOneQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: answerStageOneQuestion,
    onSuccess: () => {
      // Invalidate and refetch wallet balance data
      queryClient.invalidateQueries("get-wallet-balance");
    }
  });
};

