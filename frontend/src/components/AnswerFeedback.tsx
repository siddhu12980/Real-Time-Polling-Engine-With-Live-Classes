import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

type AnswerState = 'correct' | 'wrong' | 'unanswered';

const AnswerFeedback = ({ state }: { state: AnswerState }) => {

    if (state === 'correct') {
        return (
            <div className="text-center">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
                <h1 className="text-2xl font-bold text-green-500 mt-4">Well Done!</h1>
                <p className="text-gray-700 mt-2">You got the correct answer!</p>
            </div>
        );
    }

    if (state === 'wrong') {
        return (
            <div className="text-center">
                <FaTimesCircle className="text-red-500 text-6xl mx-auto" />
                <h1 className="text-2xl font-bold text-red-500 mt-4">Wrong Answer</h1>
                <p className="text-gray-700 mt-2">Better luck next time!</p>
            </div>
        );
    }

    if (state === 'unanswered') {
        return (
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500 mx-auto flex items-center justify-center">
                    <span className="text-4xl text-white font-bold">!</span>
                </div>
                <h1 className="text-2xl font-bold text-yellow-500 mt-4">No Answer</h1>
                <p className="text-gray-700 mt-2">Time ran out before answering!</p>
            </div>
        );
    }

    return null;
};

export default AnswerFeedback