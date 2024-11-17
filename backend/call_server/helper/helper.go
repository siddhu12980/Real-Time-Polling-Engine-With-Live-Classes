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
