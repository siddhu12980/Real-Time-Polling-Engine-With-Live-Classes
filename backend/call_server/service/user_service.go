package service

import (
	"context"
	"errors"
	"fmt"
	"live/repository"
	"live/typess"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserService interface {
	SinginUser(ctx context.Context, user typess.SigninuserRequest) (*typess.SigninuserResponse, error)
	SignupUser(ctx context.Context, user typess.SignupuserRequest) (*typess.SignupuserResponse, error)
	FindUserById(ctx context.Context, userId typess.FindUserByIdRequest) (*typess.FindUserByIdResponse, error)
	FindAllUsers(ctx context.Context) (*typess.FindAllUsersResponse, error)
	RemoveUser(ctx context.Context, userId string) (*typess.UserDBModel, error)

	EnrollUserToCourse(ctx context.Context, userId, courseId string) error
	GetUserEnrolledCourses(ctx context.Context, userId string) ([]typess.CourseDBModel, error)
	GetAllUserInCourse(ctx context.Context, courseId string) ([]typess.UserDBModel, error)
}

type UserRepos struct {
	UserRepo repository.UserRepo
}

// EnrollUserToCourse implements UserService.
func (u *UserRepos) EnrollUserToCourse(ctx context.Context, userId string, courseId string) error {

	err := u.UserRepo.EnrollUserToCOourse(ctx, userId, courseId)
	if err != nil {
		return err
	}
	return nil

}

func (u *UserRepos) GetAllUserInCourse(ctx context.Context, courseId string) ([]typess.UserDBModel, error) {

	users, err := u.UserRepo.GetAllUserINCourse(ctx, courseId)
	if err != nil {
		return nil, err
	}
	return users, nil

}

// GetUserEnrolledCourses implements UserService.
func (u *UserRepos) GetUserEnrolledCourses(ctx context.Context, userId string) ([]typess.CourseDBModel, error) {

	courses, err := u.UserRepo.GetUserEnrolledCourses(ctx, userId)
	if err != nil {
		return nil, err
	}
	return courses, nil

}

func GinErrorResponse(statusCode int, message string) error {
	return &gin.Error{
		Err:  errors.New(message),
		Type: gin.ErrorTypePublic,
		Meta: gin.H{"statusCode": statusCode},
	}
}

func (u *UserRepos) SinginUser(ctx context.Context, user typess.SigninuserRequest) (*typess.SigninuserResponse, error) {

	data := typess.UserSinginModel(user)

	userData, err := u.UserRepo.SingnInUser(ctx, data)

	if err != nil {
		if errors.Is(err, typess.ErrUserNotFound) {
			return nil, GinErrorResponse(http.StatusNotFound, "User not found")
		}
		if errors.Is(err, typess.ErrInvalidPassword) {
			return nil, GinErrorResponse(http.StatusUnauthorized, "Invalid password")
		}
		return nil, GinErrorResponse(http.StatusInternalServerError, "An unexpected error occurred")
	}

	return (*typess.SigninuserResponse)(userData), nil

}

func (u *UserRepos) FindAllUsers(ctx context.Context) (*typess.FindAllUsersResponse, error) {

	users, err := u.UserRepo.FindAllUsers(ctx)
	if err != nil {
		return nil, err
	}
	return (*typess.FindAllUsersResponse)(&users), nil

}

func (u *UserRepos) FindUserById(ctx context.Context, userId typess.FindUserByIdRequest) (*typess.FindUserByIdResponse, error) {

	user, err := u.UserRepo.FindUserById(ctx, userId.UserId)
	if err != nil {
		return nil, err
	}
	return (*typess.FindUserByIdResponse)(user), nil

}

func (u *UserRepos) SignupUser(ctx context.Context, user typess.SignupuserRequest) (*typess.SignupuserResponse, error) {

	rol := typess.Role("user")

	fmt.Printf("user Service  : %v \n ", user)

	if user.Email == "" || user.Name == "" || user.Password == "" {
		return nil, errors.New("invalid data")
	}

	if user.Code == "1234" {
		rol = typess.Role("admin")
	}

	data := typess.UserSignupModel{
		Email:    user.Email,
		Name:     user.Name,
		Password: user.Password,
		Role:     rol,
	}

	fmt.Printf("\n signup Data  : %v \n", data)

	userData, err := u.UserRepo.SignupUser(ctx, data)

	if err != nil {
		return nil, err
	}

	return (*typess.SignupuserResponse)(userData), nil

}

func (u *UserRepos) RemoveUser(ctx context.Context, userId string) (*typess.UserDBModel, error) {

	find_user, err := u.UserRepo.FindUserById(ctx, userId)

	if err != nil {
		return nil, err
	}

	if find_user == nil {
		return nil, errors.New("user not found")
	}

	user, err := u.UserRepo.RemoveUser(ctx, userId)

	if err != nil {
		return nil, err
	}
	return (*typess.UserDBModel)(user), nil

}

func NewUserService(userRepo repository.UserRepo) UserService {
	return &UserRepos{
		UserRepo: userRepo,
	}
}
