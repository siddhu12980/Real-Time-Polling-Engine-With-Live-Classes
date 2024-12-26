package repository

import (
	"context"
	"fmt"
	"live/prisma/db"
	"live/typess"
)

type UserRepoImp struct {
	Db *db.PrismaClient
}

func (u *UserRepoImp) SingnInUser(ctx context.Context, user typess.UserSinginModel) (*typess.UserDBModel, error) {

	data, err := u.Db.User.FindUnique(
		db.User.Email.Equals(user.Email),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	return &typess.UserDBModel{
		ID:        data.ID,
		Email:     data.Email,
		Username:  data.Username,
		CreatedAt: data.CreatedAt,
		Role:      typess.Role(data.Role),
	}, nil

}

func (u *UserRepoImp) FindUserById(ctx context.Context, userId string) (*typess.UserDBModel, error) {
	data, err := u.Db.User.FindUnique(db.User.ID.Equals(userId)).Exec(ctx)
	if err != nil {
		return nil, err
	}

	user := &typess.UserDBModel{
		ID:        data.ID,
		Email:     data.Email,
		Username:  data.Username,
		CreatedAt: data.CreatedAt,
		Role:      typess.Role(data.Role),
	}

	return user, nil

}

func (u *UserRepoImp) FindAllUsers(ctx context.Context) ([]typess.UserDBModel, error) {
	data, err := u.Db.User.FindMany().Exec(ctx)
	if err != nil {
		return nil, err
	}
	var users []typess.UserDBModel

	for _, user := range data {

		users = append(users, typess.UserDBModel{
			ID:        user.ID,
			Email:     user.Email,
			Username:  user.Username,
			CreatedAt: user.CreatedAt,
			Role:      typess.Role(user.Role),
		})

	}

	return users, nil

}

func (u *UserRepoImp) SignupUser(ctx context.Context, user typess.UserSignupModel) (*typess.UserDBModel, error) {

	rple := db.Role(user.Role)

	data, err := u.Db.User.CreateOne(
		db.User.Email.Set(user.Email),
		db.User.Password.Set(user.Password),
		db.User.Username.Equals(user.Name),
		db.User.Role.Set((rple)),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	fmt.Print("User created: ", data)

	return &typess.UserDBModel{
		ID:        data.ID,
		Email:     data.Email,
		Username:  data.Username,
		CreatedAt: data.CreatedAt,
		Role:      typess.Role(data.Role),
	}, nil

}

func (u *UserRepoImp) RemoveUser(ctx context.Context, userId string) (*typess.UserDBModel, error) {

	result, err := u.Db.User.FindUnique(db.User.ID.Equals(userId)).Delete().Exec(ctx)

	if err != nil {
		return nil, err
	}

	fmt.Print("Row affected: ", result)

	return &typess.UserDBModel{
		ID:        result.ID,
		Email:     result.Email,
		Username:  result.Username,
		CreatedAt: result.CreatedAt,
		Role:      typess.Role(result.Role),
	}, nil

}

func NewUserRepoImp(db *db.PrismaClient) UserRepo {
	return &UserRepoImp{
		Db: db,
	}
}
