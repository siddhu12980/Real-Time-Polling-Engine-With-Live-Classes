import {
  FocusLayout,
  LiveKitRoom,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import VideoChat from './VideoChat';
import { CustomBar } from './CustomBar';
import PdfView from './PdfView';
import { PDFControls } from './PDFControls';
import Draw from './Draw';



const serverUrl = 'wss://sidd-live-server-l3p4e136.livekit.cloud';

export default function User() {
  const [token, setToken] = useState<string | null>(null);
  const [shareSlide, setShareSlide] = useState<boolean>(false);
  const [shareBoard, setBoardShare] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const fetchJWT = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("Token not found");
        }
        setToken(token);
      } catch (e) {
        console.error("Error fetching JWT:", e);
      }
    };

    const connect = async () => {
      try {
        const sockets = new WebSocket("ws://127.0.0.1:8080/ws");
        sockets.onopen = () => {
          setSocket(sockets);

          console.log("Socket Connected");
          sockets.send(
            JSON.stringify({
              type: "sender",
              roomId: "room1",
              name: "sender1",
              id: "s1"
            })
          );
        };

        sockets.onmessage = (message) => {
          const data = message.data;
          console.log("Received:", data);
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

    fetchJWT();
    connect();

    return () => {
      if (socket) {
        socket.close();
        console.log("Socket Closed on Cleanup");
      }
    };
  }, []);

  return (


    <div className="h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full h-full  max-h-[90vh] bg-slate-800 rounded-lg shadow-lg  p-4">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token!}
          serverUrl={serverUrl}
          data-lk-theme="default"
        >
          <AdaptiveLayout share_slide={shareSlide} board_share={shareBoard} ws={socket!} />
          <CustomBar

            onBoardShare={() => {
              setShareSlide(false)
              setBoardShare((p) => !p)

              if (!socket || socket.readyState != WebSocket.OPEN) {
                console.log("Sender Socket Not open ")
                return
              }
              socket.send(JSON.stringify({
                "type": !shareBoard ? "startBoard" : "endBoard",
                "roomId": "room1"
              }))

            }}

            onSlideShare={() => {
              setBoardShare(false)
              setShareSlide((p) => !p)

              if (!socket || socket.readyState != WebSocket.OPEN) {
                console.log("Sender Socket Not open ")
                return
              }

              socket.send(JSON.stringify({
                "type": !shareSlide ? "startSlide" : "endSlide",
                "roomId": "room1"
              }))
            }} />


        </LiveKitRoom>
      </div>
    </div>
  );
}




function AdaptiveLayout({ share_slide, board_share, ws }: { share_slide: boolean, board_share: boolean, ws: WebSocket }) {

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

  if (share_slide) {

    return (
      <div className="flex w-full  ">

        <div className="w-[70%] h-full bg-slate-900 ">
          <PdfView />
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <PDFControls />
        </div>

        <div className="w-[30%] flex flex-col h-[80vh]">

          <div className="flex-[4] bg-slate-600 h-1/4 pb-2">
            {adminTrackRef ? (
              <FocusLayout trackRef={adminTrackRef} className="h-full">
              </FocusLayout>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                Waiting for teacher...
              </div>
            )}
          </div>

          <div className="flex-[6] bg-white h-[40vh]  ">
            <VideoChat roomId='room1' ws={ws} userId='s1' username='sender1' />
          </div>
        </div>
      </div>
    )

  }

  else if (board_share) {

    return (
      <div className="flex w-full  ">

        <div className="w-[70%] h-full bg-slate-900 ">
          <Draw role='teacher' roomId='room1' />
        </div>



        <div className="w-[30%] flex flex-col h-[80vh]">

          <div className="flex-[4] bg-slate-600 h-1/4 pb-2">
            {adminTrackRef ? (
              <FocusLayout trackRef={adminTrackRef} className="h-full">
              </FocusLayout>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                Waiting for teacher...
              </div>
            )}
          </div>

          <div className="flex-[6] bg-white h-[40vh]  ">
            <VideoChat  roomId='room1' ws={ws} userId='s1' username='sender1' />
          </div>
        </div>
      </div>
    )}


  else {

    if (shareTrackRef) {
      return (
        <div className="flex w-full  ">
          {/* Screen Share (60%) */}
          <div className="w-[70%] h-full bg-slate-900 ">
            <FocusLayout trackRef={shareTrackRef} className="h-full">
            </FocusLayout>
          </div>

          <div className="w-[30%] flex flex-col h-[80vh]">
            <div className="flex-[4] bg-slate-600 h-1/4 pb-2">
              {adminTrackRef ? (
                <FocusLayout trackRef={adminTrackRef} className="h-full">
                </FocusLayout>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  Waiting for teacher...
                </div>
              )}
            </div>

            <div className="flex-[6] bg-white h-[40vh]  ">
              <VideoChat ws={ws} userId='s1' username='sender1'  roomId='room1'/>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex w-full h-[80vh] ">
          {/* Admin Video (50%) */}
          <div className="w-1/2  h-full bg-slate-800">
            {adminTrackRef ? (
              <FocusLayout trackRef={adminTrackRef} className="h-full">
              </FocusLayout>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                Waiting for teacher...
              </div>
            )}
          </div>

          {/* Chat (50%) */}
          <div className="w-1/2   bg-blue-500   " >
            <VideoChat ws={ws} userId='s1' username='sender1'  roomId='room1'/>
          </div>
        </div>
      );
    }
  }

}
