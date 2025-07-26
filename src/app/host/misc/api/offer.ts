import { tokenlessAxios } from "@/lib/axios"
import { useMutation } from "react-query";

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