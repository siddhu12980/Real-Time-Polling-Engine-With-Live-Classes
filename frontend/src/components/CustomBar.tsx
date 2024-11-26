import { ControlBar, ControlBarProps } from "@livekit/components-react";
import { FaChalkboard, FaPoll, FaSlideshare } from "react-icons/fa"; // Importing icons

interface CustomBarProps extends ControlBarProps {
  onSlideShare?: () => void;
  onBoardShare?: () => void;
  onCreatePoll?: () => void;
}

export const CustomBar = ({
  onSlideShare,
  onBoardShare,
  onCreatePoll,
  ...props
}: CustomBarProps) => {

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 w-full p-2 bg-gray-800 ">
      {/* Main ControlBar */}
      <ControlBar {...props} className="flex-grow-0" />

      {/* Share Slide */}
      {onSlideShare && (
        <button
          className="lk-button bg-slate-600 hover:bg-slate-700 text-white h-12 w-12 sm:w-32 text-sm rounded-md flex items-center justify-center"
          onClick={onSlideShare}
        >
          <FaSlideshare className="text-xl sm:hidden" /> {/* Icon for small screens */}
          <span className="hidden sm:inline">Share Slide</span> {/* Text for larger screens */}
        </button>
      )}

      {/* Create Poll */}
      {onCreatePoll && (
        <button
          className="lk-button bg-slate-600 hover:bg-slate-700 text-white h-12 w-12 sm:w-32 text-sm rounded-md flex items-center justify-center"
          onClick={onCreatePoll}
        >
          <FaPoll className="text-xl sm:hidden" /> {/* Icon for small screens */}
          <span className="hidden sm:inline">Create Poll</span> {/* Text for larger screens */}
        </button>
      )}

      {/* Share Board */}
      {onBoardShare && (
        <button
          className="lk-button bg-slate-600 hover:bg-slate-700 text-white h-12 w-12 sm:w-32 text-sm rounded-md flex items-center justify-center"
          onClick={onBoardShare}
        >
          <FaChalkboard className="text-xl sm:hidden" /> {/* Icon for small screens */}
          <span className="hidden sm:inline">Share Board</span> {/* Text for larger screens */}
        </button>
      )}
    </div>
  );
};
