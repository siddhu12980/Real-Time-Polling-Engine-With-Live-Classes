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
	Id          string    `json:"id"`
	RoomId      string    `json:"roomId"`
	UserId      string    `json:"userId"`
	IsCorrect   bool      `json:"isCorrect"`
	Answer      string    `json:"answer"`
	SubmittedAt time.Time `json:"submittedAt"`
}

type RoomPollManager struct {
	Polls map[string]Poll
}

func (poll *Poll) GenerateLeaderboard() {

	type LeaderboardEntry struct {
		UserId         string
		SubmissionTime float32
	}

	var leaderboard []LeaderboardEntry

	for _, response := range poll.PollResponse {

		if response.IsCorrect {
			leaderboard = append(leaderboard, LeaderboardEntry{
				UserId:         response.UserId,
				SubmissionTime: float32(response.SubmittedAt.Sub(poll.StartTime).Seconds()),
			})
		}
	}

	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].SubmissionTime < leaderboard[j].SubmissionTime
	})

	fmt.Printf("Leaderboard for Poll: %s\n", poll.Id)
	for rank, entry := range leaderboard {
		fmt.Printf("Rank %d: User %s, Submission Time: %f\n", rank+1, entry.UserId, entry.SubmissionTime)
	}
}

func (rpm *RoomPollManager) AddPoll(poll Poll) {
	rpm.Polls[poll.Id] = poll
	fmt.Printf("poll with ID %s added successfully!\n %v \n", poll.Id, poll)
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

// Manager := RoomPollManager{
// 	Polls: make(map[string]Poll),
// }

func StartRoomPollManager() *RoomPollManager {
	return &RoomPollManager{
		Polls: make(map[string]Poll),
	}
}

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
