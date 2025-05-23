export interface Stage2Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  question_id: number;
  allocated_winning_amount: number;
}


export interface Stage1QuestionData {
    question: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: string
    question_id: number
    question_booster: string
}

export interface HustleReveal {
    hustle_name: string
    hustle_number: number
    hustle_state: string
    hustle_amount: number
}

export interface Contestant {
    contestant_id: number
    contestant_attr: string
    contestant_name: string
}

export interface SpendBreakdown {
    contestant_id: number
    contestant_name: string
    wallet_balance: number
    max_question_spend: number
    booster: string
    spend_breakdown: Record<string, number>
}