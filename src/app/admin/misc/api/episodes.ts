import { tokenlessAxios } from "@/lib/axios"
import { useMutation, useQuery, useQueryClient } from "react-query"

interface IEpisode {
  id: number
  game_episode: number
  game_nick: string
  status: string
  stage: string
  created_at: string
  updated_at: string
  hustle_season: number;

}

interface GamesResponse {
  status: string
  message: string
  data: IEpisode[]
}

interface CreateEpisodeResponse {
  status: string
  message: string
  episode: number
}

interface createEpisodeType {
  game_nick: string
  season_id: string | number
  game_type: string | number
}


// Get all games
// export const getAllGames = async ({ season_id , game_status}: { season_id: string | number, game_status?:string }) => {
//   const response = await tokenlessAxios.get(`api/game/fetch_all_games/?season_id=${season_id}&game_status=${game_status}`)
//   return response?.data as IEpisode[]
// }
export const getAllGames = async ({
  season_id,
  game_status,
}: { season_id: string | number; game_status?: string }) => {
  const query = new URLSearchParams({ season_id: String(season_id) })

  if (game_status) {
    query.append("game_status", game_status)
  }

  const response = await tokenlessAxios.get(`api/game/fetch_all_games/?${query.toString()}`)
  return response?.data as IEpisode[]
}
export const useGetAllSeasonEpisodes = ({
  season_id,
  game_status,
}: { season_id?: string | number; game_status?: string }) =>
  useQuery({
    queryKey: ["all-season-episodes", season_id, game_status],
    queryFn: () => getAllGames({ season_id: season_id!, game_status }),
    staleTime: 0,
    cacheTime: 0,
    enabled: !!season_id,
  })


// export const useGetAllSeasonEpisodes = ({ season_id, game_status }: { season_id?: string | number, game_status?:string }) =>
//   useQuery({
//     queryKey: ["all-season-episodes", season_id, game_status],
//     queryFn: () => getAllGames({ season_id: season_id! ,}),
//     staleTime: 0,
//     cacheTime: 0,
//     enabled: !!season_id,
//   })

// Start a new game
export const createEpisode = async (data: createEpisodeType) => {
  const response = await tokenlessAxios.post("api/admin-controller/create_gameshow_episode/", data)
  return response?.data as CreateEpisodeResponse
}

export const useCreateEpisode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEpisode,
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ["all-season-episodes", variables.season_id],
      });
      queryClient.invalidateQueries({
       queryKey: ["all-seasons"]
      });
    },
  })
}
