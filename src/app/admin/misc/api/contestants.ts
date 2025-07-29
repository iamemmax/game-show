import { tokenlessAxios } from "@/lib/axios"
import { useMutation, useQuery } from "react-query"




export interface Contestant {
  id: number;
  constestant_attr: string;
  name: string | null;
  phone_number: string | null;
  gender: null;
  date_of_birth: string | null;
  bio: string | null;
  website: string | null;
  instagram: string | null;
  tiktok: string | null;
  facebook: string | null;
  x: string | null;
  state_of_origin: string | null;
  final_pot: string;
  eliminated_stage: string | null;
  is_eliminated: boolean;
  contestant_hustle: string | null;
  login_code: string | null;
  created_at: string;
  updated_at: string;
  actual_balance: string;
  book_balance: string;
  contestant_photo_url: string | null;
}


export type TGameInfo = {
  game_episode: number
  game_nick: string
  status: string
  stage: string
  reveal_step_count: "SINGLE" | "DOUBLE"
  finale_type: "GRAND_PRIZE" | "GOLDEN_MATCH"
  is_golden_match_active: boolean
}
export type TEpisodeInfo = TGameInfo & {
  lastAction: string;
  showQuestions: boolean;
  step: string;
}

export interface ContestantsResponse {
  status: string
  message: string
  data: Contestant[]
  game: TGameInfo
}

interface AssignContestantRequest {
  game_episode: number
  constestants_attr: string
  name: string
  phone_number: string;
  contestant_photo: any
  age: number | null
  bio: string | null
  website: string
  instagram: string
  tiktok: string
  facebook: string
  x: string
  state_of_origin: string | null
  contestant_hustle: string
  gender: string
  date_of_birth: string | null
}

interface AssignContestantResponse {
  status: string
  message: string
}




export const getGameContestants = async (gameId: number) => {
  if (!gameId) return null
  const response = await tokenlessAxios.post(`api/accounts/game_contestants/${gameId}`)
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
  const formData = new FormData()
  console.log(data);

  formData.append("name", data?.name)
  formData.append("constestants_attr", data?.constestants_attr)
  formData.append("game_episode", String(data?.game_episode))
  formData.append("phone_number", data?.phone_number)
  formData.append("bio", data?.bio ?? "")
  formData.append("contestant_photo", data?.contestant_photo)
  formData.append("website", data?.website)
  formData.append("instagram", data?.instagram)
  formData.append("tiktok", data?.tiktok)
  formData.append("facebook", data?.facebook)
  formData.append("x", data?.x)
  formData.append("state_of_origin", data?.state_of_origin ?? "")
  formData.append("contestant_hustle", data?.contestant_hustle)
  formData.append("gender", data?.gender)
  formData.append("date_of_birth", data?.date_of_birth ?? "")

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })

  const response = await tokenlessAxios.post("api/accounts/assign_contestants/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  })
  return response?.data as AssignContestantResponse
}

export const useAssignContestant = () =>
  useMutation({
    mutationFn: assignContestant,
  })


export interface CreditDebitContestantRequest {
  question_id: number | string;
  giver_contestant_ids: (number | string)[];
  credit_source: "gameshow_float" | "";
}
export const creditDebitContestant = async (data: CreditDebitContestantRequest) => {
  const response = await tokenlessAxios.post("api/game/debit_for_proof_hustle", data)
  return response?.data
}

export const useCreditDebitContestant = () =>
  useMutation({
    mutationFn: creditDebitContestant,
  })


export const hustleTimeELapse = async (data: { game_episode?: number | string }) => {
  const response = await tokenlessAxios.post("api/admin-controller/hustle_pick_time_elapsed/", data)
  return response?.data
}

export const useHandleHustlePickTimeElapse = () =>
  useMutation({
    mutationFn: hustleTimeELapse,
  })


