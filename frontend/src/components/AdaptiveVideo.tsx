import { FocusLayout,  TrackReferenceOrPlaceholder} from "@livekit/components-react";

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
