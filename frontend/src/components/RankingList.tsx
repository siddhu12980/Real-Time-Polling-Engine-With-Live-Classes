
type RankingList = {
    userId: string;
    rank: number;
    submissionTime: number;
}

const RankingList = ({ rankings, userId, isTeacher = false }: {
    rankings: { userId: string, rank: number, submissionTime: number }[],
    userId: string,
    isTeacher?: boolean
}) => {
    const getRankingsToDisplay = () => {
        if (isTeacher) {
            return rankings;
        }

        if (rankings.length < 3) return rankings;

        if (rankings.length == 0) return [] as RankingList[];

        const userRanking = rankings.find(r => r.userId === userId);
        const topThree = rankings.slice(0, 3);

        if (!userRanking) return topThree;

        const isUserInTopThree = topThree.some(r => r.userId === userId);
        if (isUserInTopThree) return topThree;

        return [...topThree, userRanking];
    };

    const displayRankings: RankingList[] = getRankingsToDisplay();

    return (

        <div className="w-full max-w-md mx-auto">
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
                                <span className="font-semibold w-8">{ranking.rank}</span>
                                <span>User {ranking.userId}</span>
                            </div>
                            <span className="text-gray-600">
                                {ranking.submissionTime.toFixed(2)}s
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RankingList;