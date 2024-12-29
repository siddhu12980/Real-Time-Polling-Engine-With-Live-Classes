package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"live/service"
	"live/typess"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CourseController struct {
	courseService service.CourseService
}

func NewCourseController(courseService service.CourseService) *CourseController {
	return &CourseController{
		courseService: courseService,
	}
}

func (c *CourseController) CreateCourseHandler(ctx *gin.Context) {

	if ctx.Request.Method == http.MethodOptions {
		return
	}

	if ctx.Request.Method != http.MethodPost {
		ctx.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only POST method is allowed"})
		return
	}

	body, err := io.ReadAll(ctx.Request.Body)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read request body"})
		return
	}

	defer ctx.Request.Body.Close()

	var data typess.CourseCreateRequest

	if err := json.Unmarshal(body, &data); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	fmt.Printf("createCourseHandler %v", data)

	data1, exist := ctx.Get("user") // Get the user from the context

	if !exist {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fmt.Printf("\n \n Middelware Data %v", data1)

	userId := (data1).(*typess.JwtData).UserId

	if userId == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	req, err := c.courseService.CreateCourse(ctx, data, userId)

	if err != nil {
		HandleError(ctx, err)
		return
	}

	fmt.Printf(" \n Create Course Respone %v \n", req)

	ctx.JSON(http.StatusCreated, req)
}

func (c *CourseController) GetCourseHandler(ctx *gin.Context) {

	if ctx.Request.Method == http.MethodOptions {
		return
	}

	if ctx.Request.Method != http.MethodGet {
		ctx.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only GET method is allowed"})
		return
	}

	data, err := c.courseService.GetCourses(ctx.Request.Context())

	if err != nil {
		HandleError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, data)
}

func (c *CourseController) GetCourseByIdHandler(ctx *gin.Context) {

	if ctx.Request.Method == http.MethodOptions {
		return
	}

	if ctx.Request.Method != http.MethodGet {
		ctx.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only GET method is allowed"})
		return
	}

	id := ctx.Param("id")

	data, err := c.courseService.GetCourseByID(ctx.Request.Context(), id)

	if err != nil {
		HandleError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, data)
}

func (c *CourseController) UpdateCourseHandler(ctx *gin.Context) {

	if ctx.Request.Method == http.MethodOptions {
		return
	}

	if ctx.Request.Method != http.MethodPut {
		ctx.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only PUT method is allowed"})
		return
	}

	body, err := io.ReadAll(ctx.Request.Body)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read request body"})
		return
	}

	defer ctx.Request.Body.Close()

	var data typess.CourseUpdateRequest

	if err := json.Unmarshal(body, &data); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	data1, exist := ctx.Get("user") // Get the user from the context

	if !exist {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	fmt.Printf("\n \n Middelware Data %v", data1)

	userId := (data1).(*typess.JwtData).UserId

	if userId == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id := ctx.Param("id")

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course id"})
		return
	}

	req, err := c.courseService.UpdateCourse(ctx.Request.Context(), data, id)

	if err != nil {
		HandleError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, req)
}

func (c *CourseController) DeleteCourseHandler(ctx *gin.Context) {

	if ctx.Request.Method == http.MethodOptions {
		return
	}

	if ctx.Request.Method != http.MethodDelete {
		ctx.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only DELETE method is allowed"})
		return
	}

	data1, exist := ctx.Get("user") // Get the user from the context

	if !exist {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userId := (data1).(*typess.JwtData).UserId

	if userId == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id := ctx.Param("id")

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course id"})
		return
	}

	err := c.courseService.DeleteCourse(ctx.Request.Context(), id, userId)

	if err != nil {
		HandleError(ctx, err)
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{
		"message": "Course deleted successfully",
		"id":      id,
	})
}
