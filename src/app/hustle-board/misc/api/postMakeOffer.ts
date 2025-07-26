


import { tokenlessAxios } from "@/lib/axios";
import { useMutation } from "react-query";

type Payload = {
    game_episode: number;
    contestant_id: number;
    amount: number;
}



const makeOffer = async (data: Payload) => {
    const res = await tokenlessAxios.post("/api/admin-controller/banker_offer", data);
    return res.data;
}
export const useMakeOffer = () => {
        return useMutation({
            mutationFn: makeOffer,
        });
    }