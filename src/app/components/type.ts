export interface SpendBreakdownEntry {
  [amount: string]: number;
}

export interface ContestantSpend {
  contestant_id: number;
  contestant_name: string;
  wallet_balance: number;
  max_question_spend: number;
  spend_breakdown: SpendBreakdownEntry;
}

export interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  question_id: number;
  question_booster: string;
}

export interface HustleReveal {
  hustle_name: string;
  hustle_number: number;
  hustle_state: string;
  hustle_amount: number;
}

export interface Contestant {
  contestant_id: number;
  contestant_attr: string;
  contestant_name: string;
}

export interface QuestionData {
  question: {
    questions: Question;
    hustle_reveal: HustleReveal;
    contestant: Contestant;
  };
  question_index: number;
  spend_breakdown: ContestantSpend[];
}

export interface GameS1QuestionRevealEvent {
  event: string;
  payload: {
    game_episode: number;
    question_id: string;
    data: QuestionData;
  };
}
