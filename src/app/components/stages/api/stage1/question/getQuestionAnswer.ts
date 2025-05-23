import { salaryAxios } from '@/lib/axios';
import { useQuery, useQueryClient } from 'react-query';



export interface answerOptionProp {
  status: string;
  message: string;
  data: Data;
}

interface Data {
  contestant_answers: Contestantanswer[];
  question: Question;
}

interface Question {
  question_id: string;
  question_start_time: null;
  question_winner: null;
}

interface Contestantanswer {
  contestant: Contestant;
  answer_supplied: string;
  is_correct: boolean;
  timestamp: string;
  amount_staked: number;
}

interface Contestant {
  contestant_attr: string;
  contestant_name: string;
  contestant_id: number;
}

export const getQuestionAnswer = async (gameId: number) => {
  if (!gameId) return null;
  const response = await salaryAxios.post(`api/game/get_hustle_reveal_answers?question_id=${gameId}`);
  return response?.data as answerOptionProp;
};

export const useGetQuestionAnswer = (gameId: number) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["get-question-answer", gameId],
    queryFn: () => getQuestionAnswer(gameId),
    enabled: !!gameId,
    refetchInterval: 2000, // Refetch every 2 seconds
    staleTime: 0, // Consider data stale immediately
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes,
    onSuccess() {
      queryClient.invalidateQueries(["game-contestants"]);
    
    },
  });
  const revalidate = () => {
    queryClient.invalidateQueries(["game-contestants"]);
  };

  // Add a revalidate function to manually trigger refetch

  // Return both the query result and the revalidate function
  return { ...query, revalidate };
}; 
