import { CreditDebitContestantRequest } from "@/app/admin/misc/api"
import { UniversalGameStep } from "@/constants"

export interface Contestant {
  id: number
  constestant_attr: string
  name: string | null
  phone_number: string | null
  final_pot: string
  eliminated_stage: string | null
  login_code: string | null
  created_at: string
  updated_at: string
  is_eliminated: boolean
  actual_balance: string
  book_balance: string
  wallet_balance: string
  contestant_photo_url: string | null
}

export interface GameInfo {
  game_episode: number
  game_nick: string
  status: string
  stage: string
}

export interface ParticipantStatus {
  id: string
  name: string
  type: "contestant" | "host" | "audience" | "all"
  currentScreen: string
  currentStep: UniversalGameStep
  isConnected: boolean
  lastSeen: Date | null
  gameStage: string
  contestantId?: number
  contestantData?: Contestant
}

export interface DebitWalletData {
  question_id: string
  question_index: string
  data: {
    answers: Array<{
      contestant_id: number
      contestant_name: string
      is_winner: boolean
      selected_option: string
      amount_won: string
    }>
  }
}

export interface MultiCreditDebitContestantRequest extends Omit<CreditDebitContestantRequest, "giver_contestant_id"> {
  giver_contestant_ids: number[]
}

export interface SuperAdminSystemEvent {
  id: string
  timestamp: Date
  type: "info" | "warning" | "error" | "success"
  message: string
  source: string
}
