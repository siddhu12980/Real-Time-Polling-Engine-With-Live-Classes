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
