import {
  atom,
} from 'recoil'


export const userState = atom({
  key: 'userState',
  default: {
    "userName": "",
    "livekitToken": "",
    "token": "",
    "role": "",
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
  rankings: { userId: string, submissionTime: number, rank: number }[];
  totalCorrect: number;
  incorrectResponded: { userId: string, submissionTime: number, rank: number }[];
  notResponded: { userId: string, submissionTime: number, rank: number }[];
}

export interface PollData {
  id?: string;
  type: PollType;
  createdAt: string;
  timer: number;
  question: string | null;
  pollResult: PollResult | null;

  // remainingTime: number | 0;
}

export const pollDataState = atom<PollData | null>({
  key: 'pollDataState',
  default: null,
});

export const remainingTimeState = atom<number>({
  key: 'remainingTimeState',
  default: 0,
});





