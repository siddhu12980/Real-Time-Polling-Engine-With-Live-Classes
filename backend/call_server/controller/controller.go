package controller

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"live/helper"
	"live/sdk"
	"live/service"
	"live/typess"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService service.UserService
}

func NewUserController(userService service.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

func HandleError(c *gin.Context, err error) {
	var ginErr *gin.Error
	if errors.As(err, &ginErr) {
		meta := ginErr.Meta.(gin.H)
		c.JSON(meta["statusCode"].(int), gin.H{"error": ginErr.Error()})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
}

func (u *UserController) EnrollUserToCOourse(c *gin.Context) {

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

	var data typess.EnrollUserToCourseRequest

	if err := json.Unmarshal(body, &data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	fmt.Printf("Received: Data = %v\n", data)

	err = u.userService.EnrollUserToCourse(c, data.UserId, data.CourseId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := &typess.WebResponse{
		Message: "User enrolled successfully",
	}

	c.JSON(http.StatusOK, res)
}

func (u *UserController) GetUserEnrollments(c *gin.Context) {

	if c.Request.Method == http.MethodOptions {
		return
	}

	if c.Request.Method != http.MethodGet {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only GET method is allowed"})
		return
	}

	defer c.Request.Body.Close()

	check, exist := c.Get("user")

	if !exist {
		fmt.Print("User not found")
	} else {
		fmt.Print("User found %v", check)
	}

	userId := c.Query("userId")

	enrollments, err := u.userService.GetUserEnrolledCourses(c, userId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := &typess.WebResponse{
		Message: "User enrollments fetched successfully",
		Data:    enrollments,
	}

	c.JSON(http.StatusOK, res)

}

func (u *UserController) GetAllUserInACourse(c *gin.Context) {

	if c.Request.Method == http.MethodOptions {
		return
	}

	if c.Request.Method != http.MethodGet {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only GET method is allowed"})
		return
	}

	defer c.Request.Body.Close()

	check, exist := c.Get("user")

	if !exist {
		fmt.Print("User not found")
	} else {
		fmt.Print("User found %v", check)
	}

	courseId := c.Query("courseId")

	users, err := u.userService.GetAllUserInCourse(c, courseId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := &typess.WebResponse{
		Message: "Users in course fetched successfully",
		Data:    users,
	}

	c.JSON(http.StatusOK, res)

}

func (u *UserController) SignupUserHandler(c *gin.Context) {

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

	var data typess.SignupuserRequest

	if err := json.Unmarshal(body, &data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	fmt.Printf("\n Received: Data  = %v \n", data)

	user, err := u.userService.SignupUser(c.Request.Context(), data)

	if err != nil {
		HandleError(c, err)
		return
	}

	token_data := typess.JwtData{
		UserId:   user.ID,
		Role:     user.Role,
		Username: user.Username,
	}

	token, err := helper.CreateToken(token_data)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return

	}

	res := &typess.WebResponse{
		Message: "User Ceated successfully",
		Data:    token,
	}

	c.JSON(http.StatusOK, res)

}

func (u *UserController) SigninUserHandler(c *gin.Context) {

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

	var data typess.SigninuserRequest

	if err := json.Unmarshal(body, &data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	fmt.Printf("Received: Email = %s\n", data.Email)

	user, err := u.userService.SinginUser(c.Request.Context(), data)

	if err != nil {
		HandleError(c, err)
		return
	}

	token_data := typess.JwtData{
		UserId:   user.ID,
		Role:     user.Role,
		Username: user.Username,
	}

	token, err := helper.CreateToken(token_data)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := &typess.WebResponse{
		Message: "User Login successfully",
		Data:    token,
	}

	c.JSON(http.StatusOK, res)

}

func (u *UserController) FindAllUsersHandler(c *gin.Context) {

	if c.Request.Method == http.MethodOptions {
		return
	}

	if c.Request.Method != http.MethodGet {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only GET method is allowed"})
		return
	}

	defer c.Request.Body.Close()

	check, exist := c.Get("user")

	if !exist {
		fmt.Print("User not found")
	} else {
		fmt.Print("User found %v", check)
	}

	users, err := u.userService.FindAllUsers(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := &typess.WebResponse{
		Message: "Users fetched successfully",
		Data:    users,
	}

	c.JSON(http.StatusOK, res)

}

func (u *UserController) FindUserByIdHandler(c *gin.Context) {

	if c.Request.Method == http.MethodOptions {
		return
	}

	if c.Request.Method != http.MethodGet {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only GET method is allowed"})
		return
	}

	body_data, err := io.ReadAll(c.Request.Body)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read request body"})
		return
	}

	defer c.Request.Body.Close()

	var data typess.FindUserByIdRequest

	if err := json.Unmarshal(body_data, &data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	user, err := u.userService.FindUserById(c, data)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := &typess.WebResponse{
		Message: "User fetched successfully",
		Data:    user,
	}

	c.JSON(http.StatusOK, res)
}

func (u *UserController) RemoveUserHandler(c *gin.Context) {

	if c.Request.Method == http.MethodOptions {
		return
	}

	if c.Request.Method != http.MethodDelete {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only DELETE method is allowed"})
		return
	}

	body_data, err := io.ReadAll(c.Request.Body)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read request body"})
		return
	}

	defer c.Request.Body.Close()

	var data typess.FindUserByIdRequest

	if err := json.Unmarshal(body_data, &data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	user, err := u.userService.RemoveUser(c, data.UserId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := &typess.WebResponse{
		Message: "User removed successfully",
		Data:    user,
	}

	c.JSON(http.StatusOK, res)

}

func (u *UserController) GetTokenHandler(c *gin.Context) {

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

	var data typess.UserRoomData

	if err := json.Unmarshal(body, &data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	room_token := sdk.GetJoinToken(data.Room, typess.Role(data.Role))

	res := &typess.WebResponse{
		Message: "Token generated successfully",
		Data:    room_token,
	}

	c.JSON(http.StatusOK, res)

	fmt.Printf("Received: Name = %s\n", data.Name)

}
