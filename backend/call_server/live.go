package main

import (
	"encoding/json"
	"fmt"
	"io"
	"live/sdk"
	"live/signaling"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type RequestData struct {
	Name string `json:"name"`
	Room string `json:"room"`
}

func getTokenHandler(c *gin.Context) {

	if c.Request.Method == http.MethodOptions {
		return
	}

	if c.Request.Method != http.MethodPost {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only POST method is allowed"})
		return
	}

	body, err := io.ReadAll(c.Request.Body)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read request body"})
		return
	}
	defer c.Request.Body.Close()

	var data RequestData
	if err := json.Unmarshal(body, &data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	fmt.Printf("Received: Name = %s\n", data.Name)
	token := sdk.GetJoinToken(data.Room, data.Name)

	c.JSON(http.StatusOK, gin.H{"token": token})
}

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatalf("err loading ENV : %v", err)
	}

	fmt.Print("Creating New SSignaling Server")
	server := signaling.NewSignalingServer()

	ginRouter := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}

	ginRouter.Use(cors.New(config))

	ginRouter.POST("/getToken", getTokenHandler)

	ginRouter.GET("/ws", gin.WrapF(server.HandleWebSocket))

	log.Printf("WebRTC signaling server starting on :8080")
	log.Fatal(ginRouter.Run(":8080"))
}
