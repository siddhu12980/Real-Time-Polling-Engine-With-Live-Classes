package controller

import (
	"live/prisma/db"
	"live/sdk"
	"live/typess"

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

	if err := c.ShouldBindJSON(&createRoomRequest); err != nil {
		c.JSON(400, gin.H{"error": "Invalid JSON format"})
		return
	}

	room, err := sdk.Handle_room(createRoomRequest.Name)

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

	r.db.Room.CreateOne(db.Room.Name.Set(room.Name),
		db.Room.Capacity.Set(int(room.MaxParticipants)),
		db.Room.Creator.Link(db.User.ID.Equals(creator)),
	).Exec(c)

	c.JSON(200, gin.H{"room": room})

}
