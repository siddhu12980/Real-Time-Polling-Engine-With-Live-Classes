package controller

import (
	"fmt"
	"live/prisma/db"
	"live/sdk"
	"live/typess"
	"time"

	"github.com/gin-gonic/gin"
)

type RoomController struct {
	db *db.PrismaClient
}

func NewRoomController(db *db.PrismaClient) *RoomController {
	return &RoomController{
		db: db,
	}
}

func (r *RoomController) CreateRoom(c *gin.Context) {

	var createRoomRequest typess.CreateRoomRequest

	fmt.Print("Create Room")

	if err := c.ShouldBindJSON(&createRoomRequest); err != nil {
		c.JSON(400, gin.H{"error": "Invalid JSON format"})
		return
	}

	_, err := sdk.Handle_room(createRoomRequest.Name)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create room"})
		return
	}

	user, ok := c.Get("user")

	if !ok {
		c.JSON(401, gin.H{"error": "User not found"})
		return
	}

	creator := user.(*typess.JwtData).UserId

	if creator == "" {
		c.JSON(401, gin.H{"error": "User not found"})
		return
	}

	//if scheduletime is provided then add starttime to the room

	scheduke := createRoomRequest.StartTime

	status := typess.StatusAvailable

	now := time.Now().UTC()

	scheduleTime := now

	fmt.Printf("\n \n Schedule Time %v , Now Time  %v \n \n", scheduke, now)

	if scheduke != nil {
		if now.After(*scheduke) {
			c.JSON(400, gin.H{"error": "Schedule time should be in future"})
			return
		}
		status = typess.StatusScheduled
		scheduleTime = *scheduke
	}

	dur := 60

	duration := createRoomRequest.Duration

	if duration != nil {
		dur = *duration
	}

	endTime := scheduke.Add(time.Minute * time.Duration(dur))

	fmt.Printf("\n \n Start Time %v End Time %v Duration %d \n \n Schedule %v", scheduke, endTime, dur, status)

	roomData, err := r.db.Room.CreateOne(
		db.Room.Name.Set(createRoomRequest.Name),
		db.Room.Title.Set(createRoomRequest.Title),
		db.Room.Creator.Link(
			db.User.ID.Equals(creator),
		),
		db.Room.StartTime.Set(scheduleTime),
		db.Room.EndTime.Set(endTime),
		db.Room.Duration.Set(dur),
		db.Room.Status.Set(db.Status(status)),
	).Exec(c.Request.Context())

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create room before updating Time "})
		return
	}

	c.JSON(200, gin.H{"room": roomData})

}

func (r *RoomController) GetAllRooms(c *gin.Context) {

	rooms, err := r.db.Room.FindMany().Exec(c.Request.Context())

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get rooms"})
		return
	}

	c.JSON(200, gin.H{"rooms": rooms})

}

func (r *RoomController) GetRoom(c *gin.Context) {

	roomID := c.Param("id")

	room, err := r.db.Room.FindUnique(
		db.Room.ID.Equals(roomID),
	).Exec(c.Request.Context())

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get room"})
		return
	}

	c.JSON(200, gin.H{"room": room})

}

func (r *RoomController) DeleteRoom(c *gin.Context) {

	roomID := c.Param("id")

	//find if room exists

	room, err := r.db.Room.FindUnique(
		db.Room.ID.Equals(roomID),
	).Exec(c.Request.Context())

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get room"})
		return
	}

	if room == nil {
		c.JSON(404, gin.H{"error": "Room not found"})
		return
	}

	err2 := sdk.Handle_room_delete(room.Name)

	if err2 != nil {
		c.JSON(500, gin.H{"error": "Failed to delete room"})
		return
	}

	res2, err3 := r.db.Room.FindUnique(
		db.Room.ID.Equals(roomID),
	).Delete().Exec(c.Request.Context())

	if err3 != nil {
		c.JSON(500, gin.H{"error": "Failed to delete room"})
		return
	}

	c.JSON(200, gin.H{"message": "Room deleted successfully", "room": res2})

}

func (r *RoomController) GetMyRooms(c *gin.Context) {

	user, ok := c.Get("user")

	if !ok {
		c.JSON(401, gin.H{"error": "User not found"})
		return
	}

	userId := user.(*typess.JwtData).UserId

	if userId == "" {
		c.JSON(401, gin.H{"error": "User not found"})
		return
	}

	rooms, err := r.db.Room.FindMany(
		db.Room.CreatorID.Equals(userId),
	).Exec(c.Request.Context())

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get rooms"})
		return
	}

	c.JSON(200, gin.H{"rooms": rooms})

}
