import { tokenlessAxios } from "@/lib/axios";
import { useMutation, useQuery } from "react-query";

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

export interface HustleMatch {
    contestant_id?: number
    number_pick: number
    is_match?: boolean
    is_extra_ball: boolean
    extra_ball_details?: ExtraBallDetails | null
    balance_details?: BalanceDetails
    extra_ball_name?: string | null
    extra_ball_type?: string | null
    extra_ball_effect_action?: string | null
    extra_ball_effect_desc?: string | null
}

export interface BallPickAPIResponse {
    hustle_match: HustleMatch
    number_revealed: number[]
}

const pickBall = async (data: IBallPickData) => {
    const res = await tokenlessAxios.post("api/admin-controller/hustle_match/", data);
    return res.data as BallPickAPIResponse;
}

export const useGrandPrizeBallPick = () => {
    return useMutation({
        mutationFn: pickBall,
        mutationKey: "handleBallPick",
    });
}

const goldenBallPick = async (data: IBallPickData) => {
    const res = await tokenlessAxios.post("api/admin-controller/golden_hustle_match", data);
    return res.data as BallPickAPIResponse;
}

export const useGoldenBallPick = () => {
    return useMutation({
        mutationFn: goldenBallPick,
        mutationKey: "handleGoldenBallPick",
    });
}

interface HustleMatchesResponse {
    status: string
    data: HustleMatch[]
}

export const getHustleMatches = async (gameEpisode: number) => {
    if (!gameEpisode) return null
    const response = await tokenlessAxios.get(`api/admin-controller/get_hustle_matches?game_episode=${gameEpisode}`)
    return response?.data as HustleMatchesResponse
}

export const useGetHustleMatches = (gameEpisode: number) =>
    useQuery({
        queryKey: ["hustle-matches", gameEpisode],
        queryFn: () => getHustleMatches(gameEpisode),
        enabled: !!gameEpisode,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    })


export interface MatchedHustle {
    number_pick: number
    is_match: boolean
    is_extra_ball: boolean
    extra_ball_name: string | null
    extra_ball_type: string | null
    extra_ball_effect_action: string | null
    extra_ball_effect_desc: string | null
}

export interface MatchedHustlesResponse {
    status: string
    data: MatchedHustle[]
}

export const getMatchedHustles = async (gameEpisode: number) => {
    if (!gameEpisode) return null
    const response = await tokenlessAxios.get(`/api/admin-controller/get_matched_hustles?game_episode=${gameEpisode}`)
    return response?.data as MatchedHustlesResponse
}

export const useGetMatchedHustles = (gameEpisode: number, slowRefetch?:boolean) =>
    useQuery({
        queryKey: ["matched-hustles", gameEpisode],
        queryFn: () => getMatchedHustles(gameEpisode),
        enabled: !!gameEpisode,
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchInterval: slowRefetch ? 60000 : 2000,
    })
