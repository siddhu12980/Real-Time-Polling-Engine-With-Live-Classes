package helper

import (
	"fmt"
	"io"
	"live/typess"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

func GenerateID() string {
	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
	return fmt.Sprintf("%d", timestamp)
}

func GenerateName(role string) string {
	return fmt.Sprintf("%s_%d", role, time.Now().Unix())
}

func GetFormattedTime() string {
	currentTime := time.Now()
	return currentTime.Format("2006-01-02 15:04:05")
}

func GetPdf(c *gin.Context) {
	if c.Request.Method != http.MethodGet {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Only GET method is allowed"})
		return
	}

	doc := c.Param("doc")

	fmt.Printf("doc : %s", doc)

	const pdfURL = "https://sidd-bucket-digital.blr1.digitaloceanspaces.com/s2.pdf"

	resp, err := http.Get(pdfURL)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch PDF"})
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, gin.H{"error": "Failed to fetch PDF from the source"})
		return
	}

	c.Writer.Header().Set("Content-Type", "application/pdf")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	_, err = io.Copy(c.Writer, resp.Body)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stream PDF"})
		return
	}
}

var secretKey = []byte("secret-key")

func CreateToken(data typess.JwtData) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"username": data.Username,
			"userid":   data.UserId,
			"role":     data.Role,
			"exp":      time.Now().Add(time.Hour * 24).Unix(),
		})

	tokenString, err := token.SignedString(secretKey)

	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func VerifyToken(tokenString string) error {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil {
		return err
	}

	if !token.Valid {
		return fmt.Errorf("invalid token")
	}

	return nil
}

//decode token to get user data

func DecodeToken(tokenString string) (*typess.JwtData, error) {

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	fmt.Printf("Claimssss : %v", claims)

	role := claims["role"].(string)
	role_enum := typess.Role(role)

	return &typess.JwtData{
		UserId:   claims["userid"].(string),
		Role:     role_enum,
		Username: claims["username"].(string),
	}, nil
}
