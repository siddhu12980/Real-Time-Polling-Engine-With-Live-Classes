import { useSetRecoilState } from 'recoil';
import { PollData, pollDataState, PollResult } from './userStore';


export const usePollResultSetter = () => {
    const setPollData = useSetRecoilState(pollDataState);

    // Set entire poll result
    const setPollResult = (newPollResult: Partial<PollResult>) => {
        setPollData((currentPollData: PollData | null) => {
            if (!currentPollData) return null;

            return {
                ...currentPollData,
                pollResult: currentPollData.pollResult
                    ? { ...currentPollData.pollResult, ...newPollResult }
                    : {
                        responseCount: {},
                        correctAnswer: '',
                        totalSubmissions: 0,
                        countNotResponded: 0,
                        ranking: [],
                        totalCorrect: 0,
                        ...newPollResult
                    }
            };
        });
    };

    // Create new complete poll result
    const createNewPollResult = (result: PollResult) => {
        setPollData((currentPollData: PollData | null) => {
            if (!currentPollData) return null;

            return {
                ...currentPollData,
                pollResult: result
            };
        });
    };

    // Helper function to update specific fields of poll result
    const updatePollResultField = <K extends keyof PollResult>(
        field: K,
        value: PollResult[K]
    ) => {
        setPollData((currentPollData: PollData | null) => {
            if (!currentPollData || !currentPollData.pollResult) return currentPollData;

            return {
                ...currentPollData,
                pollResult: {
                    ...currentPollData.pollResult,
                    [field]: value
                }
            };
        });
    };

    // Helper function to increment response count for a specific option
    const incrementResponseCount = (option: string) => {
        setPollData((currentPollData: PollData | null) => {
            if (!currentPollData || !currentPollData.pollResult) return currentPollData;

            const currentCount = currentPollData.pollResult.responseCount[option] || 0;

            return {
                ...currentPollData,
                pollResult: {
                    ...currentPollData.pollResult,
                    responseCount: {
                        ...currentPollData.pollResult.responseCount,
                        [option]: currentCount + 1
                    },
                    totalSubmissions: currentPollData.pollResult.totalSubmissions + 1
                }
            };
        });
    };

    // Set complete ranking list
    const setRankings = (rankings: { userId: string; submissionTime: number; rank: number }[]) => {
        updatePollResultField('ranking', rankings);
    };

    const updatePollData = (updates: Partial<PollData>) => {
        setPollData((currentPollData) => {
            if (!currentPollData) return null;

            return {
                ...currentPollData,
                ...updates
            };
        });
    };

    return {
        setPollResult,        // For partial updates
        createNewPollResult,  // For complete new result
        updatePollResultField,
        incrementResponseCount,
        setRankings,      // For complete rankings
        updatePollData
    };
};