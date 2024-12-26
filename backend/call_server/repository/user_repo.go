package repository

import (
	"context"
	"live/typess"
)

type UserRepo interface {
	SignupUser(ctx context.Context, user typess.UserSignupModel) (*typess.UserDBModel, error)
	SingnInUser(ctx context.Context, user typess.UserSinginModel) (*typess.UserDBModel, error)
	RemoveUser(ctx context.Context, userId string) (*typess.UserDBModel, error)
	FindAllUsers(ctx context.Context) ([]typess.UserDBModel, error)
	FindUserById(ctx context.Context, userId string) (*typess.UserDBModel, error)
}
