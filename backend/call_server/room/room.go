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
	Type          string         `json:"type"`
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

type LeaderboardEntry struct {
	UserId         string  `json:"userId"`
	SubmissionTime float32 `json:"submissionTime"`
	Rank           int     `json:"rank"`
}

type LeaderboardResult struct {
	PollId             string             `json:"pollId"`
	TotalUsers         int                `json:"totalUsers"`
	TotalSubmissions   int                `json:"totalSubmissions"` // Total number of submissions
	TotalCorrect       int                `json:"totalCorrect"`     // Total correct answers
	Rankings           []LeaderboardEntry `json:"rankings"`
	ResponseCount      map[string]int     `json:"responseCount"`
	CountNotResponded  int                `json:"countNotResponded"`
	CorrectAnswer      string             `json:"correctAnswer"`
	NotResponded       []string           `json:"notResponded"`
	IncorrectResponded []string           `json:"incorrectResponded"`
}

type RoomPollManager struct {
	Polls map[string]Poll
}

func (rpm *RoomPollManager) StartPoll(pollId string,
	userIds []string,
	callback func(result *LeaderboardResult, err error),
	broadcastFunc func(message map[string]interface{}) error) error {

	poll, exists := rpm.Polls[pollId]

	if !exists {
		return fmt.Errorf("poll %s not found", pollId)
	}

	if poll.IsActive {
		return fmt.Errorf("poll is already active")
	}

	now := time.Now()

	poll.IsActive = true
	poll.StartTime = now
	poll.EndTime = now.Add(time.Duration(poll.Duration) * time.Second)

	rpm.Polls[pollId] = poll

	//intitilize responses for all users
	if err := rpm.InitializePollResponses(pollId, userIds); err != nil {
		return fmt.Errorf("failed to initialize poll responses: %v", err)
	}

	broadcastMessage := map[string]interface{}{
		"id":   poll.Id,
		"type": "startPoll",
		"pollData": map[string]interface{}{
			"id":           poll.Id,
			"roomId":       poll.RoomId,
			"creatorId":    poll.CreatorId,
			"isActive":     poll.IsActive,
			"startTime":    poll.StartTime,
			"timer":        poll.Duration,
			"endTime":      poll.EndTime,
			"pollQuestion": poll.PollQuestion,
			"pollOptions":  poll.PollOptions,
			"type":         poll.Type,
		},
		"roomId": poll.RoomId,
	}

	if err := broadcastFunc(broadcastMessage); err != nil {
		return fmt.Errorf("failed to broadcast poll: %v", err)
	}

	go rpm.scheduleEndPoll(pollId, poll.Duration, callback)

	return nil
}

func (rpm *RoomPollManager) EndPoll(pollId string) (*LeaderboardResult, error) {
	poll, exists := rpm.Polls[pollId]

	if !exists {
		return nil, fmt.Errorf("poll %s not found", pollId)
	}

	poll.IsActive = false
	poll.EndTime = time.Now()
	rpm.Polls[pollId] = poll

	result, err := rpm.GenerateLeaderboard(pollId)

	fmt.Printf("poll %s Result : %v !\n", pollId, result)

	if err != nil {
		return nil, err
	}

	return result, nil
}

func (rpm *RoomPollManager) scheduleEndPoll(pollId string, duration int,
	callback func(result *LeaderboardResult, err error),
) {

	time.Sleep(time.Duration(duration)*time.Second + 1*time.Second)
	result, err := rpm.EndPoll(pollId)

	if err != nil {
		callback(nil, err)
		return
	}
	callback(result, nil)
}

func (rpm *RoomPollManager) GenerateLeaderboard(id string) (*LeaderboardResult, error) {
	poll, exists := rpm.Polls[id]
	if !exists {
		return nil, fmt.Errorf("poll id does not exist")
	}

	givenOption := poll.PollOptions

	optionCount := make(map[string]int)

	for _, option := range givenOption {
		optionCount[option] = 0
	}

	var rankings []LeaderboardEntry

	correctCount := 0

	var NotResponded []string

	var IncorrectResponded []string

	for _, response := range poll.PollResponse {

		if response.Answer != "" && response.Answer != "NA" {
			optionCount[response.Answer]++
		}

		if response.Answer == "NA" {
			NotResponded = append(NotResponded, response.UserId)
		}
		if !response.IsCorrect && response.Answer != "NA" {
			IncorrectResponded = append(IncorrectResponded, response.UserId)
		}

		if response.IsCorrect {
			correctCount++
			rankings = append(rankings, LeaderboardEntry{
				UserId:         response.UserId,
				SubmissionTime: float32(response.SubmittedAt.Sub(poll.StartTime).Seconds()),
			})
		}
	}

	sort.Slice(rankings, func(i, j int) bool {
		return rankings[i].SubmissionTime < rankings[j].SubmissionTime
	})

	for i := range rankings {
		rankings[i].Rank = i + 1
	}

	result := &LeaderboardResult{
		PollId:             id,
		TotalUsers:         len(poll.PollResponse),
		TotalSubmissions:   len(poll.PollResponse),
		TotalCorrect:       correctCount,
		Rankings:           rankings,
		ResponseCount:      optionCount,
		CountNotResponded:  len(NotResponded),
		IncorrectResponded: IncorrectResponded,
		NotResponded:       NotResponded,
		CorrectAnswer:      poll.CorrectAnswer,
	}

	return result, nil
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
		rpm.Polls[poll.Id] = poll
		fmt.Printf("Response from user %s added successfully to poll %s!\n", response.UserId, pollId)
	} else {
		fmt.Printf("Poll with ID %s not found!\n", pollId)
	}
}

func (rpm *RoomPollManager) CheckResponse(pollId string, userId string,
	answer string,

) (bool, error) {

	if poll, exists := rpm.Polls[pollId]; exists {

		if !poll.IsActive {
			fmt.Printf("Poll %s is not active!\n", pollId)
			return false, fmt.Errorf("poll is not active")
		}

		if time.Now().After(poll.EndTime) {
			fmt.Printf("Poll %s has ended!\n", pollId)
			return false, fmt.Errorf("poll has ended")
		}

		for i, response := range poll.PollResponse {
			if response.UserId == userId {

				if response.Answer != "NA" {
					fmt.Printf("Response from user %s already exists for poll %s!\n", userId, pollId)
					return response.IsCorrect, nil
				}

				isCorrect := (answer == poll.CorrectAnswer)

				poll.PollResponse[i] = pollResponse{
					Id:          response.Id,
					RoomId:      poll.RoomId,
					UserId:      userId,
					IsCorrect:   isCorrect,
					Answer:      answer,
					SubmittedAt: time.Now(),
				}

				rpm.Polls[pollId] = poll
				fmt.Printf("Response from user %s updated successfully for poll %s!\n", userId, pollId)

				return isCorrect, nil
			}
		}
	}
	fmt.Printf("Poll with ID %s not found!\n", pollId)

	return false, fmt.Errorf("poll not found")
}

func StartRoomPollManager() *RoomPollManager {
	return &RoomPollManager{
		Polls: make(map[string]Poll),
	}
}

func (rpm *RoomPollManager) InitializePollResponses(pollId string, users []string) error {
	poll, exists := rpm.Polls[pollId]
	if !exists {
		return fmt.Errorf("poll %s not found", pollId)
	}

	// Initialize responses for all users with "NA" answer
	for _, userId := range users {
		id := fmt.Sprintf("%s-%s", pollId, userId)
		response := pollResponse{
			Id:          id,
			RoomId:      poll.RoomId,
			UserId:      userId,
			IsCorrect:   false,
			Answer:      "NA", // Special marker for not answered
			SubmittedAt: time.Time{},
		}
		poll.PollResponse = append(poll.PollResponse, response)
		fmt.Printf("Default Response for user %s initialized successfully!\n", userId)

	}

	rpm.Polls[pollId] = poll
	return nil
}
