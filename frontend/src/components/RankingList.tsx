import { useRecoilValue } from "recoil";
import { pollDataState } from "../store/userStore";

type RankingList = {
    userId: string;
    rank: number;
    submissionTime: number;
}

interface RankingListProps {
    userId: string;
    isTeacher?: boolean;
}

const RankingList = ({ userId, isTeacher }: RankingListProps) => {
    const pollData = useRecoilValue(pollDataState);
    console.log("Poll Data inside Rank list", pollData);


    if (pollData == null || pollData.pollResult == null) {

        return <p>No rankings available!</p>;
    }





    const rankings: RankingList[] = pollData.pollResult.rankings || [];
    console.log(" Ranking inside Rank list", rankings);





    const getRankingsToDisplay = () => {
        if (isTeacher) {
            return rankings;
        }

        if (  rankings == null || rankings.length == 0) return [
            {
                userId: userId,
                rank: 0,
                submissionTime: 0
            }

        ] as RankingList[];

        if (rankings.length < 3) return rankings;

    

        const userRanking = rankings.find(r => r.userId === userId);
        const topThree = rankings.slice(0, 3);

        if (!userRanking) return topThree;

        const isUserInTopThree = topThree.some(r => r.userId === userId);
        if (isUserInTopThree) return topThree;

        return [...topThree, userRanking];
    };

    const displayRankings: RankingList[] = getRankingsToDisplay();

    return (

        <div className="w-full max-w-md mx-auto text-black">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Rankings</h2>
                <div className="space-y-2">
                    {displayRankings.map((ranking: RankingList) => (
                        <div
                            key={ranking.userId}
                            className={`flex items-center justify-between p-3 rounded ${ranking.userId === userId
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold w-8">{ranking.rank == 0 ? '-' : ranking.rank}</span>
                                <span>User {ranking.userId}</span>
                            </div>
                            <span className="text-gray-600">
                                {ranking.submissionTime == 0 ? '-' : ranking.submissionTime.toFixed(1)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>


    );
};

export default RankingList;