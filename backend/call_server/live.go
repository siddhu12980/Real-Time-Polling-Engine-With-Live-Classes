package main

import (
	"fmt"
	"live/config"
	"live/controller"
	"live/helper"
	"live/prisma/db"
	"live/repository"
	"live/service"
	"live/signaling"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func AuthMiddleware(client *db.PrismaClient) gin.HandlerFunc {
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

		// need to check if user exists in db and if user role is admin or not
		userId := claims.UserId

		ctx := c.Request.Context()

		data, err := client.User.FindUnique(
			db.User.ID.Equals(userId),
		).Exec(ctx)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		fmt.Printf("User Data from Db : %v", data)

		c.Set("user", claims)

		c.Next()

	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json")
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

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

	ginRouter.Use(CORSMiddleware())

	ginRouter.POST("/getToken", AuthMiddleware(db), controllerServer.GetTokenHandler)

	ginRouter.POST("/auth/signup", controllerServer.SignupUserHandler)
	ginRouter.POST("/auth/signin", controllerServer.SigninUserHandler)
	ginRouter.POST("/user/removeUser", controllerServer.RemoveUserHandler)
	ginRouter.GET("/user/all", AuthMiddleware(db), controllerServer.FindAllUsersHandler)

	ginRouter.GET("/user/:id", controllerServer.FindUserByIdHandler)
	ginRouter.GET("/pdf/:doc", helper.GetPdf)

	ginRouter.GET("/ws", gin.WrapF(server.HandleWebSocket))

	log.Printf("WebRTC signaling server starting on :8080")
	log.Fatal(ginRouter.Run(":8080"))

}
