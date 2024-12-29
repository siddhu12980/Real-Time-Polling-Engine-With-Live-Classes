package typess

import (
	"context"
	"errors"
	"time"
)

// create role enum
type Role string

const (
	Admin      Role = "admin"
	User       Role = "user"
	Superadmin Role = "superadmin"
)

type RequestData struct {
	Name string `json:"name"`
	Room string `json:"room"`
}

type UserSignupModel struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
}

type UserSinginModel struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

//	type UserDBModel struct {
//		ID        string    `json:"id"`
//		Email     string    `json:"email"`
//		Username  string    `json:"username"`
//		CreatedAt time.Time `json:"createdAt"`
//		Role      Role      `json:"role"`
//	}

type UserDBModel struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Password  string    `json:"password"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type SignupuserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Code     string `json:"code"`
}

type SigninuserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type FindUserByIdRequest struct {
	UserId string `json:"userId"`
}

type SigninuserResponse UserDBModel
type SignupuserResponse UserDBModel
type FindUserByIdResponse UserDBModel
type RemoveUserResponse UserDBModel
type FindAllUsersResponse []UserDBModel

type WebResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type UserRoomData struct {
	Name   string `json:"name"`
	UserId string `json:"userId"`
	Room   string `json:"room"`
	Role   Role   `json:"role"`
}

type JwtData struct {
	UserId   string `json:"userId"`
	Username string `json:"username"`
	Role     Role   `json:"role"`
}

var (
	ErrUserNotFound    = errors.New("user not found")
	ErrInvalidPassword = errors.New("invalid password")
	ErrEmptyTitle      = errors.New("title cannot be empty")
	ErrCourseNotFound  = errors.New("course not found")
)

type Status string

const (
	StatusAvailable Status = "AVAILABLE"
	StatusFull      Status = "FULL"
	StatusCancelled Status = "CANCELLED"
	StatusCompleted Status = "COMPLETED"
)

type CourseDBModel struct {
	ID           string              `json:"id"`
	Title        string              `json:"title"`
	Description  *string             `json:"description"`
	TeacherID    string              `json:"teacherId"`
	Subject      string              `json:"subject"`
	Participants int                 `json:"participants"`
	Status       Status              `json:"status"`
	MaxStudents  int                 `json:"maxStudents"`
	CreatedAt    time.Time           `json:"createdAt"`
	UpdatedAt    time.Time           `json:"updatedAt"`
	Teacher      UserDBModel         `json:"teacher"`
	Enrollments  []EnrollmentDBModel `json:"enrollments"`
}

type EnrollmentDBModel struct {
	ID        string        `json:"id"`
	CourseID  string        `json:"courseId"`
	StudentID string        `json:"studentId"`
	JoinedAt  time.Time     `json:"joinedAt"`
	UpdatedAt time.Time     `json:"updatedAt"`
	Grade     *float64      `json:"grade"`
	Status    UserClassENum `json:"status"`
}

// Request Models
type CourseCreateRequest struct {
	Title       string  `json:"title" validate:"required"`
	Description *string `json:"description"`
	Subject     string  `json:"subject" validate:"required"`
	MaxStudents int     `json:"maxStudents" validate:"required,min=1"`
}

type CourseUpdateRequest struct {
	ID          string  `json:"id" validate:"required"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Subject     *string `json:"subject"`
	MaxStudents *int    `json:"maxStudents" validate:"omitempty,min=1"`
	Status      *Status `json:"status"`
}

type CourseQueryParams struct {
	Subject   *string `query:"subject"`
	Status    *Status `query:"status"`
	TeacherID *string `query:"teacherId"`
	Page      int     `query:"page" validate:"min=1"`
	Limit     int     `query:"limit" validate:"min=1,max=100"`
}

// Response Models
type CourseResponse struct {
	ID           string       `json:"id"`
	Title        string       `json:"title"`
	Description  *string      `json:"description"`
	TeacherID    string       `json:"teacherId"`
	Teacher      UserResponse `json:"teacher"`
	Subject      string       `json:"subject"`
	Participants int          `json:"participants"`
	Status       Status       `json:"status"`
	MaxStudents  int          `json:"maxStudents"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

type UserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Role     Role   `json:"role"`
}

type CoursesPageResponse struct {
	Courses    []CourseDBModel `json:"courses"`
	TotalCount int64           `json:"totalCount"`
}

// Service Models
type CourseCreateModel struct {
	Title       string
	Description *string
	TeacherID   string
	Subject     string
	MaxStudents int
}

type CourseUpdateModel struct {
	ID          string
	Title       *string
	Description *string
	Subject     *string
	MaxStudents *int
	Status      *Status
}

// Service Interface
type CourseService interface {
	GetCourses(ctx context.Context, params CourseQueryParams) (*CoursesPageResponse, error)
	GetCourseByID(ctx context.Context, id string) (*CourseResponse, error)
	CreateCourse(ctx context.Context, req CourseCreateRequest, teacherID string) (*CourseResponse, error)
	UpdateCourse(ctx context.Context, req CourseUpdateRequest, teacherID string) (*CourseResponse, error)
	DeleteCourse(ctx context.Context, id string, teacherID string) error
}

// Error types
type CourseError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func NewCourseError(code, message string) *CourseError {
	return &CourseError{
		Code:    code,
		Message: message,
	}
}

type UserClassENum string

const (
	Enrolled  UserClassENum = "ENROLLED"
	Completed UserClassENum = "COMPLETED"
	Cancelled UserClassENum = "CANCELLED"
)

type EnrollUserToCourseRequest struct {
	UserId   string `json:"userId"`
	CourseId string `json:"courseId"`
}
