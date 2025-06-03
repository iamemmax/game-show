import { tokenlessAxios } from "@/lib/axios"
import { useMutation, useQuery, useQueryClient } from "react-query"


// export  interface THustleSeason {
//     id: number;
//     created_at: string;
//     updated_at: string;
//     season: string;
//     year: string;
//     description: null | string;
//     is_active_season: boolean;
// }
export interface THustleSeason {
    status: string;
    data: Datum[];
}

interface Datum {
    id: number;
    updated_at: string;
    created_at: string;
    season: string;
    year: string;
    description: null;
    is_active_season: boolean;
}
export const getAllSeasons = async () => {
    const response = await tokenlessAxios.post(`/api/admin-controller/fetch_hustle_seasons/`)
    return response?.data as THustleSeason
}

export const useGetAllSeasons = () =>
    useQuery({
        queryKey: ["all-seasons"],
        queryFn: getAllSeasons,
        staleTime: 0,
        cacheTime: 0,
    })


export const createSeason = async (data: { season: string; year: string; description?: string; }) => {
    const response = await tokenlessAxios.post(`/api/admin-controller/create_hustle_season/`, data)
    return response?.data as THustleSeason
}
export const useCreateSeason = () => {
    const queryClient = useQueryClient();
   return useMutation({
        mutationFn: createSeason,
        mutationKey: ["create-season"],
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: ["all-seasons"],
            });
        },
    })
}
