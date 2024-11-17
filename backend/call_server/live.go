package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type Peer struct {
	ID   string
	Name string
	Conn *websocket.Conn
}

type SignalingServer struct {
	sender   *Peer
	receiver *Peer
	upgrader websocket.Upgrader
}

func NewSignalingServer() *SignalingServer {
	return &SignalingServer{
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true

			},
		},
	}
}

func generateID() string {
	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
	return fmt.Sprintf("%d", timestamp)
}

func generateName(role string) string {
	return fmt.Sprintf("%s_%d", role, time.Now().Unix())
}

func (p *Peer) safeSend(message interface{}) error { //need to implemente mutex
	if p == nil || p.Conn == nil {
		return fmt.Errorf("peer or connection is nil")
	}

	return p.Conn.WriteJSON(message)
}

func (s *SignalingServer) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Connection upgrade error: %v", err)
		return
	}
	defer conn.Close()

	log.Printf("\n New WebSocket connection established from %s", conn.RemoteAddr())

	for {
		var message map[string]interface{}
		err := conn.ReadJSON(&message)
		if err != nil {
			log.Printf("Read error: %v", err)
			s.handleDisconnect(conn)
			break
		}

		messageType, ok := message["type"].(string)

		if !ok {
			log.Println("Invalid message type")
			continue
		}

		err = s.handleMessage(conn, messageType, message)

		if err != nil {
			log.Printf("Error handling message: %v", err)
		}
	}
}

func (s *SignalingServer) handleMessage(conn *websocket.Conn, messageType string, message map[string]interface{}) error {
	switch messageType {
	case "sender":
		id, ok := message["id"].(string)
		if !ok || id == "" {
			id = generateID()
		}

		name, ok := message["name"].(string)
		if !ok || name == "" {
			name = generateName("sender")
		}

		s.sender = &Peer{
			ID:   id,
			Name: name,
			Conn: conn,
		}

		log.Printf("\n Sender registered: %s (ID: %s)", s.sender.Name, s.sender.ID)

		return s.sender.safeSend(map[string]interface{}{
			"type": "connected",
			"role": "sender",
			"id":   id,
			"name": name,
		})

	case "receiver":

		id, ok := message["id"].(string)
		if !ok || id == "" {
			id = generateID()
		}

		name, ok := message["name"].(string)
		if !ok || name == "" {
			name = generateName("receiver")
		}

		s.receiver = &Peer{
			ID:   id,
			Name: name,
			Conn: conn,
		}

		log.Printf("\n Receiver registered: %s (ID: %s)", s.receiver.Name, s.receiver.ID)

		return s.receiver.safeSend(map[string]interface{}{
			"type": "connected",
			"role": "receiver",
			"id":   id,
			"name": name,
		})

	case "offer":
		fmt.Print("Offer arrived in Backend \n")
		if s.receiver == nil {
			return fmt.Errorf("no receiver available")
		}
		return s.receiver.safeSend(map[string]interface{}{
			"type": "offer",
			"sdp":  message["sdp"],
		})

	case "answer":
		fmt.Print("Answer Arrived in backend \n")
		if s.sender == nil {
			return fmt.Errorf("no sender available")
		}
		return s.sender.safeSend(map[string]interface{}{
			"type": "answer",
			"sdp":  message["sdp"],
		})

	case "ice":
		candidate := message["candidate"]

		fmt.Print("\n Candidate in backend  is_sender", conn == s.sender.Conn)

		targetPeer := s.sender
		if conn == s.sender.Conn {
			targetPeer = s.receiver
		}

		if targetPeer == nil {
			return fmt.Errorf("target peer not available")
		}

		return targetPeer.safeSend(map[string]interface{}{
			"type":      "ice",
			"candidate": candidate,
		})

	default:
		return fmt.Errorf("unknown message type: %s", messageType)
	}
}

func (s *SignalingServer) handleDisconnect(conn *websocket.Conn) {
	// s.peerMutex.Lock()
	// defer s.peerMutex.Unlock()

	if s.sender != nil && s.sender.Conn == conn {
		log.Println("Sender disconnected")
		s.sender = nil
	}
	if s.receiver != nil && s.receiver.Conn == conn {
		log.Println("Receiver disconnected")
		s.receiver = nil
	}
}

func main() {
	fmt.Print("Creating New SSignaling Server")
	server := NewSignalingServer()
	http.HandleFunc("/ws", server.HandleWebSocket)

	log.Printf("WebRTC signaling server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
