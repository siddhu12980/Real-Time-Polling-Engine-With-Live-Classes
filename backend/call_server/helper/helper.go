package helper

import (
	"fmt"
	"time"
)

func GenerateID() string {
	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
	return fmt.Sprintf("%d", timestamp)
}

func GenerateName(role string) string {
	return fmt.Sprintf("%s_%d", role, time.Now().Unix())
}

func GetFormattedTime() string {
	currentTime := time.Now()
	return currentTime.Format("2006-01-02 15:04:05")
}
