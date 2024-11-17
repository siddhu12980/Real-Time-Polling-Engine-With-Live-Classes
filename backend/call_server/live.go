package main

import (
	"encoding/json"
	"fmt"
	"io"
	"live/sdk"
	"live/signaling"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

type RequestData struct {
	Name string `json:"name"`
	Room string `json:"room"`
}

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatalf("err loading: %v", err)
	}

	fmt.Print("Creating New SSignaling Server")
	server := signaling.NewSignalingServer()

	// sdk.Handle_room()

	sdk.Handle_part()

	http.HandleFunc("/getToken", func(w http.ResponseWriter, r *http.Request) {

		enableCors(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
			return
		}

		body, err := io.ReadAll(r.Body)

		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusInternalServerError)
			return
		}

		defer r.Body.Close()

		var data RequestData
		if err := json.Unmarshal(body, &data); err != nil {
			http.Error(w, "Invalid JSON format", http.StatusBadRequest)
			return
		}

		fmt.Printf("Received: Name = %s\n", data.Name)

		token := sdk.GetJoinToken(data.Room, data.Name)

		message := map[string]interface{}{
			"token": token,
		}

		jsonResponse, err := json.Marshal(message)
		if err != nil {
			http.Error(w, "Failed to serialize response", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		w.Write(jsonResponse)

	})

	http.HandleFunc("/ws", server.HandleWebSocket)

	log.Printf("WebRTC signaling server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
