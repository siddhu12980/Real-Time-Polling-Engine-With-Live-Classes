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
import { useRecoilState } from 'recoil';
import { pollDataState, remainingTimeState, userState } from '../store/userStore';
import { useParams } from 'react-router-dom';
import Poll from './Poll';
import RankingList from './RankingList';

const serverUrl = 'wss://sidd-live-server-l3p4e136.livekit.cloud';

const apiUrl = 'http://localhost:8080/getToken';




const VideoUserLayout = () => {

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
          console.log("Tokken success", data);


          setToken(data.token)

          setUser({ ...user, livekitToken: data.token })

        })

        .catch((error) => {
          console.error("Error:", error);
        });
    }

    getToken()

  }, []);

  return <>
    {(token) ?
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

const Videolayouts = ({ }: { user: any, roomId: string }) => {
  const [activeSection, setActiveSection] = useState('Chat');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [pollData, setPollData] = useRecoilState(pollDataState);
  const [remainingTime, setRemainingTime] = useRecoilState(remainingTimeState);


  const handlePollEnd = () => {
    setPollData(null);
    setRemainingTime(0);
    setActiveSection('Chat');
  };


  const [changeScreen, setChangeScreen] = useState<boolean>(true);

  const [teacherContent, setTeacherContent] = useState<'Slide' | 'Screen' | 'Whiteboard' | 'None'>('None');

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
          console.log("Socket Connected");
          sockets.send(
            JSON.stringify({
              type: "receiver",
              roomId: "room1",
              name: 'user1',
              id: "u1"
            })
          );
        };



        sockets.onmessage = (message) => {
          const data = message.data;
          const message_json = JSON.parse(data)
          console.log("Received video user layout:", message_json);

          const message_type = message_json["type"]

          console.log(message_type)

          if (message_type) {

            switch (message_type) {
              case "startSlide":
                setChangeScreen(false)
                setTeacherContent("Slide")
                break

              case "endSlide":
                setChangeScreen(true)
                break

              case "startBoard":
                setChangeScreen(false)
                setTeacherContent("Whiteboard")
                break

              case "endBoard":
                setChangeScreen(true)
                break

              case "startPoll":
                console.log(message_json)
                setPollData((message_json as { pollData: any }).pollData)
                setRemainingTime((message_json as { pollData: any }).pollData.timer)
                setActiveSection("Pool")
                break

              case "pollResult":
                console.error("Poll Result", message_json)
                break



            }


          };

          sockets.onerror = (error) => {
            console.error("Socket Error:", error);
          };

          sockets.onclose = () => {
            console.log("Socket Closed");
          };
        };
      } catch (e) {
        console.error("Error connecting WebSocket:", e);
      }

    }
    connect();

    if (shareTrackRef) {
      console.log("Screen share is happening");

      setChangeScreen(false);
      setTeacherContent("Screen");
    }

    return () => {
      if (socket) {
        socket.close();
        console.log("Socket Closed on Cleanup");
      }
    };
  }, [shareTrackRef]);




  const renderActiveComponent = () => {


    switch (activeSection) {
      case 'Chat':
        return <VideoChat ws={socket} roomId='room1' userId='u1' username='user1' />;
      case 'AskQuestions':
        return <div className="p-4 bg-gray-300 rounded">Ask Questions Component</div>;

      case 'Rank':
        return <div className="p-4 bg-gray-300 rounded"> <RankingList userId='u1' rankings={} isTeacher={false} /> </div>;
      case 'Participants':
        return <div className="p-4 bg-gray-300 rounded">Participants Component</div>;
      case 'Pool':
        return pollData ?
          <div className="p-4 bg-gray-300 rounded">

            <Poll sendToTeacher={(data) => {

              console.log("Sending Poll Data", data);

              socket!.send(JSON.stringify({
                type: "pollResponse",
                roomId: "room1",
                userId: "u1",
                pollData: data
              }))
            }}

              changeLayoutBack={handlePollEnd}

              pollData={pollData} /></div>
          :
          <div className="p-4 bg-gray-300 rounded">No Poll Data</div>
      default:
        return null;
    }
  };

  const renderTeacherContent = () => {
    switch (teacherContent) {
      case 'Slide':
        return <div className="p-4  bg-blue-300 rounded ">   <PdfView /></div>;
      case 'Screen':
        return <div className="p-4 bg-green-300 rounded"><ShareTrackView shareTrackRef={shareTrackRef} /></div>;
      case 'Whiteboard':
        return <div className="p-4 bg-yellow-300 rounded h-[85vh] w-[60vw]" > <Draw roomId='room1' /> </div>;

      default:
        return <div onClick={() => setTeacherContent("Slide")} className="p-4 bg-red-300 rounded">  Nothing to See Here</div>;
    }
  };

  return (
    <div className="p-4 h-screen flex">

      {/* Main Layout */}
      {changeScreen ? (

        <div className="flex w-[95vw]">

          <div className="w-[70vw] bg-slate-400  flex flex-col justify-between">
            <div className=" flex items-center justify-center h-[90vh] w-full">
              <AdaptiveVideo adminTrackRef={adminTrackRef} />
            </div>
            <div className=' h-[calc(100vh-90vh)]'>
              <CustomBar />
            </div>
          </div>


          <div className="flex flex-col w-[calc(100vw-70vw)]">
            <div className="h-[100vh] bg-slate-700">
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full">

          <div className="w-[60vw] bg-slate-400 flex flex-col justify-between">

            <div className="flex-grow flex items-center justify-center ">
              {renderTeacherContent()}
            </div>

            {teacherContent == "Slide" ? <div className=' flex  items-center justify-center '> <PDFControls className='z-10' ws={socket!} /></div> : <></>}

            <div className="p-2 bg-slate-800 text-white ">
              <CustomBar />
            </div>

          </div>




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
      <div className="w-[calc(100vw-95vw)] bg-gray-300  rounded">
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
              className={`w-full text-left p-2 rounded ${activeSection === 'AskQuestions' ? 'bg-gray-400' : ''}`}
              onClick={() => setActiveSection('AskQuestions')}
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
              onClick={() => setActiveSection('Pool')}
            >
              <FaPollH size={24} color='black' />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUserLayout;
