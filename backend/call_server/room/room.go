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

func (rpm *RoomPollManager) GenerateLeaderboard(id string) {

	type LeaderboardEntry struct {
		UserId         string
		SubmissionTime float32
	}

	var leaderboard []LeaderboardEntry

	poll, exists := rpm.Polls[id]

	if !exists {
		err := fmt.Errorf("poll id doesnot  exists")
		fmt.Println(err)
	}

	fmt.Printf("Total Response in this poll %v", poll.PollResponse)

	for _, response := range poll.PollResponse {

		if response.IsCorrect {
			leaderboard = append(leaderboard, LeaderboardEntry{
				UserId:         response.UserId,
				SubmissionTime: float32(response.SubmittedAt.Sub(poll.StartTime).Seconds()),
			})
		}
	}

	fmt.Printf("LeardBoard Entry %v", leaderboard)

	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].SubmissionTime < leaderboard[j].SubmissionTime
	})

	fmt.Printf("Leaderboard for Poll: %s\n", poll.Id)
	for rank, entry := range leaderboard {
		fmt.Printf("Rank %d: User %s, Submission Time: %f\n", rank+1, entry.UserId, entry.SubmissionTime)
	}
}

func (rpm *RoomPollManager) AddPoll(poll Poll) {

	if _, exists := rpm.Polls[poll.Id]; exists {
		println("Poll with same id already exits ")
		err := fmt.Errorf("poll id already exists")
		fmt.Println(err)
	}

	rpm.Polls[poll.Id] = poll

	fmt.Printf("poll with ID %s added successfully!\n %v \n", poll.Id, poll)

}

func (rpm *RoomPollManager) AddResponse(pollId string, response pollResponse) {
	if poll, exists := rpm.Polls[pollId]; exists {
		poll.PollResponse = append(poll.PollResponse, response)
		rpm.Polls[poll.Id] = poll // cause i am using copy refrence not a pointer refreence

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

		fmt.Printf("Response added for user %v , \n response data %v \n", userId, response)
		return isCorrect
	}
	fmt.Printf("Poll with ID %s not found!\n", pollId)
	return false
}

func StartRoomPollManager() *RoomPollManager {
	return &RoomPollManager{
		Polls: make(map[string]Poll),
	}
}

func start() {

	manager := StartRoomPollManager()

	poll := Poll{
		Id:            "123",
		RoomId:        "room1",
		CreatorId:     "user1",
		IsActive:      true,
		StartTime:     time.Now(),
		Duration:      30,
		EndTime:       time.Now().Add(30 * time.Minute),
		CorrectAnswer: "Go",
		PollQuestion:  "What's the best programming language?",
		PollOptions:   []string{"Go", "Python", "JavaScript", "Java"},
	}

	manager.AddPoll(poll)

	manager.CheckResponse(poll.Id, "user2", "Go")
	manager.CheckResponse(poll.Id, "user1", "Go")
	manager.CheckResponse(poll.Id, "user3", "JS")

	manager.GenerateLeaderboard(poll.Id)

}
