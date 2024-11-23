package signaling

import (
	"fmt"
	"live/helper"
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

type Receiver []*Peer

type Room struct {
	ID        string
	Receivers *Receiver
	Sender    *Peer
}

type SignalingServer struct {
	rooms    map[string]*Room
	upgrader websocket.Upgrader
}

type Message map[string]interface{}

func NewSignalingServer() *SignalingServer {

	return &SignalingServer{
		rooms: make(map[string]*Room),

		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true

			},
		},
	}
}

func NewRoom(roomID string) *Room {
	return &Room{
		ID:        roomID,
		Sender:    &Peer{},
		Receivers: &Receiver{},
	}
}

func (s *SignalingServer) RoomExists(roomID string) bool {
	_, exists := s.rooms[roomID]
	return exists
}

func getFormattedTime() string {
	currentTime := time.Now()
	return currentTime.Format("2006-01-02 15:04:05")
}

func (s *SignalingServer) getPeerFromROom(roomID string, userId string, conn *websocket.Conn) (*Peer, error) {
	rooms, exists := s.rooms[roomID]

	if !exists {
		return nil, fmt.Errorf("s Room doesnot Exists")
	}

	if rooms.Sender.ID == userId && rooms.Sender != nil {

		if rooms.Sender.Conn == conn {
			fmt.Print("Sender Found with same id and same ws")
			return rooms.Sender, nil

		} else {
			fmt.Print("Connection Reassong with new ws")
			rooms.Sender.Conn = nil
			rooms.Sender.Conn = conn

			return rooms.Sender, nil

		}
	}

	for _, receiver := range *rooms.Receivers {

		if receiver != nil {

			if receiver.ID == userId {

				if receiver.Conn == conn {
					fmt.Print("Receiver Found with same id and same ws")
					return receiver, nil

				} else {
					fmt.Print("Connection Reassong with new ws")
					receiver.Conn = nil
					receiver.Conn = conn

					return receiver, nil
				}
			}

		}

	}

	return nil, fmt.Errorf("No User FOund with that iD")

}

func (s *SignalingServer) JoinRoom(roomId string, peer *Peer) error {
	if !s.RoomExists(roomId) {
		newRoom := NewRoom(roomId)
		s.rooms[roomId] = newRoom
	}

	room := s.rooms[roomId]

	*room.Receivers = append(*room.Receivers, peer)

	return nil
}

func (s *SignalingServer) BroadCastMessage(roomId string, message Message, sender *websocket.Conn) error {

	room, exists := s.rooms[roomId]
	if !exists {
		return fmt.Errorf("room %s does not exist", roomId)
	}

	fmt.Printf("Broadcasting message to room %s\n", roomId)

	if room.Sender.Conn != sender {
		room.Sender.safeSend(message)
	}

	for _, receiver := range *room.Receivers {
		if receiver == nil || receiver.Conn == nil || receiver.Conn == sender {
			continue
		}

		fmt.Print("Sending Message to ", receiver.Name)

		err := receiver.safeSend(message)

		if err != nil {
			log.Printf("Error broadcasting to receiver %s: %v\n", receiver.ID, err)
			continue
		}
	}

	return nil
}

func (s *SignalingServer) HandleMessage(conn *websocket.Conn, messageType string, message map[string]interface{}) error {

	switch messageType {

	case "sender":
		roomId, okk := message["roomId"].(string)

		if !okk || roomId == "" {
			return fmt.Errorf("Room Id Needed")
		}

		id, ok := message["id"].(string)
		if !ok || id == "" {
			id = helper.GenerateID()
		}

		if !s.RoomExists(roomId) {
			new_room := NewRoom(roomId)
			s.rooms[roomId] = new_room

			fmt.Print("Room Created")
		}

		name, ok := message["name"].(string)

		if !ok || name == "" {
			name = helper.GenerateName("sender")
		}

		sender := &Peer{
			ID:   id,
			Name: name,
			Conn: conn,
		}

		fmt.Print("Setting Sender")

		s.rooms[roomId].Sender = sender

		log.Printf("\n Sender registered: %s (ID: %s)", sender.Name, sender.ID)

		fmt.Print(s.rooms)

		return sender.safeSend(map[string]interface{}{
			"type": "connected",
			"role": "sender",
			"id":   id,
			"name": name,
		})

	case "receiver":

		roomId, okk := message["roomId"].(string)

		if !okk || roomId == "" {
			return fmt.Errorf("Room Id Needed")
		}

		id, ok := message["id"].(string)

		if !ok || id == "" {
			id = helper.GenerateID()
		}

		name, ok := message["name"].(string)

		if !ok || name == "" {
			name = helper.GenerateName("receiver")
		}

		if !s.RoomExists(roomId) {
			return fmt.Errorf("Room Id Doesnt Exists")
		}

		receiver := &Peer{
			ID:   id,
			Name: name,
			Conn: conn,
		}

		err := s.JoinRoom(roomId, receiver)

		if err != nil {
			return fmt.Errorf("adding Receiver to Room Failed")
		}

		log.Printf("\n Receiver registered: %s (ID: %s)", receiver.Name, receiver.ID)

		message := map[string]interface{}{
			"type": "connected",
			"role": "receiver",
			"id":   id,
			"name": name,
		}

		receiver.safeSend(message)

		return s.BroadCastMessage(roomId, message, conn)

	case "startSlide":

		roomId, ok := message["roomId"].(string)

		if !ok || roomId == "" {
			return fmt.Errorf("Room Id not provided")
		}

		if !s.RoomExists(roomId) {
			return fmt.Errorf("Room not Available")
		}
		room := s.rooms[roomId]

		if conn != room.Sender.Conn || room.Sender == nil || room.Sender.Conn == nil {
			return fmt.Errorf("Room not Available")
		}

		fmt.Print("Broadcasting start slide ")

		message := map[string]interface{}{
			"type":   "startSlide",
			"sender": room.Sender,
		}

		return s.BroadCastMessage(roomId, message, conn)

	case "startBoard":

		roomId, ok := message["roomId"].(string)

		if !ok || roomId == "" {
			return fmt.Errorf("Room Id not provided")
		}

		if !s.RoomExists(roomId) {
			return fmt.Errorf("Room not Available")
		}
		room := s.rooms[roomId]

		if conn != room.Sender.Conn || room.Sender == nil || room.Sender.Conn == nil {
			fmt.Print("Only Admin can start Board")

		}

		fmt.Print("Broadcasting start Board ")

		message := map[string]interface{}{
			"type":   "startBoard",
			"sender": room.Sender,
		}

		return s.BroadCastMessage(roomId, message, conn)

	case "endSlide":

		roomId, ok := message["roomId"].(string)

		if !ok || roomId == "" {
			return fmt.Errorf("Room Id not provided")
		}

		if !s.RoomExists(roomId) {
			return fmt.Errorf("Room not Available")
		}
		room := s.rooms[roomId]

		if conn != room.Sender.Conn || room.Sender == nil || room.Sender.Conn == nil {
			fmt.Print("Only Admin can End Slide")

		}

		fmt.Print("Broadcasting End slide ")

		message := map[string]interface{}{
			"type":   "endSlide",
			"sender": room.Sender,
		}

		return s.BroadCastMessage(roomId, message, conn)

	case "endBoard":

		roomId, ok := message["roomId"].(string)

		if !ok || roomId == "" {
			return fmt.Errorf("Room Id not provided")
		}

		if !s.RoomExists(roomId) {
			return fmt.Errorf("Room not Available")
		}
		room := s.rooms[roomId]

		if conn != room.Sender.Conn || room.Sender == nil || room.Sender.Conn == nil {
			fmt.Print("Only Admin can end Board")

		}

		fmt.Print("Broadcasting End Board ")

		message := map[string]interface{}{
			"type":   "endBoard",
			"sender": room.Sender,
		}

		return s.BroadCastMessage(roomId, message, conn)

	case "pdf-control":

		value := 0.0

		roomId, ok := message["roomId"].(string)

		if !ok || roomId == "" {
			return fmt.Errorf("Room Id not provided")
		}

		action, ok2 := message["action"].(string)

		if !ok2 || action == "" {
			return fmt.Errorf("Action")
		}

		val, okk := message["value"].(float64)

		if okk {
			value = val
		}

		if !s.RoomExists(roomId) {
			return fmt.Errorf("Room not Available")
		}

		// room := s.rooms[roomId]

		// if conn != room.Sender.Conn || room.Sender == nil || room.Sender.Conn == nil {
		// 	fmt.Print("Only Admin can end Board")

		// }

		message := map[string]interface{}{
			"type":   "pdf-control",
			"action": action,
			"value":  value,
		}

		fmt.Print("\n \n Sending Pdf control message", message)

		return s.BroadCastMessage(roomId, message, conn)

	case "chat":

		roomId, ok := message["roomId"].(string)

		if !ok || roomId == "" {
			return fmt.Errorf("Room Id not provided")
		}

		userId, found := message["userId"].(string)

		if !found {
			return fmt.Errorf("user Id not provided")
		}

		user_message, found := message["message"]

		if !found {
			return fmt.Errorf("no message Provided")
		}

		if !s.RoomExists(roomId) {
			return fmt.Errorf("Room not Available")
		}

		peer, err := s.getPeerFromROom(roomId, userId, conn)

		if err != nil {
			return err
		}

		new_message := map[string]interface{}{
			"id":        message["id"],
			"sender":    peer,
			"message":   user_message,
			"type":      "chat",
			"timestamp": message["timestamp"],
		}

		return s.BroadCastMessage(roomId, new_message, conn)

	default:
		return fmt.Errorf("unknown message type: %s", messageType)
	}
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

		fmt.Printf("Message in Backend %s", message)
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

		err = s.HandleMessage(conn, messageType, message)

		if err != nil {
			log.Printf("Error handling message: %v", err)
		}
	}
}

func (s *SignalingServer) handleDisconnect(conn *websocket.Conn) {

	isFound := false

	for roomID, room := range s.rooms {

		if room.Sender.Conn == conn {
			log.Printf("Sender Disconneted From Rooom %s", roomID)

			msg := fmt.Sprintf("%s left the chat", room.Sender.Name)

			message := map[string]interface{}{
				"message": msg,
			}

			s.BroadCastMessage(roomID, message, conn)

			room.Sender = nil
			isFound = true

			break

		}

		if !isFound {
			for i, peer := range *room.Receivers {

				if peer != nil && peer.Conn == conn {
					log.Printf("Receiver disconnected from room %s\n", roomID)

					*room.Receivers = append((*room.Receivers)[:i], (*room.Receivers)[i+1:]...)

					msg := fmt.Sprintf("%s left the chat", peer.Name)

					message := map[string]interface{}{
						"message": msg,
					}
					s.BroadCastMessage(roomID, message, conn)

					if len(*room.Receivers) == 1 {
						log.Printf("Room %s is now empty and will be removed\n", roomID)
						delete(s.rooms, roomID)
					}

					return
				}
			}
		}

	}
}
