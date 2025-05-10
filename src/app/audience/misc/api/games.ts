import { tokenlessAxios } from "@/lib/axios"
import { useMutation, useQuery } from "react-query"

interface Game {
  id: number
  game_episode: number
  game_nick: string
  status: string
  stage: string
  created_at: string
  updated_at: string
}

interface GamesResponse {
  status: string
  message: string
  data: Game[]
}




export const getAllGames = async () => {
  const response = await tokenlessAxios.get("api/admin-controller/games/")
  return response?.data as GamesResponse
}

export const useGetAllGames = () =>
  useQuery({
    queryKey: ["all-games"],
    queryFn: () => getAllGames(),
    staleTime: 0, // Consider data stale immediately
    cacheTime: 0, // Don't cache the data
  })

