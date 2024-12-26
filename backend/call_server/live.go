package main

import (
	"fmt"
	"live/config"
	"live/controller"
	"live/helper"
	"live/repository"
	"live/service"
	"live/signaling"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatalf("err loading ENV : %v", err)
	}

	fmt.Print("Creating New SSignaling Server")

	db, err1 := config.ConnectDB()

	if err1 != nil {
		log.Fatalf("err connecting to db : %v", err)
	}

	defer db.Prisma.Disconnect()

	userRepositoy := repository.NewUserRepoImp(db)

	userService := service.NewUserService(userRepositoy)

	controllerServer := controller.NewUserController(userService)

	server := signaling.NewSignalingServer()

	ginRouter := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}

	ginRouter.Use(cors.New(config))

	ginRouter.POST("/getToken", controllerServer.GetTokenHandler)

	ginRouter.POST("/auth/signup", controllerServer.SignupUserHandler)
	ginRouter.POST("/auth/signin", controllerServer.SigninUserHandler)
	ginRouter.POST("/user/removeUser", controllerServer.RemoveUserHandler)
	ginRouter.GET("/user/all", controllerServer.FindAllUsersHandler)

	ginRouter.GET("/user/:id", controllerServer.FindUserByIdHandler)
	ginRouter.GET("/pdf/:doc", helper.GetPdf)

	ginRouter.GET("/ws", gin.WrapF(server.HandleWebSocket))

	log.Printf("WebRTC signaling server starting on :8080")
	log.Fatal(ginRouter.Run(":8080"))
}
