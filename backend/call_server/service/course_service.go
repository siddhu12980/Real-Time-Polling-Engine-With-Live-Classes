package service

import (
	"context"
	"fmt"
	"live/repository"
	"live/typess"
)

type CourseService interface {
	GetCourses(ctx context.Context) (*typess.CoursesPageResponse, error)
	GetCourseByID(ctx context.Context, id string) (*typess.CourseResponse, error)
	CreateCourse(ctx context.Context, req typess.CourseCreateRequest, teacherID string) (*typess.CourseResponse, error)
	UpdateCourse(ctx context.Context, req typess.CourseUpdateRequest, id string) (*typess.CourseResponse, error)
	DeleteCourse(ctx context.Context, id string, teacherID string) error
}

type CourseRepos struct {
	CourseRepo repository.CourseRepo
}

// CreateCourse implements CourseService.
func (c *CourseRepos) CreateCourse(ctx context.Context, req typess.CourseCreateRequest, teacherID string) (*typess.CourseResponse, error) {

	courseData := typess.CourseCreateModel{
		Title:       req.Title,
		Description: req.Description,
		Subject:     req.Subject,
		MaxStudents: req.MaxStudents,
	}

	courseData.TeacherID = teacherID

	course, err := c.CourseRepo.CreateCourse(ctx, courseData)

	if err != nil {
		return nil, err
	}

	return &typess.CourseResponse{
		ID:           course.ID,
		Title:        course.Title,
		Description:  course.Description,
		TeacherID:    course.TeacherID,
		Subject:      course.Subject,
		Participants: course.Participants,
		Status:       typess.Status(course.Status),
		MaxStudents:  course.MaxStudents,
		CreatedAt:    course.CreatedAt,
		UpdatedAt:    course.UpdatedAt,
		Teacher: typess.UserResponse{
			ID:       course.Teacher.ID,
			Email:    course.Teacher.Email,
			Username: course.Teacher.Username,
			Role:     typess.Role(course.Teacher.Role),
		},
	}, nil

}

func (c *CourseRepos) DeleteCourse(ctx context.Context, id string, teacherID string) error {

	_, err := c.CourseRepo.RemoveCourse(ctx, id)

	fmt.Printf("teacher Id : %v \n", teacherID)

	if err != nil {
		return err
	}

	return nil

}

func (c *CourseRepos) GetCourseByID(ctx context.Context, id string) (*typess.CourseResponse, error) {

	course, err := c.CourseRepo.FindCourseById(ctx, id)

	if err != nil {
		return nil, err
	}

	return &typess.CourseResponse{
		ID:           course.ID,
		Title:        course.Title,
		Description:  course.Description,
		TeacherID:    course.TeacherID,
		Subject:      course.Subject,
		Participants: course.Participants,
		Status:       typess.Status(course.Status),
		MaxStudents:  course.MaxStudents,
		CreatedAt:    course.CreatedAt,
		UpdatedAt:    course.UpdatedAt,
		Teacher: typess.UserResponse{
			ID:       course.Teacher.ID,
			Email:    course.Teacher.Email,
			Username: course.Teacher.Username,
			Role:     typess.Role(course.Teacher.Role),
		},
	}, nil

}

func (c *CourseRepos) GetCourses(ctx context.Context) (*typess.CoursesPageResponse, error) {

	courses, err := c.CourseRepo.FindAllCourses(ctx)

	if err != nil {
		return nil, err
	}

	return &typess.CoursesPageResponse{
		Courses:    courses,
		TotalCount: int64(len(courses)),
	}, nil
}

func (c *CourseRepos) UpdateCourse(ctx context.Context, req typess.CourseUpdateRequest, id string) (*typess.CourseResponse, error) {

	courseData := typess.CourseUpdateModel(req)

	course, err := c.CourseRepo.UpdateCourse(ctx, courseData, id)

	if err != nil {
		return nil, err
	}

	return &typess.CourseResponse{
		ID:           course.ID,
		Title:        course.Title,
		Description:  course.Description,
		TeacherID:    course.TeacherID,
		Subject:      course.Subject,
		Participants: course.Participants,
		Status:       typess.Status(course.Status),
		MaxStudents:  course.MaxStudents,
		Teacher: typess.UserResponse{
			ID:       course.Teacher.ID,
			Email:    course.Teacher.Email,
			Username: course.Teacher.Username,
			Role:     typess.Role(course.Teacher.Role),
		},
		CreatedAt: course.CreatedAt,
		UpdatedAt: course.UpdatedAt,
	}, nil

}

func NewCourseService(courseRepo repository.CourseRepo) CourseService {
	return &CourseRepos{
		CourseRepo: courseRepo,
	}
}
