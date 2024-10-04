import { ControlBar } from "@livekit/components-react";

export const CustomBar = ({ onSlideShare, onBoardShare, ...props }: { onSlideShare?: () => void, onBoardShare?: () => void }) => (
    <div className=" flex justify-center">
        <ControlBar {...props} />

        {onSlideShare &&
            <button
                className="lk-button   text-xs "
                onClick={onSlideShare}
            >
                Share Slide
            </button>
        }

        {
            onBoardShare &&
            <button
                className="lk-button   text-xs "
                onClick={onBoardShare}
            >
                Share Board
            </button>



        }

    </div>
);



