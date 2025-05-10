import { tokenlessAxios } from "@/lib/axios"
import { useMutation, useQuery } from "react-query"

interface Contestant {
  id: number
  constestant_attr: string
  name: string | null
  phone_number: string | null
  final_pot: string
  eliminated_stage: string | null
  login_code: string | null
  created_at: string
  updated_at: string
}

interface GameInfo {
  game_episode: number
  game_nick: string
  status: string
  stage: string
}

interface ContestantsResponse {
  status: string
  message: string
  data: Contestant[]
  game: GameInfo
}

interface AssignContestantRequest {
  game_episode: number
  constestants_attr: string
  name: string
  phone_number: string
}

interface AssignContestantResponse {
  status: string
  message: string
}


export const getGameContestants = async (gameId: number) => {
  if (!gameId) return null
  const response = await tokenlessAxios.post(`api/accounts/game_contestants/${gameId}/`)
  return response?.data as ContestantsResponse
}

export const useGetGameContestants = (gameId: number) =>
  useQuery({
    queryKey: ["game-contestants", gameId],
    queryFn: () => getGameContestants(gameId),
    enabled: !!gameId,
    staleTime: 0, // Consider data stale immediately
    cacheTime: 0, // Don't cache the data
  })

// Assign a contestant
export const assignContestant = async (data: AssignContestantRequest) => {
  const response = await tokenlessAxios.post("api/accounts/assign_contestants/", data)
  return response?.data as AssignContestantResponse
}

export const useAssignContestant = () =>
  useMutation({
    mutationFn: assignContestant,
  })
