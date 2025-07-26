import { tokenlessAxios } from "@/lib/axios"
import { useMutation, useQuery } from "react-query";

type Payload = {
    question_id: string;
    game_episode: number;
}
const revertQuestions = async (data: Payload) => {
    const res = await tokenlessAxios.post("api/admin-controller/revert_qustion", data)
    return res.data
}

export const useRevertQuestion = () => {
    return useMutation({
        mutationFn: revertQuestions
    })
}









const getMadeOffers = async (game_episode: number | string) => {
    const res = await tokenlessAxios.get(`/api/admin-controller/banker_offer?game_episode=${game_episode}`);
    return res.data as APIResponse;
}
export const useGetMadeOffers = (game_episode: number | string) => {
    return useQuery({
        queryFn: () => getMadeOffers(game_episode!),
    });
}

interface APIResponse {
  status: string;
  data: BankerOffer[];
}

export interface BankerOffer {
  contestant_id: number;
  amount: number;
  created_at: string;
}