package endpoints

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Ping struct{}

func (p Ping) New(r *gin.RouterGroup) {
	r.GET("", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})
}
