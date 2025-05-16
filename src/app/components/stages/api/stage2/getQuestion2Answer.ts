import { salaryAxios } from '@/lib/axios';
import { useQuery, useQueryClient } from 'react-query';

export interface answerQuestion2Prop {
  status: string;
  message: string;
  data: answerOptionProp[];
}

export interface answerOptionProp {
  contestant: Contestant;
  question_id: string;
  answer_supplied: string;
  is_correct: boolean;
  timestamp: string;
  percentage_staked: number;
  amount_staked: number;
  question_start_time: string;
}

interface Contestant {
  contestant_attr: string;
  contestant_name: string;
  contestant_id: number;
}
export const getQuestionTwoAnswer = async (gameId: number) => {
  if (!gameId) return null;
  const response = await salaryAxios.post(`api/game/get_proof_hustle_answers?question_id=${gameId}`);
  return response?.data as answerQuestion2Prop;
};

export const useGetQuestionTwoAnswer = (gameId: number) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["get-question-2-answer", gameId],
    queryFn: () => getQuestionTwoAnswer(gameId),
    enabled: !!gameId,
    refetchInterval: 2000, // Refetch every 2 seconds
    staleTime: 0, // Consider data stale immediately
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Add a revalidate function to manually trigger refetch
  const revalidate = () => {
    queryClient.invalidateQueries(["get-question-2-answer", gameId]);
  };

  // Return both the query result and the revalidate function
  return { ...query, revalidate };
}; 
