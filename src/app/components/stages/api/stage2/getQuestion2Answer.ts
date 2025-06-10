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
  data: Question2AnswerData[];
  question_id: number | string;

}

export interface answerOptionProp {
  status: string;
  message: string;
  data: Question2AnswerData;
  question_id: number | string;

}


export interface Question2AnswerDataAPIResponse{
  status: string;
  message: string;
  data: Question2AnswerData[];
  question_id: number | string;
}

export interface Question2AnswerData {
  contestant_id: number;
  answered_in: number;
  is_correct: boolean;
  is_winner: boolean;
  wallet_balance: number;
  book_balance: number;
  stage_balance: number;
  contestant_name: null;
  contestant_attr: string;
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
    onSuccess() {
      queryClient.invalidateQueries(["game-contestants"]);
    
    },
  });

  // Add a revalidate function to manually trigger refetch
  const revalidate = () => {
    // Fix: Invalidate the correct query key
    queryClient.invalidateQueries(["get-question-2-answer", gameId]);
  };

  // Return both the query result and the revalidate function
  return { ...query, revalidate };
}; 
