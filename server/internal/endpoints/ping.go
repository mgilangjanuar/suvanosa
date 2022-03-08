package endpoints

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Ping(r *gin.RouterGroup) {
	r.GET("", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})
}
