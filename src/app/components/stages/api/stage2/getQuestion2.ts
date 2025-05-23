import { salaryAxios } from '@/lib/axios';
import { useQuery } from 'react-query';





export interface hustleQuestionPicksProps {
  status: string;
  message: string;
  data: Data;
}

interface Data {
  proof_questions: Proofquestion[];
}

interface Proofquestion {
  questions: Questions;
}

export interface Questions {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  question_id: number;
  allocated_winning_amount: number;
}
export const getAllState2Questions = async (episode_id: number) => {
  if (!episode_id) return null;
  const response = await salaryAxios.post(`api/game/get_all_proof_questions/${episode_id}`);
  return response?.data as hustleQuestionPicksProps;
};

export const useGetAllStage2Questions = (episode_id: number) =>
  useQuery({
    queryKey: ["all-stage-2-questions", episode_id],
    queryFn: () => getAllState2Questions(episode_id),
  });
 
