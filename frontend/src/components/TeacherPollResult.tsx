import { useState } from "react";
import { pollDataState } from "../store/userStore";
import { useRecoilValue } from "recoil";
import ClockLoader from "react-spinners/ClockLoader";
import TimerBar from "./TimerBar";




interface RankingList {
    userId: string;
    rank: number;
    submissionTime: number;
}

const resultType = ["Correct", "Incorrect", "Unanswered"] as const;


const ResultComponent = ({ displayRankings }: { displayRankings: RankingList[] }) => {
    return (
        <div className="w-full max-w-md">
            <div className="bg-white shadow rounded-sm p-4 ">
                <h2 className="text-lg font-semibold mb-2">Rankings</h2>
                <div className="space-y-1 h-40 overflow-y-auto pr-2 no-scrollbar">
                    {displayRankings.length == 0 ?
                        <div key={'1'} className="text-gray-500  text-sm  flex justify-center items-center">No rankings available!</div>
                        :
                        displayRankings.map((ranking) => (
                            <div
                                key={ranking.userId}
                                className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <span className="font-semibold w-6">{ranking.rank ?? '-'}</span>
                                    <span className="text-sm">User {ranking.userId}</span>
                                </div>
                                <span className="text-gray-600 text-xs">


                                    {ranking.submissionTime
                                        ? ranking.submissionTime.toFixed(1)
                                        : '--'}


                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

const TeacherPollResult = () => {
    const [result, setResult] = useState<typeof resultType[number]>("Correct");
    const [Loading, setLoading] = useState<boolean>(true);

    const pollData = useRecoilValue(pollDataState);


    if (pollData == null) {
        return <div>No poll  available</div>;
    }

    if (pollData != null && pollData.pollResult == null) {
        return <div className=" flex justify-center items-center relative  h-2/3 p-4">

            <TimerBar durationInSeconds={pollData.timer} />

            <ClockLoader />
        </div>;
    }

    if (pollData.pollResult?.totalSubmissions == 0) {
        return <div className="text-gray-500 text-sm">
            No participants
        </div>;
    }




    const optionDistribution = pollData.pollResult?.responseCount || {};
    


    const getRankings = (type: typeof resultType[number]): RankingList[] => {
        switch (type) {
            case "Correct":
                return pollData.pollResult?.rankings || [];
            case "Incorrect":
                return pollData.pollResult?.incorrectResponded || [];
            case "Unanswered":
                return pollData.pollResult?.notResponded || [];
        }

    };

    const getTotalCount = (type: typeof resultType[number]): number => {
        switch (type) {
            case "Correct":
                if (!pollData.pollResult) return 0;
                return pollData.pollResult?.totalCorrect || 0;

            case "Incorrect":
                if (!pollData.pollResult) return 0;

                const ans = (pollData.pollResult?.totalSubmissions - pollData.pollResult?.totalCorrect - pollData.pollResult?.countNotResponded) || 0;

                if (typeof (ans) !== "number") {
                    return 0;
                };
                return ans;

            case "Unanswered":
                if (!pollData.pollResult) return 0;
                return pollData.pollResult?.countNotResponded || 0;


        }
    }

    const BarChart = ({ distribution }: { distribution: typeof optionDistribution }) => {
        const maxValue = Math.max(...Object.values(distribution));

        return (
            <div className="w-full flex items-end justify-center gap-8 full  " >
                {Object.entries(distribution).map(([option, value]) => (
                    <div key={option} className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <div
                                style={{ height: `${(value / maxValue) * 100}px` }}
                                className={`w-8 
                                    ${option === pollData.pollResult?.correctAnswer ? " bg-green-200" : "bg-red-300"}
                                    `}
                            >
                                <div className="absolute -top-6 w-full text-center text-xs">
                                    {value / pollData.pollResult!.totalSubmissions * 100} %
                                </div>
                            </div>
                        </div>
                        <div className="text-sm font-medium">{option}</div>
                    </div>
                ))}
            </div>
        );
    };



    return (
        <div className="flex  bg-white flex-col items-center gap-4  border-2  rounded-lg  text-black">

            <div className="w-full pt-8">
                <BarChart distribution={optionDistribution} />

            </div>

            <div className="border-y border-black p-2 w-full text-center text-sm  font-bold" >
                {(getTotalCount(result) / (pollData.pollResult?.totalSubmissions ?? 1) * 100).toFixed(0)}% answred {result.toLowerCase()}
            </div>

            <div className="flex justify-center gap-3 w-full">
                {resultType.map((res) => (
                    <button
                        key={res}
                        className={`px-3 py-1 text-sm rounded transition-all ${result === res
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        onClick={() => setResult(res)}
                    >
                        {res}
                    </button>
                ))}
            </div>

            <ResultComponent displayRankings={getRankings(result)} />
        </div>
    );
};

export default TeacherPollResult;