package typess

import "time"

// create role enum
type Role string

const (
	Admin Role = "admin"
	User  Role = "user"
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

type UserDBModel struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"createdAt"`
	Role      Role      `json:"role"`
}

type SignupuserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
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
