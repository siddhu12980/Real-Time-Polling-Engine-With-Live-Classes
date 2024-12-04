import React, { useState, useEffect } from "react";
import { ChevronRight, Check, X, Clock } from "lucide-react";
import TimerBar from "./TimerBar";
import AnswerFeedback from "./AnswerFeedback";

enum PollType {
    FOUR_OPTION = "4_option",
    THREE_OPTION = "3_option",
    FIVE_OPTION = "5_option",
    TRUE_FALSE = "true_false"
}

interface PoolProps {
    pollData: {
        id?: string;
        type: PollType;
        correctAnswer: string;
        createdAt: string;
        timer: number;
        question: string | null;
    };
    sendToTeacher: (message: object) => void;
}


const Poll: React.FC<PoolProps> = ({ pollData, sendToTeacher }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [remainingTime, setRemainingTime] = useState(pollData.timer);
    const [options, setOptions] = useState<string[]>([]);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);

    useEffect(() => {
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
    }, [pollData.type]);

    useEffect(() => {
        const timer = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    handleExpire();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOptionClick = (option: string) => {

        if (isExpired) return;

        setSelectedOption(option);

        const isCorrect = option === pollData.correctAnswer;

        const createdAt = new Date(pollData.createdAt);

        const currentTime = Date.now();

        const diffInSeconds_float = (currentTime - createdAt.getTime());


        const diffInSeconds = Math.round(diffInSeconds_float);

        const message = {
            id: pollData.id || "1",
            studentId: "u1",
            answer: option,
            timeTaken: diffInSeconds,
            isCorrect,
        };

        sendToTeacher(message);


    };

    const handleExpire = () => {

        setShowFeedback(true);

        setTimeout(() => {
            setShowFeedback(false);
        }, 2000);


        if (selectedOption === null) {
            setIsExpired(true);

            const message = {
                id: pollData.id || "1",
                studentId: "u1",
                answer: "NA",
                isCorrect: false,
                timeTaken: "NA",
            };
            sendToTeacher(message);
        }
    };

    const getOptionStyle = (option: string) => {
        if (selectedOption === option) {
            return "border-gray-500 bg-gray-50 text-black"
        }
        return "border-white-300  bg-gray-50 hover:bg-blue-50 hover:border-blue-500";
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
            const isCorrect = selectedOption === pollData.correctAnswer;
            return (
                <div className={`flex items-center justify-center `}>
                    <span>
                        {isCorrect
                            ? <AnswerFeedback state="correct" />
                            : <AnswerFeedback state="wrong" />
                        }
                    </span>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="max-w-sm mx-auto bg-white shadow-md rounded-lg overflow-hidden p-4 md:p-6 w-full flex flex-col gap-4 relative">


            <div className="flex items-center justify-between border-b-2 pb-2  px-2">
                <h2 className="text-lg font-semibold text-gray-800 flex-grow pr-4">
                    Poll {pollData.id![0]}
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
                                ${selectedOption ? 'cursor-not-allowed' : 'cursor-pointer'}
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