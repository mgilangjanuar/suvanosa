package endpoints

import (
	"net/http"
	"surveynotion/internal/middleware"
	"surveynotion/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Form struct{}

func (f Form) New(r *gin.RouterGroup) {
	r.GET("", middleware.JWT, f.list)
}

func (f Form) list(c *gin.Context) {
	databaseID := c.Query("database_id")

	ids := []uuid.UUID{}

	if databaseID != "" {
		ids = append(ids, uuid.Must(uuid.Parse(databaseID)))
	} else {
		user := c.Value("user").(model.User)

		databases := []model.Database{}
		model.DB.Select("id").Where("user_id = ?", user.ID).Find(&databases)

		for i := range databases {
			ids = append(ids, databases[i].ID)
		}
	}

	forms := []model.Form{}
	model.DB.Where("database_id IN ?", ids).Find(&forms)

	c.JSON(http.StatusOK, gin.H{"forms": forms})
}
