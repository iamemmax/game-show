import { salaryAxios } from '@/lib/axios';
import { useQuery, useQueryClient } from 'react-query';

// export interface answerQuestion2Prop {
//   status: string;
//   message: string;
//   data: answerOptionProp[];
// }

export interface answerQuestion2Prop {
  status: string;
  message: string;
  data: Data[];
}

export interface answerOptionProp {
  status: string;
  message: string;
  data: Data;
}

interface Data {
  contestant_answers: Contestantanswer[];
  question: Question;
  winner_details?: Contestant;
}

interface Question {
  question_id: string;
  question_start_time: null;
  question_winner: null;
  correct_option?: string; // Add the correct_option property
}

interface Contestantanswer {
  contestant: Contestant;
  answer_supplied: string;
  is_correct: boolean;
  timestamp: string;
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
