import { salaryAxios } from "@/lib/axios";
import { useMutation } from "react-query";

interface RootObject {
    question_id: number | string;
    start_time: string;
    question_type: string;
}

interface QuestionData {
    question: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: string
    question_id: number
    question_booster: string
}

interface HustleReveal {
    hustle_name: string
    hustle_number: number
    hustle_state: string
    hustle_amount: number
}

interface Contestant {
    contestant_id: number
    contestant_attr: string
    contestant_name: string
}

interface SpendBreakdown {
    contestant_id: number
    contestant_name: string
    wallet_balance: number
    max_question_spend: number
    booster: string
    spend_breakdown: Record<string, number>
}

export interface IGetHustleQuestionAPIResponse {
    status: string
    message: string
    data: {
        question: {
            questions: QuestionData
            hustle_reveal: HustleReveal
            contestant: Contestant
        }
        question_index: number
        spend_breakdown: SpendBreakdown[]
    }
}
const postNotifyBackendSTartTimer = async (data: RootObject) => {
    const res = await salaryAxios.post("/api/game/question_start_time/",
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
const postNotifyBackendEndTimer = async ({question_id}:{question_id:number | string}) => {
    const res = await salaryAxios.post(`/api/game/s1_question_time_elapsed/${question_id}`);
    return res.data;
}

export const useNotifyBackendEndQuestionTimer = () => {
    return useMutation({
        mutationFn: postNotifyBackendEndTimer,
        mutationKey: ["end-hustle-questiontimer"],
    });
}

const postGetHustleQuestion = async ({ episode }: { episode: string | number }) => {
    const res = await salaryAxios.post<IGetHustleQuestionAPIResponse>(`/api/game/request_next_question/${episode}`);
    return res.data;
}

export const useGetHustleQuestion = () => {
    return useMutation({
        mutationFn: postGetHustleQuestion,
        mutationKey: ["get-hustle-question"],
    });
}
const postEndStageOne = async ({ episode }: { episode: string | number }) => {
    const res = await salaryAxios.post<IGetHustleQuestionAPIResponse>(`/api/game/end_stage_one/${episode}`);
    return res.data;
}

export const useEndStageOne = () => {
    return useMutation({
        mutationFn: postEndStageOne,
        mutationKey: ["end-stage-1"],
    });
}