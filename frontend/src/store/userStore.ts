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
  }, // default value (aka initial value)
});


enum PollType {
  FOUR_OPTION = "4_option",
  THREE_OPTION = "3_option",
  FIVE_OPTION = "5_option",
  TRUE_FALSE = "true_false"
}

interface PollData {
  id ?: string,
  type: PollType,
  createdAt: string;
  timer: number;
  question: string | null;
};

export const pollDataState = atom<PollData | null>({
  key: 'pollDataState', // Unique key
  default: null, // Default poll data (null when no poll is active)
});

export const remainingTimeState = atom({
  key: 'remainingTimeState', // Unique key
  default: 0, // Default timer value
});

//
// const UserSetter = () => {
//   const [user, setUser] = useRecoilState(userState);
//
//   const updateUserName = () => {
//     setUser({ ...user, userName: 'JohnDoe' });
//   };
//
//   const updateLivekitToken = () => {
//     setUser({ ...user, livekitToken: 'newToken123' });
//   };
//
//   const toggleIsTeacher = () => {
//     setUser({ ...user, isTeacher: !user.isTeacher });
//   };
