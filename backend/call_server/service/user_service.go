package service

import (
	"context"
	"errors"
	"live/repository"
	"live/typess"
)

type UserService interface {
	SinginUser(ctx context.Context, user typess.SigninuserRequest) (*typess.SigninuserResponse, error)
	SignupUser(ctx context.Context, user typess.SignupuserRequest) (*typess.SignupuserResponse, error)
	FindUserById(ctx context.Context, userId typess.FindUserByIdRequest) (*typess.FindUserByIdResponse, error)
	FindAllUsers(ctx context.Context) (*typess.FindAllUsersResponse, error)
	RemoveUser(ctx context.Context, userId string) (*typess.UserDBModel, error)
}

type UserRepos struct {
	UserRepo repository.UserRepo
}

func (u *UserRepos) SinginUser(ctx context.Context, user typess.SigninuserRequest) (*typess.SigninuserResponse, error) {

	data := typess.UserSinginModel(user)

	userData, err := u.UserRepo.SingnInUser(ctx, data)

	if err != nil {
		return nil, err
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

	data := typess.UserSignupModel{
		Email:    user.Email,
		Name:     user.Name,
		Password: user.Password,
		Role:     typess.Role(user.Role),
	}

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
