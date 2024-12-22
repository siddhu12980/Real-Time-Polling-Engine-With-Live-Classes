import React, { useState, useEffect, useCallback, useMemo } from "react";
import {  Clock } from "lucide-react";
import TimerBar from "./TimerBar";
import { useRecoilState } from "recoil";
import { pollDataState, remainingTimeState } from "../store/userStore";

enum PollType {
    FOUR_OPTION = "4_option",
    THREE_OPTION = "3_option",
    FIVE_OPTION = "5_option",
    TRUE_FALSE = "true_false"
}


interface TeacherPollProps {
    changeLayoutBack: () => void;
    handleRanking: () => void;
}

const TacherPollViewComponent: React.FC<TeacherPollProps> = ({
    changeLayoutBack,
    handleRanking,
}) => {
    const [isExpired, setIsExpired] = useState(false);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [pollData, setPollData] = useRecoilState(pollDataState);
    const [remainingTime, setRemainingTime] = useRecoilState(remainingTimeState);



    const options = useMemo(() => {
        if (!pollData) return [];

        switch (pollData.type) {
            case PollType.FIVE_OPTION:
                return ['A', 'B', 'C', 'D', 'E'];
            case PollType.FOUR_OPTION:
                return ['A', 'B', 'C', 'D'];
            case PollType.THREE_OPTION:
                return ['A', 'B', 'C'];
            case PollType.TRUE_FALSE:
                return ['True', 'False'];
            default:
                return ['A', 'B', 'C', 'D'];
        }
    }, [pollData?.type]);

    const handleExpire = useCallback(() => {

        setShowFeedback(true);

        setTimeout(() => {
            setShowFeedback(false);
            changeLayoutBack();
        }, 2000);

    }, [pollData?.id, changeLayoutBack]);

    useEffect(() => {
        if (!pollData) {
            changeLayoutBack();
            return;
        }
    }, [pollData, changeLayoutBack]);

    useEffect(() => {
        if (!pollData || remainingTime <= 0) {
            setIsExpired(true);

            if (remainingTime <= 0) handleExpire();
            return;
        }

        const timer = setInterval(() => {

            setRemainingTime((prev) => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    clearInterval(timer);
                    setIsExpired(true);
                    handleExpire();
                }

                return Math.max(0, newTime);
            });


        }, 1000);



        return () => clearInterval(timer);
    }, [pollData, handleExpire, remainingTime, setRemainingTime]);



    // const getOptionStyle = useCallback((option: string) => {
    //     if (selectedOption === option) {
    //         return "border-gray-500 bg-gray-100 text-black";
    //     }
    //     return "border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-500";
    // }, [selectedOption]);

    const renderStatusMessage = useCallback(() => {
        if (isExpired) {
            return (
                <div className="flex items-center justify-center text-red-500">
                    <span className="font-semibold text-lg">Poll Completed!</span>
                </div>
            );
        }

    }, [isExpired]);

    if (!pollData) return null;

    return (
        <div className="max-w-2xl mx-auto p-4 ">
            <div className="flex flex-col gap-6 relative">
                <TimerBar durationInSeconds={pollData.timer} />
                <div className="bg-white shadow-lg rounded-xl overflow-hidden p-6 w-full flex flex-col gap-4 ">

                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 ">


                        <h2 className="text-xl font-bold text-gray-800">
                            Poll {pollData.id?.[0]}
                        </h2>
                        <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                            <Clock className="mr-2 w-4 h-4" />
                            <span className="font-medium">
                                {remainingTime}s
                            </span>
                        </div>
                    </div>

                    {pollData.question && (
                        <h3 className="text-lg text-gray-700 font-medium">
                            {pollData.question}
                        </h3>
                    )}


                    {showFeedback ? (
                        <div className="h-40 flex items-center justify-center">
                            {renderStatusMessage()}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    className={`
                                        w-full text-left text-black p-4 rounded-lg border-2 transition-all duration-200 
                                        flex items-center justify-between
                                 
                                        
                                        ${pollData.pollResult?.correctAnswer === option ? 'border-green-500 bg-green-50' : ''}
                                        ${pollData.pollResult && pollData.pollResult.correctAnswer !== option ? 'border-red-100' : ''}
                                    `}
                                    disabled
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-medium">{option}</span>
                                        {pollData.pollResult && (
                                            <span className="text-sm text-gray-600">
                                                {((pollData.pollResult.responseCount[option] || 0) / pollData.pollResult.totalSubmissions * 100).toFixed(1)}%
                                            </span>
                                        )}
                                    </div>

                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className="w-full bg-black text-white text-xl font-semibold py-4 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    onClick={handleRanking}
                >
                    Show Ranking
                </button>
            </div>
        </div>
    );
};

export default TacherPollViewComponent;