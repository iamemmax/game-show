import { salaryAxios } from "@/lib/axios";
import { useMutation } from "react-query";

interface RootObject {
    question_id: number | string;
    start_time: string;
    question_type: string;
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

const postGetHustleQuestion = async (episode?: string | number) => {
    const res = await salaryAxios.post(`/api/game/request_next_question/${episode}/`);
    return res.data;
}

export const useGetHustleQuestion = () => {
    return useMutation({
        mutationFn: postGetHustleQuestion,
        mutationKey: ["get-hustle-question"],
    });
}