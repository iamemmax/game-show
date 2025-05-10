import { salaryAxios } from '@/lib/axios';
import { useQuery } from 'react-query';

interface hustleQuestionPicksProps {
  status: string;
  message: string;
  data: Data;
}

interface Data {
  hustle_questions: Hustlequestion[];
}

interface Hustlequestion {
  questions: Questions;
  hustle_reveal: Hustlereveal;
  contestant: Contestant;
  question_number?: number;
}

interface Contestant {
  contestant_id: number;
  contestant_attr: string;
  contestant_name: null | string;
}

interface Hustlereveal {
  hustle_name: string;
  hustle_number: number | string;
  hustle_state: string;
  hustle_amount: number;
}

interface Questions {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  question_id: number | string;
  question_booster: string;
}
export const getAllHustleQuestions = async (episode_id: number) => {
  if (!episode_id) return null;
  const response = await salaryAxios.post(`api/game/get_hustle_questions/${episode_id}`);
  return response?.data as hustleQuestionPicksProps;
};

export const useGetAllHustleQuestions = (episode_id: number) =>
  useQuery({
    queryKey: ["all-hustle-questions", episode_id],
    queryFn: () => getAllHustleQuestions(episode_id),
  });
 
