import { salaryAxios } from '@/lib/axios';
import { useQuery } from 'react-query';





interface hustleQuestionPicksProps {
  status: string;
  message: string;
  questions: Question2[];
}

export interface Question2 {
  question_id: number;
  game_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  winning_amount: null;
  asked: string;
  won: string;
}

export const getAllState2Questions = async (episode_id: number) => {
  if (!episode_id) return null;
  const response = await salaryAxios.get(`api/game/get_all_proof_questions?game_episode=${episode_id}&asked=false&won=false`);
  return response?.data as hustleQuestionPicksProps;
};

export const useGetAllState2Questions = (episode_id: number) =>
  useQuery({
    queryKey: ["all-stage-2-questions", episode_id],
    queryFn: () => getAllState2Questions(episode_id),
  });
 
