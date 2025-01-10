
import { useEffect, useState } from 'react';
import { IoChatboxEllipses } from "react-icons/io5";
import { BsFillQuestionSquareFill } from "react-icons/bs";
import { FaPollH } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import Draw from './Draw';
import VideoChat from './VideoChat';
import PdfView from './PdfView';
import ShareTrackView from './ShareTrackView';
import AdaptiveVideo from './AdaptiveVideo';
import { PDFControls } from './PDFControls';
import { CustomBar } from './CustomBar';
import { LiveKitRoom, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { pollDataState, remainingTimeState, userState } from '../store/userStore';
import CreatePoll from './CreatePoll';
import RankingList from './RankingList';
import TeacherPollResult from './TeacherPollResult';

const serverUrl = 'wss://sidd-live-server-l3p4e136.livekit.cloud';
const apiUrl = 'http://localhost:8080/getToken';


const Videolayout = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useRecoilState(userState);
  const params = useParams()

  useEffect(() => {
    const getToken = async () => {
      console.log("Getting TOken for User", user, params.roomId);

      fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
        body: JSON.stringify({
          name: user.userName,
          room: params.roomId,
        }),
      })
        .then(async (response) => {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {

            const data = await response.json().catch((err) => {
              throw new Error(`Failed to parse JSON: ${err.message}`);
            });

            return { data, status: response.status };

          } else {
            const text = await response.text();
            throw new Error(
              `Unexpected response content type: ${contentType}. Response: ${text}`
            );
          }
        })
        .then(({ data, status }) => {
          if (status !== 200) {
            throw new Error(data.error || "Unknown error occurred");
          }
          console.log("Tokken success for livekit", data);


          setToken(data.data)

          setUser({ ...user, livekitToken: data.data })

        })

        .catch((error) => {
          console.error("Error:", error);
        });
    }

    getToken()

  }, [params.roomId]);





  return <>
    {(token && token != "") ?
      < LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
      >
        <Videolayouts user={user} roomId={params.roomId!} />
      </LiveKitRoom >
      : <div> Lodaingn ... </div>
    }
  </>

}

const Videolayouts = ({ user, roomId }: { user: any, roomId: string }) => {
  const [activeSection, setActiveSection] = useState('Chat');
  const [createPoll, setCreatePoll] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [changeScreen, setChangeScreen] = useState<boolean>(true);
  const [teacherContent, setTeacherContent] = useState<'Slide' | 'Screen' | 'Whiteboard' | 'None'>('None');

  // const [pollResult, setPollResult] = useState<any>(null);
  const [pollData, setPollData] = useRecoilState(pollDataState);
  const [remainingTime, setRemainingTime] = useRecoilState(remainingTimeState);


  const handlePollEnd = () => {
    console.log("Poll Ended Erasing Data");
    setRemainingTime(0);
  };

  function handleRankingScreenSwitch() {
    // setPollData(null);
    setActiveSection("Rank");
  }



  // add recoil for teacher instance 
  const trackRef = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const adminTrackRef = trackRef.find(
    (track) => track.participant?.identity === "admin" && track.source === "camera"
  );

  const shareTrackRef = trackRef.find(
    (track) => track.publication?.source === "screen_share"
  );



  useEffect(() => {


    const connect = async () => {
      try {
        const sockets = new WebSocket("ws://127.0.0.1:8080/ws");
        sockets.onopen = () => {
          setSocket(sockets);

          sockets.send(
            JSON.stringify({
              type: "sender",
              roomId: "room1",
              name: "sender",
              id: "s1"
            })
          );
        };


        sockets.onmessage = (event) => {

          const data = JSON.parse(event.data);
          const message_type = data.type;

          if (!message_type) {
            return
          }

          switch (message_type) {


            case "startPoll":
              console.log("Poll Started", data);

              setPollData(data.pollData)

              setRemainingTime(data.pollData.timer)

              setTimeout(() => {
                setActiveSection("Poll")
              }, 1000)

              break



            case "pollResult":

              console.log("Poll Result", data);

              if (data.results) {

                console.error("Poll Result in teacher", data.results)

                setPollData((prev) => {
                  if (prev) {
                    return { ...prev, pollResult: data.results }
                  }
                  return prev
                })

              }

              break

          }

        };



        sockets.onerror = (error) => {
          console.error("Socket Error:", error);
        };

        sockets.onclose = () => {
          console.log("Socket Closed");
        };
      } catch (e) {
        console.error("Error connecting WebSocket:", e);
      }
    };

    connect();

    if (shareTrackRef) {
      console.log("Screen share is happening");
      setChangeScreen(false)
      setTeacherContent("Screen");
    }

    return () => {
      if (socket) {
        socket.close();
        console.log("Socket Closed on Cleanup");
      }
    };
  }, [shareTrackRef]);

  const handlePollSubmit = (data: any) => {
    console.log("Poll Submitted", data);

    if (!socket || socket.readyState != WebSocket.OPEN) {
      console.log("Sender Socket Not open ")
      return
    }

    socket.send(JSON.stringify({
      "id": "p1",
      "type": "startPoll",
      "roomId": "room1",
      "userId": 's1',
      "pollData": data
    }))
  }



  const renderActiveComponent = () => {
    switch (activeSection) {
      case 'Chat':
        return <VideoChat ws={socket} roomId='room1' userId='s1' username='sender1' />;
      case 'Poll':
        return <div className="p-4 bg-gray-300 rounded">
          {/* <TacherPollViewComponent changeLayoutBack={handlePollEnd} handleRanking={handleRankingScreenSwitch} />
           */}
          <TeacherPollResult />
        </div>;
      case 'Participants':
        return <div className="p-4 bg-gray-300 rounded">Participants Component</div>;
      case 'Rank':
        return <div className="p-4 bg-gray-300 rounded">
          <RankingList userId='s1' isTeacher={true} />
        </div>;
      default:
        return null;
    }
  };

  const renderTeacherContent = () => {
    switch (teacherContent) {
      case 'Slide':
        return <div className="bg-blue-300 rounded">   <PdfView /></div>;
      case 'Screen':
        return <div className="p-4 bg-green-300 rounded"><ShareTrackView shareTrackRef={shareTrackRef} /></div>;
      case 'Whiteboard':
        return <div className=" bg-yellow-300 rounded  w-full h-full" > <Draw role='teacher' roomId='room1' /> </div>;

      default:
        return <div onClick={() => setTeacherContent("Slide")} className="p-4 bg-red-300 rounded">  Nothing to See Here</div>;
    }
  };

  return (
    <div className="p-4 h-screen w-screen flex">

      {changeScreen ? (
        <div className="flex w-full ">

          <div className="w-[70%] bg-slate-400 flex flex-col h-full justify-between">

            <div className="p-2 bg-slate-600 text-white text-center">
              Teacher Status:
              <span className="font-bold"> Class in Progress</span> |
              <span className="font-bold"> 30 Participants</span>
            </div>

            {/* Middle Section: Shared Content */}
            <div className="h-full">
              <AdaptiveVideo adminTrackRef={adminTrackRef} />
            </div>



            <div className='bg-slate-400'>


              {createPoll && (
                <div className='bg-slate-600  absolute bottom-14  right-1/2 z-10'>
                  <CreatePoll
                    onClose={() => {
                      console.log("Poll closed");
                      setCreatePoll(false);
                    }}

                    onSubmit={(data: any) => {
                      console.log("Poll submitted");
                      handlePollSubmit(data);
                      setCreatePoll(false);
                    }}
                  />
                </div>
              )}

              <CustomBar
                onCreatePoll={() => {
                  console.log("Create Poll")
                  setCreatePoll(true)
                }}


                onBoardShare={() => {
                  { teacherContent == "Whiteboard" ? setChangeScreen(true) : setTeacherContent("Whiteboard"); setChangeScreen(false) }
                  if (!socket || socket.readyState != WebSocket.OPEN) {
                    console.log("Sender Socket Not open ")
                    return
                  }
                  socket.send(JSON.stringify({
                    "type": teacherContent != "Whiteboard" ? "startBoard" : "endBoard",
                    "roomId": "room1"
                  }))

                }}

                onSlideShare={() => {

                  { teacherContent == "Slide" ? setChangeScreen(true) : setTeacherContent("Slide"); setChangeScreen(false) }

                  if (!socket || socket.readyState != WebSocket.OPEN) {
                    console.log("Sender Socket Not open ")
                    return
                  }

                  socket.send(JSON.stringify({
                    "type": teacherContent != "Slide" ? "startSlide" : "endSlide",
                    "roomId": "room1"
                  }))
                }} />




            </div>




          </div>


          {/* Sidebar for Active Section */}
          <div className="flex flex-col w-[35vw]">
            <div className="h-[100vh] bg-slate-700">
              {renderActiveComponent()}
            </div>
          </div>
        </div>



      ) : (
        <div className="flex w-full   ">
          {/* Teacher Sharing Section */}
          <div className="w-[60vw] bg-slate-400 h-full flex flex-col justify-between">
            {/* Top Section: Teacher Status */}
            <div className="p-2 bg-slate-600 h-[5vh] text-white text-center">
              Teacher Status:
              <span className="font-bold"> Class in Progress</span> |
              <span className="font-bold"> 30 Participants</span>
            </div>

            {/* Middle Section: Shared Content */}
            {/* <div className="flex-grow flex items-center justify-center"> */}
            {/* {renderTeacherContent()} */}
            {/* </div> */}
            <div className='flex overflow-x-scroll overflow-y-hidden'>
              {renderTeacherContent()}
            </div>
            {teacherContent == "Slide" ? <div className=' flex  items-center justify-center '> <PDFControls className='z-10' isTeacher={true} ws={socket!} /> </div> : <></>}

            {/* Bottom Section: Control Bar */}

            <div className="p-4 bg-slate-800 text-white flex justify-between items-center">

              <CustomBar
                onBoardShare={() => {
                  if (teacherContent === "Whiteboard") {
                    setChangeScreen(true);
                  } else {
                    setTeacherContent("Whiteboard");
                  }

                  if (!socket || socket.readyState !== WebSocket.OPEN) {
                    console.log("Sender Socket Not open");
                    return;
                  }

                  socket.send(
                    JSON.stringify({
                      type: teacherContent !== "Whiteboard" ? "startBoard" : "endBoard",
                      roomId: roomId,
                    })
                  );
                }}

                onSlideShare={() => {
                  if (teacherContent === "Slide") {
                    setChangeScreen(true);
                  } else {
                    setTeacherContent("Slide");
                  }

                  if (!socket || socket.readyState !== WebSocket.OPEN) {
                    console.log("Sender Socket Not open");
                    return;
                  }

                  socket.send(
                    JSON.stringify({
                      type: teacherContent !== "Slide" ? "startSlide" : "endSlide",
                      roomId: roomId,
                    })
                  );
                }}
              />
            </div>


          </div>




          {/* Admin and Active Section */}
          <div className="flex flex-col w-[35vw]">
            <div className="h-[30vh] w-[35VW] bg-slate-500 flex items-center justify-center">
              <AdaptiveVideo adminTrackRef={adminTrackRef} />
            </div>
            <div className="h-[70vh] bg-slate-700">
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Navigation */}
      <div className="w-[5%] bg-gray-100  rounded">
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full text-left p-2 rounded ${activeSection === 'Chat' ? 'bg-gray-400' : ''}`}
              onClick={() => setActiveSection('Chat')}
            >
              <IoChatboxEllipses size={24} color='black' />
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left p-2 rounded ${activeSection === 'Poll' ? 'bg-gray-400' : ''}`}
              onClick={() => setActiveSection('Poll')}
            >
              <BsFillQuestionSquareFill size={24} color='black' />
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left p-2 rounded ${activeSection === 'Participants' ? 'bg-gray-400' : ''}`}
              onClick={() => setActiveSection('Participants')}
            >
              <BsFillPeopleFill size={24} color='black' />
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left p-2 rounded ${activeSection === 'Pool' ? 'bg-gray-400' : ''}`}
              onClick={() => setActiveSection('Rank')}
            >
              <FaPollH size={24} color='black' />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Videolayout;
