import { tokenlessAxios } from "@/lib/axios";
import { useMutation } from "react-query";

export interface IBallPickData {
    game_episode: string | number;
    contestant_id: number;
    number_pick: number;
}


interface ExtraBallDetails {
    name: string
    type: string
    effect_action: string | null
    effect_desc: string | null
}

interface BalanceDetails {
    is_gain: boolean
    previous_balance: number
    amount_gained: number
    amount_lost: number
    current_balance: number
}

interface HustleMatch {
    contestant_id: number
    number_pick: number
    is_match: boolean
    is_extra_ball: boolean
    extra_ball_details: ExtraBallDetails | null
    balance_details: BalanceDetails
}

export interface BallPickAPIResponse {
    hustle_match: HustleMatch
    number_revealed: number[]
}

const pickBall = async (data: IBallPickData) => {
    const res = await tokenlessAxios.post("api/admin-controller/hustle_match/", data);
    return res.data as BallPickAPIResponse;
}

export const useHandleBallPick = () => {
    return useMutation({
        mutationFn: pickBall,
        mutationKey: "handleBallPick",
    });
}