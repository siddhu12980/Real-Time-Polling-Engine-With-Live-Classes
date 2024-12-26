package helper

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
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
