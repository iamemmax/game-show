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

interface StartGameResponse {
  status: string
  message: string
  episode: number
}

interface StartGameRequest {
  game_nick: string
}

// Get all games
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

// Start a new game
export const startGame = async (data: StartGameRequest) => {
  const response = await tokenlessAxios.post("api/admin-controller/start_gameshow_hustle/", data)
  return response?.data as StartGameResponse
}

export const useStartGame = () =>
  useMutation({
    mutationFn: startGame,
  })
