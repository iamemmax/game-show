import { tokenlessAxios, } from "@/lib/axios";
import { useMutation, useQuery } from "react-query";
import { Contestant, HustleReveal, SpendBreakdown, Stage1QuestionData, Stage2Question } from "../types";


interface RootObject {
    question_id: number | string;
    start_time: string;
    question_type: string;
}


export interface IGetProofQuestionAPIResponse {
    status: string;
    message: string;
    data: {
        question: {
            question: string;
            option_a: string;
            option_b: string;
            option_c: string;
            option_d: string;
            correct_option: string;
            question_id: number;
            allocated_winning_amount: number;
        };
        index: number;
    };
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
    const res = await tokenlessAxios.post("/api/admin-controller/question_start_time/",
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







interface TimeElapsedResponse {
    status: string;
    message: string;
    data: TcontestantTimeElapsed[];
}

interface TcontestantTimeElapsed {
    contestant_id: number;
    answered_in: number;
    is_correct: boolean;
    is_winner: boolean;
    wallet_balance: number;
    book_balance: number;
    stage_balance: number;
    contestant_name: null;
    contestant_attr: string;
}
const postNotifyBackendEndTimer = async ({ question_id, stage, timestamp }: { question_id: number | string, stage?: '1' | '2', timestamp: string }) => {
    const endpoint = stage === '2' ? '/api/admin-controller/s2_question_time_elapsed/' : '/api/admin-controller/s1_question_time_elapsed/';
    const res = await tokenlessAxios.post(endpoint, { question_id, timestamp })
    return res.data as TimeElapsedResponse;
}

export const useNotifyBackendEndQuestionTimer = () => {
    return useMutation({
        mutationFn: postNotifyBackendEndTimer,
        mutationKey: ["end-hustle-questiontimer"],
    });
}

const postGetHustleQuestion = async ({ episode }: { episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetHustleQuestionAPIResponse>(`/api/admin-controller/request_hustle_reveal_question/${episode}`);
    return res.data;
}

export const useGetHustleQuestion = () => {
    return useMutation({
        mutationFn: postGetHustleQuestion,
        mutationKey: ["get-hustle-question"],
    });
}

const getHustleQuestionResult = async ({ question_id }: { question_id: string | number }) => {
    const res = await tokenlessAxios.get<IGetHustleQuestionAPIResponse>(`/api/admin-controller/hustle_question_tally/${question_id}`);
    return res.data;
}

export const useGetHustleQuestionResult = (question_id?: string | number) => {
    return useQuery({
        queryKey: ["get-hustle-stage-1-question-result", question_id],
        queryFn: () => getHustleQuestionResult({ question_id: question_id! }),
        enabled: !!question_id,
        refetchOnWindowFocus: false,
    });
}
const getProofQuestionResult = async ({ question_id }: { question_id: string | number }) => {
    const res = await tokenlessAxios.get<IGetHustleQuestionAPIResponse>(`/api/admin-controller/proof_hustle_question_tally/${question_id}`);
    return res.data;
}

export const useGetProofQuestionResult = (question_id?: string | number) => {
    return useQuery({
        queryKey: ["get-hustle-stage-2-question-result", question_id],
        queryFn: () => getProofQuestionResult({ question_id: question_id! }),
        enabled: !!question_id, 
        refetchOnWindowFocus: false,
    });
}

const postStartGame = async ({ game_episode }: { game_episode: string | number }) => {
    const res = await tokenlessAxios.post(`/api/admin-controller/start_game_episode/${game_episode}`);
    return res.data;
}

export const useStartGame = () => {
    return useMutation({
        mutationFn: postStartGame,
        mutationKey: ["start-game"],
    });
}

const postInitStageTwo = async (data: { game_episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetHustleQuestionAPIResponse>(`/api/admin-controller/init_stage_two/`, data);
    return res.data;
}

export const useInitStage2 = () => {
    return useMutation({
        mutationFn: postInitStageTwo,
        mutationKey: ["initialize-stage-2"],
    });
}

const postEndStageOne = async ({ episode }: { episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetHustleQuestionAPIResponse>(`/api/admin-controller/end_stage_one/${episode}`);
    return res.data;
}

export const useEndStageOne = () => {
    return useMutation({
        mutationFn: postEndStageOne,
        mutationKey: ["end-stage-1"],
    });
}



//////////////////////////////////////////////////////////
///////////                STAGE TWO        ///////////////
//////////////////////////////////////////////////////////
const postGetProofQuestion = async ({ episode }: { episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetProofQuestionAPIResponse>(`/api/admin-controller/request_proof_hustle_question/${episode}`);
    return res.data;
}

export const useGetProofQuestion = () => {
    return useMutation({
        mutationFn: postGetProofQuestion,
        mutationKey: ["get-proof-question"],
    });
}
const postEndStageTwo = async ({ episode }: { episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetHustleQuestionAPIResponse>(`/api/admin-controller/end_stage_two/${episode}`);
    return res.data;
}

export const useEndStageTwo = () => {
    return useMutation({
        mutationFn: postEndStageTwo,
        mutationKey: ["end-stage-2"],
    });
}




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





//////////////////////////////////////////////////////////
///////////             STAGE THREE        ///////////////
//////////////////////////////////////////////////////////
const postEndStageThree = async ({ episode }: { episode: string | number }) => {
    const res = await tokenlessAxios.post<IGetHustleQuestionAPIResponse>(`/api/admin-controller/end_stage_three/${episode}`);
    return res.data;
}

export const useEndStageThree = () => {
    return useMutation({
        mutationFn: postEndStageThree,
        mutationKey: ["end-stage-3"],
    });
}