import { salaryAxios } from '@/lib/axios';
import { useMutation, useQueryClient } from 'react-query';

interface PickNumberProp {
  contestant_id: number | undefined;
  question_id: any;
  answer: string;
  // percentage_staked?: number;
  timestamp: string;
  // question_start_time: string;
}

export const answerStageTwoQuestion = async ({
  answer,
  timestamp,
  contestant_id,
  question_id,
  // percentage_staked,
  // question_start_time
}: PickNumberProp) => {
  const response = await salaryAxios.post(`api/game/answer_proof_hustle_questions/${question_id}`, {
    answer,
    timestamp,
    contestant_id,
    // percentage_staked,
    // question_start_time
  });
  return response?.data;
};

export const useAnswerStageTwoQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: answerStageTwoQuestion,
    onSuccess: () => {
      // Invalidate and refetch wallet balance data
      queryClient.invalidateQueries("get-wallet-balance");
    }
  });
};

