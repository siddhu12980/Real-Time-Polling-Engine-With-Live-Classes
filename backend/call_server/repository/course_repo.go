package repository

import (
	"context"
	"live/prisma/db"
	"live/typess"
	"time"
)

type CourseDBModel struct {
	ID           string                     `json:"id"`
	Title        string                     `json:"title"`
	Description  *string                    `json:"description"`
	TeacherID    string                     `json:"teacherId"`
	Subject      string                     `json:"subject"`
	Participants int                        `json:"participants"`
	Status       typess.Status              `json:"status"`
	MaxStudents  int                        `json:"maxStudents"`
	CreatedAt    time.Time                  `json:"createdAt"`
	UpdatedAt    time.Time                  `json:"updatedAt"`
	Teacher      typess.UserDBModel         `json:"teacher"`
	Enrollments  []typess.EnrollmentDBModel `json:"enrollments"`
}

type CourseRepo interface {
	FindAllCourses(ctx context.Context) ([]typess.CourseDBModel, error)
	FindCourseById(ctx context.Context, courseId string) (*CourseDBModel, error)
	RemoveCourse(ctx context.Context, courseId string) (*CourseDBModel, error)
	CreateCourse(ctx context.Context, course typess.CourseCreateModel) (*CourseDBModel, error)
	UpdateCourse(ctx context.Context, course typess.CourseUpdateModel, id string) (*CourseDBModel, error)
}

type CourseRepoImp struct {
	Db *db.PrismaClient
}

// CreateCourse implements CourseRepo.
func (c *CourseRepoImp) CreateCourse(ctx context.Context, course typess.CourseCreateModel) (*CourseDBModel, error) {

	courseData, err := c.Db.Course.CreateOne(
		db.Course.Title.Set(course.Title),
		db.Course.Creator.Link(db.User.ID.Equals(course.TeacherID)),
		db.Course.Description.SetIfPresent(course.Description),
		db.Course.Subject.Set(course.Subject),
		db.Course.MaxStudents.Set(course.MaxStudents),
	).With(
		db.Course.Creator.Fetch(),
		db.Course.Enrollments.Fetch(),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	return &CourseDBModel{
		ID:           courseData.ID,
		Title:        courseData.Title,
		TeacherID:    courseData.TeacherID,
		Subject:      courseData.Subject,
		Participants: courseData.Participants,
		Teacher: typess.UserDBModel{
			ID:       courseData.Creator().ID,
			Email:    courseData.Creator().Email,
			Username: courseData.Creator().Username,
			Role:     typess.Role(courseData.Creator().Role),
		},
		Status:      typess.Status(courseData.Status),
		MaxStudents: courseData.MaxStudents,
		CreatedAt:   courseData.CreatedAt,
		UpdatedAt:   courseData.UpdatedAt,
	}, nil

}

func (c *CourseRepoImp) FindAllCourses(ctx context.Context) ([]typess.CourseDBModel, error) {

	courses, err := c.Db.Course.FindMany().With(
		db.Course.Creator.Fetch(),
		db.Course.Enrollments.Fetch(),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	var coursesResponse []typess.CourseDBModel

	for _, course := range courses {
		descrpt, _ := course.Description()
		coursesResponse = append(coursesResponse, typess.CourseDBModel{
			ID:           course.ID,
			Title:        course.Title,
			Description:  &descrpt,
			TeacherID:    course.TeacherID,
			Subject:      course.Subject,
			Participants: course.Participants,
			Status:       typess.Status(course.Status),
			MaxStudents:  course.MaxStudents,
			CreatedAt:    course.CreatedAt,
			UpdatedAt:    course.UpdatedAt,
			Teacher: typess.UserDBModel{
				ID:       course.TeacherID,
				Email:    course.Creator().Email,
				Username: course.Creator().Username,
				Role:     typess.Role(course.Creator().Role),
			},
			Enrollments: func() []typess.EnrollmentDBModel {
				var enrollments []typess.EnrollmentDBModel
				for _, enrollment := range course.Enrollments() {
					grade, _ := enrollment.Grade()
					enrollments = append(enrollments, typess.EnrollmentDBModel{
						ID:        enrollment.ID,
						StudentID: enrollment.StudentID,
						CourseID:  enrollment.CourseID,
						Status:    typess.UserClassENum(enrollment.Status),
						JoinedAt:  enrollment.JoinedAt,
						Grade:     &grade,
						UpdatedAt: enrollment.UpdatedAt,
					})
				}
				return enrollments
			}(),
		})
	}

	return coursesResponse, nil

}

func (c *CourseRepoImp) FindCourseById(ctx context.Context, courseId string) (*CourseDBModel, error) {

	course, err := c.Db.Course.FindUnique(
		db.Course.ID.Equals(courseId),
	).With(
		db.Course.Creator.Fetch(),
		db.Course.Enrollments.Fetch(),
	).Exec(ctx)

	if err != nil {
		return nil, typess.ErrCourseNotFound
	}

	descrpt, _ := course.Description()

	return &CourseDBModel{
		ID:           course.ID,
		Title:        course.Title,
		Description:  &descrpt,
		TeacherID:    course.TeacherID,
		Subject:      course.Subject,
		Participants: course.Participants,
		Status:       typess.Status(course.Status),
		MaxStudents:  course.MaxStudents,
		CreatedAt:    course.CreatedAt,
		UpdatedAt:    course.UpdatedAt,
		Teacher: typess.UserDBModel{
			ID:       course.TeacherID,
			Email:    course.Creator().Email,
			Username: course.Creator().Username,
			Role:     typess.Role(course.Creator().Role),
		},
		Enrollments: func() []typess.EnrollmentDBModel {
			var enrollments []typess.EnrollmentDBModel
			for _, enrollment := range course.Enrollments() {
				grade, _ := enrollment.Grade()
				enrollments = append(enrollments, typess.EnrollmentDBModel{
					ID:        enrollment.ID,
					StudentID: enrollment.StudentID,
					CourseID:  enrollment.CourseID,
					Status:    typess.UserClassENum(enrollment.Status),
					JoinedAt:  enrollment.JoinedAt,
					Grade:     &grade,
					UpdatedAt: enrollment.UpdatedAt,
				})
			}
			return enrollments
		}(),
	}, nil

}

func (c *CourseRepoImp) RemoveCourse(ctx context.Context, courseId string) (*CourseDBModel, error) {

	course, err := c.Db.Course.FindUnique(
		db.Course.ID.Equals(courseId),
	).With(
		db.Course.Creator.Fetch(),
		db.Course.Enrollments.Fetch(),
	).Delete().Exec(ctx)

	if err != nil {
		return nil, typess.ErrCourseNotFound
	}

	descrpt, _ := course.Description()

	courseData := &CourseDBModel{
		ID:           course.ID,
		Title:        course.Title,
		Description:  &descrpt,
		TeacherID:    course.TeacherID,
		Subject:      course.Subject,
		Participants: course.Participants,
		Status:       typess.Status(course.Status),
		MaxStudents:  course.MaxStudents,
		CreatedAt:    course.CreatedAt,
		UpdatedAt:    course.UpdatedAt,
		Teacher: typess.UserDBModel{
			ID:       course.TeacherID,
			Email:    course.Creator().Email,
			Username: course.Creator().Username,
			Role:     typess.Role(course.Creator().Role),
		},
		Enrollments: func() []typess.EnrollmentDBModel {
			var enrollments []typess.EnrollmentDBModel
			for _, enrollment := range course.Enrollments() {
				grade, _ := enrollment.Grade()
				enrollments = append(enrollments, typess.EnrollmentDBModel{
					ID:        enrollment.ID,
					StudentID: enrollment.StudentID,
					CourseID:  enrollment.CourseID,
					Status:    typess.UserClassENum(enrollment.Status),
					JoinedAt:  enrollment.JoinedAt,
					Grade:     &grade,
					UpdatedAt: enrollment.UpdatedAt,
				})
			}
			return enrollments
		}(),
	}

	return courseData, nil

}

func (c *CourseRepoImp) UpdateCourse(ctx context.Context, course typess.CourseUpdateModel, id string) (*CourseDBModel, error) {

	courseData, err := c.Db.Course.FindUnique(
		db.Course.ID.Equals(id),
	).With(
		db.Course.Creator.Fetch(),
		db.Course.Enrollments.Fetch(),
	).Update(
		db.Course.Title.SetIfPresent(course.Title),
		db.Course.Description.SetIfPresent(course.Description),
		db.Course.Subject.SetIfPresent(course.Subject),
		db.Course.MaxStudents.SetIfPresent(course.MaxStudents),
		db.Course.Status.SetIfPresent((*db.Status)(course.Status)),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	descrpt, _ := courseData.Description()

	return &CourseDBModel{
		ID:           courseData.ID,
		Title:        courseData.Title,
		Description:  &descrpt,
		TeacherID:    courseData.TeacherID,
		Subject:      courseData.Subject,
		Participants: courseData.Participants,
		Status:       typess.Status(courseData.Status),
		MaxStudents:  courseData.MaxStudents,
		CreatedAt:    courseData.CreatedAt,
		UpdatedAt:    courseData.UpdatedAt,
		Teacher: typess.UserDBModel{
			ID:       courseData.TeacherID,
			Email:    courseData.Creator().Email,
			Username: courseData.Creator().Username,
			Role:     typess.Role(courseData.Creator().Role),
		},
		Enrollments: func() []typess.EnrollmentDBModel {
			var enrollments []typess.EnrollmentDBModel
			for _, enrollment := range courseData.Enrollments() {
				grade, _ := enrollment.Grade()
				enrollments = append(enrollments, typess.EnrollmentDBModel{
					ID:        enrollment.ID,
					StudentID: enrollment.StudentID,
					CourseID:  enrollment.CourseID,
					Status:    typess.UserClassENum(enrollment.Status),
					JoinedAt:  enrollment.JoinedAt,
					Grade:     &grade,
					UpdatedAt: enrollment.UpdatedAt,
				})
			}
			return enrollments
		}(),
	}, nil

}

func NewCourseRepoImp(client *db.PrismaClient) CourseRepo {
	return &CourseRepoImp{
		Db: client,
	}
}
