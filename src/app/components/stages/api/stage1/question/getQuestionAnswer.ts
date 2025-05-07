import { salaryAxios } from '@/lib/axios';
import {  useQuery } from 'react-query';

export interface answerQuestionProp {
  status: string;
  message: string;
  data: answerOptionProp[];
}

export interface  answerOptionProp {
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

export const getQuestionAnswer = async (gameId: number) => {
  if (!gameId) return null;
  const response = await salaryAxios.post(`api/game/get_hustle_reveal_answers?question_id=${gameId}`);
  return response?.data as answerQuestionProp ;
};

export const useGetQuestionAnswer = (gameId: number) =>
  useQuery({
    queryKey: ["get-question-answer", gameId],
    queryFn: () => getQuestionAnswer(gameId),
    enabled: !!gameId,
    
  });
 
