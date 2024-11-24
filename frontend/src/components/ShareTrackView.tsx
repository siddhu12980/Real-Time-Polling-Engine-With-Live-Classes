import { FocusLayout, TrackReferenceOrPlaceholder } from "@livekit/components-react";

interface ShareTrackInterface {
    shareTrackRef: TrackReferenceOrPlaceholder | undefined
}

const ShareTrackView = ({ shareTrackRef }: ShareTrackInterface) => {
    return (
        <>
            {shareTrackRef && <FocusLayout trackRef={shareTrackRef} className="h-full">
            </FocusLayout>}

        </>


    )
}



export default ShareTrackView
