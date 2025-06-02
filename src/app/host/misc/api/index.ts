import { tokenlessAxios, } from "@/lib/axios";
import { useMutation } from "react-query";

interface RootObject {
    question_id: number | string;
    start_time: string;
    question_type: string;
}


export interface IGetHustleQuestionAPIResponse {
    status: string
    message: string
    data: {
        question: {
            questions: Stage1QuestionData
            hustle_reveal: HustleReveal
            contestant: Contestant
        }
        question_index: number
        spend_breakdown: SpendBreakdown[]
    }
}
const postNotifyBackendSTartTimer = async (data: RootObject) => {
    const res = await tokenlessAxios.post("/api/game/question_start_time/",
        data
    );
    return res.data;
}

export const useNotifyBackendStartQuestionTimer = () => {
    return useMutation({
        mutationFn: postNotifyBackendSTartTimer,
        mutationKey: ["start-timer"],
        onSuccess: (data) => {
            console.log("Start timer data", data);
        },
        onError: (error) => {
            console.error("Error starting timer", error);
        },
    });
}
const postNotifyBackendEndTimer = async ({ question_id, stage }: { question_id: number | string, stage?: '1' | '2' }) => {
    const res = stage === '2' ?
        await tokenlessAxios.post(`/api/game/s2_question_time_elapsed/${question_id}`) :
        await tokenlessAxios.post(`/api/game/s1_question_time_elapsed/${question_id}`);
    return res.data;
}

export const useNotifyBackendEndQuestionTimer = () => {
    return useMutation({
        mutationFn: postNotifyBackendEndTimer,
        mutationKey: ["end-hustle-questiontimer"],
    });
}

const postGetHustleQuestion = async ({ episode }: { episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetHustleQuestionAPIResponse>(`/api/game/request_next_question/${episode}`);
    return res.data;
}

export const useGetHustleQuestion = () => {
    return useMutation({
        mutationFn: postGetHustleQuestion,
        mutationKey: ["get-hustle-question"],
    });
}
const postEndStageOne = async ({ episode }: { episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetHustleQuestionAPIResponse>(`/api/game/end_stage_one/${episode}`);
    return res.data;
}

export const useEndStageOne = () => {
    return useMutation({
        mutationFn: postEndStageOne,
        mutationKey: ["end-stage-2"],
    });
}
const postEndStageTwo = async ({ episode }: { episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetHustleQuestionAPIResponse>(`/api/game/end_stage_two/${episode}`);
    return res.data;
}

export const useEndStageTwo = () => {
    return useMutation({
        mutationFn: postEndStageTwo,
        mutationKey: ["end-stage-2"],
    });
}



import { useQuery } from 'react-query';
import { Contestant, HustleReveal, SpendBreakdown, Stage1QuestionData, Stage2Question } from "../types";

interface hustleQuestionPicksProps {
    status: string;
    message: string;
    data: Data;
}

interface Data {
    proof_questions: Proofquestion[];
}

interface Proofquestion {
    questions: Stage2Question;
}


export const getAllState2Questions = async (episode_id: number) => {
    if (!episode_id) return null;
    const response = await tokenlessAxios.post(`api/game/get_all_proof_questions/${episode_id}?asked=false&won=false`);
    return response?.data as hustleQuestionPicksProps;
};

export const useGetAllStage2Questions = (episode_id: number) =>
    useQuery({
        queryKey: ["all-stage-2-questions", episode_id],
        queryFn: () => getAllState2Questions(episode_id),
    });

