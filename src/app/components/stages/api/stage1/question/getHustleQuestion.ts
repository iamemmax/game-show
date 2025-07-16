import { salaryAxios, tokenlessAxios } from '@/lib/axios';
import { useQuery } from 'react-query';



export interface hustleQuestionPicksProps {
  hustle_number: number;
  hustle_name: string;
  contestant_name: string;
  contestant_id: number;
  contestant_photo_url: string | undefined;

}


export const getAllHustleQuestions = async (episode_id: number) => {
  if (!episode_id) return null;
  const response = await tokenlessAxios.post(`api/game/hustle_opportunities?game_episode=${episode_id}`);
  return response?.data as hustleQuestionPicksProps[];
};

export const useGetAllHustleQuestions = (episode_id: number) =>
  useQuery({
    queryKey: ["all-hustle-questions", episode_id],
    queryFn: () => getAllHustleQuestions(episode_id),
  });
 
