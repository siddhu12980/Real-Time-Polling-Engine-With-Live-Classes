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
import CreatePoll from './CreatePoll';



const serverUrl = 'wss://sidd-live-server-l3p4e136.livekit.cloud';

export default function User() {
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);



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


          {showCreatePoll && <div className=' z-10  absolute left-2/3 w-[50vh] h-[55vh]  bottom-[8vh] rounded-2xl p-2 '>
            <CreatePoll onClose={()=>setShowCreatePoll(false)} onSubmit={(data: any)=>{console.log(data)}}/>
          </div>}


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

        </div>
      </div>
    )

  }

  else if (board_share) {

    return (
      <div className="flex w-full  ">

        <div className="w-[70%] h-full bg-slate-900 ">
       
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
              <VideoChat ws={ws} userId='s1' username='sender1' roomId='room1' />
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
            <VideoChat ws={ws} userId='s1' username='sender1' roomId='room1' />
          </div>
        </div>
      );
    }
  }

}
