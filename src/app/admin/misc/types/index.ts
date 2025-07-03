

export interface DebitWalletData {
  game_episode: number;
  question_id: string;
  data: Data;
  question_index: number;
  show_modal: boolean;
}

interface Data {
  answers: Answer[];
  question: Question;
}

interface Question {
  question_id: number;
  correct_option: string;
}

interface Answer {
  contestant_id: number;
  answered_in: number;
  is_correct: boolean;
  is_winner: boolean;
  answer: string;
  wallet_balance: number;
  book_balance: number;
  startup_balance: number;
  stage_balance: number;
  contestant_name: string;
  contestant_attr: string;
  profit_loss: Profitloss;
}

interface Profitloss {
  contestant_id: number;
  contestant_name: string;
  contestant_attr: string;
  amount_gained: number;
  amount_lost: number;
}