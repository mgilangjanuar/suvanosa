package endpoints

import (
	"net/http"
	"suvanosa/internal/middleware"
	"suvanosa/internal/model"

	"github.com/gin-gonic/gin"
)

type User struct{}

func (u User) New(r *gin.RouterGroup) {
	me := r.Group("/me", middleware.JWT)
	{
		me.GET("", u.getMe)
	}
}

func (u User) getMe(c *gin.Context) {
	user := c.Value("user").(model.User)

	userData := map[string]interface{}{
		"user": map[string]interface{}{
			"id":          user.ID,
			"email":       user.Email,
			"integration": user.Integration,
		},
	}

	c.JSON(http.StatusOK, gin.H(userData))
}
