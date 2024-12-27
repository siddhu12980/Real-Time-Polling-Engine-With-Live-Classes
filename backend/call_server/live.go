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
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func GuidMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		fmt.Print("GuidMiddleware")

		header := c.GetHeader("Authorization")

		if header == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization Header"})
			c.Abort()
			return
		}

		token := strings.Split(header, "Bearer ")

		fmt.Printf("token : %v", token[1])

		if token == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Token"})
			c.Abort()
			return
		}

		err := helper.VerifyToken(token[1])

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token Verification Failed"})
			c.Abort()
			return
		}

		claims, err := helper.DecodeToken(token[1])

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token Decoding Failed"})
			c.Abort()
			return
		}

		c.Set("user", claims)

		c.Next()

	}
}

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
	ginRouter.GET("/user/all", GuidMiddleware(), controllerServer.FindAllUsersHandler)

	ginRouter.GET("/user/:id", controllerServer.FindUserByIdHandler)
	ginRouter.GET("/pdf/:doc", helper.GetPdf)

	ginRouter.GET("/ws", gin.WrapF(server.HandleWebSocket))

	log.Printf("WebRTC signaling server starting on :8080")
	// log.Fatal(ginRouter.Run(":8080"))claims

	serve := &http.Server{
		Addr:           ":8080",
		Handler:        ginRouter,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	serve_err := serve.ListenAndServe()

	if serve_err != nil {
		log.Fatalf("err starting server : %v", serve_err)
	}

}
