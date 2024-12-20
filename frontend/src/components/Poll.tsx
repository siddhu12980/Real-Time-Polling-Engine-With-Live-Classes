import React, { useState, useEffect } from "react";
import { ChevronRight, Clock } from "lucide-react";
import TimerBar from "./TimerBar";
import AnswerFeedback from "./AnswerFeedback";
import { useRecoilState } from "recoil";
import { pollDataState, remainingTimeState } from "../store/userStore";

enum PollType {
    FOUR_OPTION = "4_option",
    THREE_OPTION = "3_option",
    FIVE_OPTION = "5_option",
    TRUE_FALSE = "true_false"
}

interface PollProps {
    pollData: {
        id?: string;
        type: PollType;
        createdAt: string;
        timer: number;
        question: string | null;
    };
    sendToTeacher: (message: object) => void;
    changeLayoutBack: () => void;
}

const Poll: React.FC<PollProps> = ({ sendToTeacher, changeLayoutBack }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [pollData] = useRecoilState(pollDataState);
    const [remainingTime, setRemainingTime] = useRecoilState(remainingTimeState);

    // Initialize options when pollData changes
    useEffect(() => {
        if (!pollData) {
            changeLayoutBack();
            return;
        }

        const generateOptions = (type: PollType) => {
            switch (type) {
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
        };

        setOptions(generateOptions(pollData.type));
    }, [pollData, changeLayoutBack]);

    // Handle timer
    useEffect(() => {
        if (!pollData) return;

        if (remainingTime > 0) {
            const timer = setInterval(() => {
                setRemainingTime((prev) => {
                    const newTime = prev - 1;
                    if (newTime <= 0) {
                        clearInterval(timer);
                        setIsExpired(true);
                    }
                    return Math.max(0, newTime);
                });
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setIsExpired(true);
        }
    }, [pollData, remainingTime, setRemainingTime]);

    // Handle expiration
    useEffect(() => {
        if (isExpired && !showFeedback) {
            handleExpire();
        }
    }, [isExpired, showFeedback]);

    const handleOptionClick = (option: string) => {
        if (isExpired || selectedOption) return;

        setSelectedOption(option);
        sendToTeacher({
            id: pollData?.id || "1",
            userId: "u1",
            answer: option,
        });
    };

    const handleExpire = () => {
        setShowFeedback(true);

        if (selectedOption === null) {
            sendToTeacher({
                id: pollData?.id || "1",
                studentId: "u1",
                answer: "NA",
            });
        }

        setTimeout(() => {
            setShowFeedback(false);
            changeLayoutBack();
        }, 2000);
    };

    const getOptionStyle = (option: string) => {
        if (selectedOption === option) {
            return "border-gray-500 bg-gray-50 text-black";
        }
        return "border-white-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-500";
    };

    const renderStatusMessage = () => {
        if (isExpired && selectedOption === null) {
            return (
                <div className="flex items-center justify-center text-red-500">
                    <AnswerFeedback state="unanswered" />
                </div>
            );
        }

        if (selectedOption) {
            return (
                <div className="flex items-center justify-center">
                    <AnswerFeedback state="wrong" />
                </div>
            );
        }

        return null;
    };

    if (!pollData) return null;

    return (
        <div className="max-w-sm mx-auto bg-white shadow-md rounded-lg overflow-hidden p-4 md:p-6 w-full flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b-2 pb-2 px-2">
                <h2 className="text-lg font-semibold text-gray-800 flex-grow pr-4">
                    Poll {pollData.id?.[0]}
                </h2>
                <div className="flex items-center text-gray-500">
                    <Clock className="mr-2 w-5 h-5" />
                    <span className="text-sm font-medium">
                        {remainingTime}s
                    </span>
                </div>
            </div>

            {pollData.question && (
                <h2 className="text-lg mx-auto font-semibold text-gray-800 flex-grow pr-4">
                    {pollData.question}
                </h2>
            )}

            <TimerBar durationInSeconds={pollData.timer} />

            {showFeedback ? (
                renderStatusMessage()
            ) : (
                <div className="space-y-3">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            className={`
                                w-full text-left p-3 rounded-lg border-2 text-black transition-all duration-200 
                                flex items-center justify-between
                                ${getOptionStyle(option)}
                                ${(selectedOption || isExpired) ? 'cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            onClick={() => handleOptionClick(option)}
                            disabled={!!selectedOption || isExpired}
                        >
                            <span>{option}</span>
                            {!selectedOption && <ChevronRight className="text-gray-400" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Poll;