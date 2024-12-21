import {
  atom,
} from 'recoil'


export const userState = atom({
  key: 'userState',
  default: {
    "userName": "",
    "livekitToken": "",
    "token": "",
    "isteacher": false
  },
});


enum PollType {
  FOUR_OPTION = "4_option",
  THREE_OPTION = "3_option",
  FIVE_OPTION = "5_option",
  TRUE_FALSE = "true_false"
}

export interface PollResult {
  responseCount: { [key: string]: number };
  correctAnswer: string;
  totalSubmissions: number;
  countNotResponded: number;
  ranking: { userId: string; submissionTime: number; rank: number }[]; 
  totalCorrect: number;
}

export interface PollData {
  id?: string;
  type: PollType;
  createdAt: string;
  timer: number;
  question: string | null;
  pollResult: PollResult | null;
  remainingTime: number | 0;
}

export const pollDataState = atom<PollData | null>({
  key: 'pollDataState',
  default: null,
});



