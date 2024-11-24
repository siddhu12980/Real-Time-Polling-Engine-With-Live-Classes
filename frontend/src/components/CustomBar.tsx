import { ControlBar, ControlBarProps } from "@livekit/components-react";

interface CustomBarProps extends ControlBarProps {
    onSlideShare?: () => void,
    onBoardShare?: () => void,
    onCreatePoll?: () => void,

}


export const CustomBar = ({ onSlideShare, onBoardShare, onCreatePoll, ...props }: CustomBarProps) => (


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



        {onCreatePoll &&
            <button
                className="lk-button   text-xs "
                onClick={onCreatePoll}
            >
                Create Poll
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



