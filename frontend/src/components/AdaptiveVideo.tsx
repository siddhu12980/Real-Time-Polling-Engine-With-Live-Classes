import { FocusLayout, LiveKitRoom, TrackReferenceOrPlaceholder, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { CustomBar } from "./CustomBar";

interface AdaptiveVideoInterface {
    adminTrackRef: TrackReferenceOrPlaceholder | undefined
}


const AdaptiveVideo = ({ adminTrackRef }: AdaptiveVideoInterface) => {
    { console.log("Admin Track ref", adminTrackRef) }


    return <>
        {
            adminTrackRef &&
            <FocusLayout trackRef={adminTrackRef} className="h-full w-full">
            </FocusLayout>
        }
    </>

}






export default AdaptiveVideo
