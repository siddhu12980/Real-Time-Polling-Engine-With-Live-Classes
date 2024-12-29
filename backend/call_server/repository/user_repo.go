package repository

import (
	"context"
	"fmt"
	"live/prisma/db"
	"live/typess"
)

type UserRepo interface {
	SignupUser(ctx context.Context, user typess.UserSignupModel) (*typess.UserDBModel, error)
	SingnInUser(ctx context.Context, user typess.UserSinginModel) (*typess.UserDBModel, error)
	RemoveUser(ctx context.Context, userId string) (*typess.UserDBModel, error)
	FindAllUsers(ctx context.Context) ([]typess.UserDBModel, error)
	FindUserById(ctx context.Context, userId string) (*typess.UserDBModel, error)
	EnrollUserToCOourse(ctx context.Context, userId, courseId string) error
	GetUserEnrolledCourses(ctx context.Context, userId string) ([]typess.CourseDBModel, error)
	GetAllUserINCourse(ctx context.Context, courseId string) ([]typess.UserDBModel, error)
}

type UserRepoImp struct {
	Db *db.PrismaClient
}

func (u *UserRepoImp) GetAllUserINCourse(ctx context.Context, courseId string) ([]typess.UserDBModel, error) {

	data, err := u.Db.User.FindMany(
		db.User.Enrollments.Some(
			db.Enrollment.CourseID.Equals(courseId),
		),
	).Exec(ctx)

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

func (u *UserRepoImp) GetUserEnrolledCourses(ctx context.Context, userId string) ([]typess.CourseDBModel, error) {

	data, err := u.Db.Course.FindMany(
		db.Course.Enrollments.Some(
			db.Enrollment.StudentID.Equals(userId),
		),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	var courses []typess.CourseDBModel

	for _, course := range data {

		descrpt, _ := course.Description()

		courses = append(courses, typess.CourseDBModel{
			ID:          course.ID,
			Title:       course.Title,
			Description: &descrpt,
			Subject:     course.Subject,
			MaxStudents: course.MaxStudents,
			CreatedAt:   course.CreatedAt,
			UpdatedAt:   course.UpdatedAt,
			Status:      typess.Status(course.Status),
			Teacher: typess.UserDBModel{
				ID:       course.Creator().ID,
				Email:    course.Creator().Email,
				Username: course.Creator().Username,
				Role:     typess.Role(course.Creator().Role),
			},
		})

	}

	return courses, nil

}

func (u *UserRepoImp) SingnInUser(ctx context.Context, user typess.UserSinginModel) (*typess.UserDBModel, error) {

	fmt.Print("User inside Repo: ", user)

	data, err := u.Db.User.FindUnique(
		db.User.Email.Equals(user.Email),
	).Exec(ctx)

	if err != nil {
		return nil, typess.ErrUserNotFound
	}

	if data.Password != user.Password {
		return nil, typess.ErrInvalidPassword
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

	if user.Role == "" {
		user.Role = typess.User
	}

	role := db.Role(user.Role)

	fmt.Print(" \n Role:  ", role)
	fmt.Print(" \n User repo:  \n ", user)

	// check if user already exist
	_, err := u.Db.User.FindUnique(
		db.User.Email.Equals(user.Email),
	).Exec(ctx)

	if err == nil {
		return nil, fmt.Errorf("user already exist")
	}

	data, err := u.Db.User.CreateOne(
		db.User.Email.Set(user.Email),
		db.User.Username.Set(user.Name),
		db.User.Password.Set(user.Password),
		db.User.Role.Set(role),
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

func (u *UserRepoImp) EnrollUserToCOourse(ctx context.Context, userId, courseId string) error {

	_, err := u.Db.Course.FindUnique(
		db.Course.ID.Equals(courseId),
	).Exec(ctx)

	if err != nil {
		return err
	}

	//check if user  already enrolled

	_, err = u.Db.User.FindUnique(
		db.User.ID.Equals(userId),
	).With(
		db.User.Enrollments.Fetch(
			db.Enrollment.CourseID.Equals(courseId),
		),
	).Exec(ctx)

	if err != nil {
		return err
	}

	// enroll user to course

	d, err := u.Db.Enrollment.CreateOne(
		db.Enrollment.Course.Link(
			db.Course.ID.Equals(courseId),
		),
		db.Enrollment.Student.Link(
			db.User.ID.Equals(userId),
		),
	).Exec(ctx)

	if err != nil {
		return err
	}

	fmt.Print("Enrolled user: ", d)

	return nil

}

func NewUserRepoImp(db *db.PrismaClient) UserRepo {
	return &UserRepoImp{
		Db: db,
	}
}
