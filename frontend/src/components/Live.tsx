import {
  ControlBar,
  FocusLayout,
  LiveKitRoom,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';
import VideoChat from './VideoChat';

const serverUrl = 'wss://sidd-live-server-l3p4e136.livekit.cloud';

export default function Live() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchJWT = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw Error("Token not found");
        }
        setToken(token);
      } catch (e) {
        console.log("Error", e);
      }
    };
    fetchJWT();
  }, []); // Added dependency array to prevent infinite loop

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
          <AdaptiveLayout />
          <ControlBar />
        </LiveKitRoom>
      </div>
    </div>
  );
}


function AdaptiveLayout() {
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

  if (shareTrackRef) {
    // Layout with screen share (60-40 split)
    return (
      <div className="flex w-full  ">
        {/* Screen Share (60%) */}
        <div className="w-[70%] h-full bg-slate-900 ">
          <FocusLayout trackRef={shareTrackRef} className="h-full">
          </FocusLayout>
        </div>

        {/* Right side container (40%) */}
        <div className="w-[30%] flex flex-col h-[80vh]">
          {/* Admin Video (40% of right side) */}
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
            <VideoChat />
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
          <VideoChat />
        </div>
      </div>
    );
  }

}
