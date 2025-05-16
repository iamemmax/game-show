export interface QuestionS1SpendEvent {
  event: string;
  payload: ContestantSpend[];
}

export interface ContestantSpend {
  contestant_id: number;
  contestant_name: string | null;
  wallet_balance: number;
  max_question_spend: number;
  booster: string;
  spend_breakdown: {
    [key: string]: number;
  };
}