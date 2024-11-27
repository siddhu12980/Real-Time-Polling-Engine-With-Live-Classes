package room

import (
	"fmt"
	"sort"
	"time"
)

type Poll struct {
	Id            string         `json:"id"`
	RoomId        string         `json:"roomId"`
	CreatorId     string         `json:"creatorId"`
	IsActive      bool           `json:"isActive"`
	StartTime     time.Time      `json:"startTime"`
	Duration      int            `json:"duration"`
	EndTime       time.Time      `json:"endTime"`
	CorrectAnswer string         `json:"correctAnswer"`
	PollQuestion  string         `json:"pollQuestion"`
	PollOptions   []string       `json:"pollOptions"`
	PollResponse  []pollResponse `json:"pollResponse"`
}

type pollResponse struct {
	Id        string `json:"id"`
	RoomId    string `json:"roomId"`
	UserId    string `json:"userId"`
	IsCorrect bool   `json:"isCorrect"`
	Answer    string `json:"answer"`
}

type RoomPollManager struct {
	Polls map[string]Poll
}

func (poll *Poll) GenerateLeaderboard() {

	userTimes := make(map[string]time.Time)

	for _, response := range poll.PollResponse {

		if response.IsCorrect {

			if recordedTime, exists := userTimes[response.UserId]; exists {
				// Update if the current submission is earlier
				if response.SubmittedAt.Before(recordedTime) {
					userTimes[response.UserId] = response.SubmittedAt
				}
			} else {
				// Record the submission time for the user
				userTimes[response.UserId] = response.SubmittedAt
			}
		}
	}

	// Convert the map to a slice for sorting
	type LeaderboardEntry struct {
		UserId         string
		SubmissionTime time.Time
	}

	var leaderboard []LeaderboardEntry
	for userId, submissionTime := range userTimes {
		leaderboard = append(leaderboard, LeaderboardEntry{
			UserId:         userId,
			SubmissionTime: submissionTime,
		})
	}

	// Sort the leaderboard by submission time (ascending)
	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].SubmissionTime.Before(leaderboard[j].SubmissionTime)
	})

	// Display the leaderboard
	fmt.Printf("Leaderboard for Poll: %s\n", poll.Id)
	for rank, entry := range leaderboard {
		fmt.Printf("Rank %d: User %s, Submission Time: %s\n", rank+1, entry.UserId, entry.SubmissionTime)
	}
}

func (rpm *RoomPollManager) AddPoll(poll Poll) {
	rpm.Polls[poll.Id] = poll
	fmt.Printf("Poll with ID %s added successfully!\n", poll.Id)
}

func (rpm *RoomPollManager) AddResponse(pollId string, response pollResponse) {

	if poll, exists := rpm.Polls[pollId]; exists {
		poll.PollResponse = append(poll.PollResponse, response)
		rpm.Polls[pollId] = poll
		fmt.Printf("Response from user %s added successfully to poll %s!\n", response.UserId, pollId)
	} else {
		fmt.Printf("Poll with ID %s not found!\n", pollId)
	}
}

func (rpm *RoomPollManager) CheckResponse(pollId string, userId string, answer string) bool {
	if poll, exists := rpm.Polls[pollId]; exists {
		isCorrect := (answer == poll.CorrectAnswer)

		response := pollResponse{
			Id:        fmt.Sprintf("%s-%s", pollId, userId),
			RoomId:    poll.RoomId,
			UserId:    userId,
			IsCorrect: isCorrect,
			Answer:    answer,
		}
		rpm.AddResponse(pollId, response)
		return isCorrect
	}
	fmt.Printf("Poll with ID %s not found!\n", pollId)
	return false
}

// manager := RoomPollManager{
// 	Polls: make(map[string]Poll),
// }

// poll := Poll{
// 	Id:            "123",
// 	RoomId:        "room1",
// 	CreatorId:     "user1",
// 	IsActive:      true,
// 	StartTime:     time.Now(),
// 	Duration:      30,
// 	EndTime:       time.Now().Add(30 * time.Minute),
// 	CorrectAnswer: "Go",
// 	PollQuestion:  "What's the best programming language?",
// 	PollOptions:   []string{"Go", "Python", "JavaScript", "Java"},
// }

// User response to the poll
// userId := "user2"
// answer := "Go"

// Check if the user's answer is correct and add the response
// isCorrect := manager.CheckResponse(poll.Id, userId, answer)

// Output whether the answer was correct
// if isCorrect {
// 	fmt.Printf("The answer '%s' is correct for poll %s!\n", answer, poll.Id)
// } else {
// 	fmt.Printf("The answer '%s' is incorrect for poll %s.\n", answer, poll.Id)
// }
