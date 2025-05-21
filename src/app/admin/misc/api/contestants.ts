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


  // Mock data for getGameContestants response
export const mockGameContestantsResponse = {
  status: "success",
  message: "Contestants retrieved successfully",
  data: [
    {
      id: 1,
      constestant_attr: "player_1",
      name: "John Smith",
      phone_number: "+1234567890",
      final_pot: "5000",
      eliminated_stage: null,
      login_code: "ABC123",
      created_at: "2023-05-15T10:30:00Z",
      updated_at: "2023-05-15T10:30:00Z"
    },
    {
      id: 2,
      constestant_attr: "player_2",
      name: "Sarah Johnson",
      phone_number: "+1987654321",
      final_pot: "7500",
      eliminated_stage: "round_2",
      login_code: "DEF456",
      created_at: "2023-05-15T10:35:00Z",
      updated_at: "2023-05-15T11:45:00Z"
    },
    {
      id: 3,
      constestant_attr: "player_3",
      name: "Michael Brown",
      phone_number: "+1122334455",
      final_pot: "10000",
      eliminated_stage: null,
      login_code: "GHI789",
      created_at: "2023-05-15T10:40:00Z",
      updated_at: "2023-05-15T10:40:00Z"
    },
    {
      id: 4,
      constestant_attr: "player_4",
      name: "Emily Davis",
      phone_number: "+1555666777",
      final_pot: "2500",
      eliminated_stage: "round_1",
      login_code: "JKL012",
      created_at: "2023-05-15T10:45:00Z",
      updated_at: "2023-05-15T11:20:00Z"
    },
    {
      id: 5,
      constestant_attr: "player_5",
      name: null,
      phone_number: null,
      final_pot: "0",
      eliminated_stage: null,
      login_code: null,
      created_at: "2023-05-15T10:50:00Z",
      updated_at: "2023-05-15T10:50:00Z"
    }
  ],
  game: {
    game_episode: 3,
    game_nick: "Summer Showdown",
    status: "active",
    stage: "round_3"
  }
};