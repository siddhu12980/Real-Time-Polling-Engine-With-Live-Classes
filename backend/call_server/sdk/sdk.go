package sdk

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/livekit/protocol/auth"
	livekit "github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go/v2"
)

func GetJoinToken(room, identity string) string {
	fmt.Print("generating TOken")
	fmt.Print("\n env", os.Getenv("LIVEKIT_API_KEY"))
	at := auth.NewAccessToken(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))

	canPublish := false
	canSubscribe := true

	if identity == "admin" {
		canPublish = true

	}

	grant := &auth.VideoGrant{
		RoomJoin:     true,
		Room:         room,
		CanPublish:   &canPublish,
		CanSubscribe: &canSubscribe,
	}

	at.SetVideoGrant(grant).SetIdentity(identity).SetValidFor(time.Hour)

	token, _ := at.ToJWT()
	return token
}

func Handle_room() {
	fmt.Print("fucls \n")
	fmt.Print(os.Getenv("LIVEKIT_API_KEY"), "\n")

	fmt.Print(os.Getenv("LIVEKIT_API_SECRET"), "\n")

	host := "https://sidd-live-server-l3p4e136.livekit.cloud"

	roomClient := lksdk.NewRoomServiceClient(host, os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))

	room, _ := roomClient.CreateRoom(context.Background(), &livekit.CreateRoomRequest{
		Name:            "myroom1",
		EmptyTimeout:    10 * 60, // -> 10 min
		MaxParticipants: 20,
	}) //lets say this is class meet then there would be diefin number of partiticipatant

	fmt.Printf("\n Room Created %v", room)

	rooms, _ := roomClient.ListRooms(context.Background(), &livekit.ListRoomsRequest{})

	fmt.Printf("\n All the rooms : %v", rooms)

}

func Handle_part() {
	host := "https://sidd-live-server-l3p4e136.livekit.cloud"

	roomClient := lksdk.NewRoomServiceClient(host, os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))

	res, err := roomClient.ListParticipants(context.Background(), &livekit.ListParticipantsRequest{
		Room: "myroom1",
	})

	fmt.Printf(" \n All the participatnt: %v \n", res)

	res2, err2 := roomClient.GetParticipant(context.Background(), &livekit.RoomParticipantIdentity{
		Room:     "myroom1",
		Identity: "user1",
	})

	if err != nil || err2 != nil {
		fmt.Print("Error: ", err, err2)
		os.Exit(1)
	}

	fmt.Printf("Participating info %v", res2)

}

func upgrade_participatant(roomName string, identity string) { //upgrading participant from user to publisher

	host := "https://my.livekit.host"
	c := lksdk.NewRoomServiceClient(host, os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_KEY"))

	res1, err1 := c.UpdateParticipant(context.Background(), &livekit.UpdateParticipantRequest{
		Room:     roomName,
		Identity: identity,
		Permission: &livekit.ParticipantPermission{
			CanSubscribe:   true,
			CanPublish:     true,
			CanPublishData: true,
		},
	})

	fmt.Printf("User is %s is now host ", identity)

	// ...and later move them back to audience
	res2, err2 := c.UpdateParticipant(context.Background(), &livekit.UpdateParticipantRequest{
		Room:     roomName,
		Identity: identity,
		Permission: &livekit.ParticipantPermission{
			CanSubscribe:   true,
			CanPublish:     false,
			CanPublishData: true,
		},
	})

	if err1 != nil || err2 != nil {
		fmt.Print("Error: ", err1, err2)
		os.Exit(1)
	}

	fmt.Printf("\n USer is now %s normal", identity)

	fmt.Printf("\n Res1: %v", res1)

	fmt.Printf("\n Res2: %v", res2)

}

//user want to change name
// func update_metada_user() {
// 	data, err := json.Marshal(values)
// 	_, err = c.UpdateParticipant(context.Background(), &livekit.UpdateParticipantRequest{
// 		Room:     roomName,
// 		Identity: identity,
// 		Metadata: string(data),
// 	})
// }

// func remove_user() {
// 	res, err := roomClient.RemoveParticipant(context.Background(), &livekit.RoomParticipantIdentity{
// 		Room:     roomName,
// 		Identity: identity,
// 	})
// }

// func mute_user{
// 	res, err := roomClient.MutePublishedTrack(context.Background(), &livekit.MuteRoomTrackRequest{
// 		Room:     roomName,
// 		Identity: identity,
// 		TrackSid: "track_sid",
// 		Muted:    true,
// 	  })
// }
