package endpoints

import (
	"net/http"
	"surveynotion/internal/middleware"
	"surveynotion/internal/model"
	"surveynotion/pkg/service"

	"github.com/gin-gonic/gin"
)

func Database(r *gin.RouterGroup) {
	r.POST("/search", middleware.JWT, search)
	r.POST("", middleware.JWT, save)
	r.GET("", middleware.JWT, list)
	r.DELETE("/:id", middleware.JWT, delete)
	r.PATCH("/:id", middleware.JWT, update)
}

func search(c *gin.Context) {
	var data struct {
		Query *string `json:"query"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Query == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query is required"})
		return
	}

	user := c.Value("user").(model.User)
	result, err := service.Notion{Token: user.Key}.Search(*data.Query)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resultDatabases := []interface{}{}
	for i := range result.Results {
		if result.Results[i].Object == "database" {
			resultDatabases = append(resultDatabases, result.Results[i])
		}
	}

	c.JSON(http.StatusOK, gin.H{"results": resultDatabases})
}

func save(c *gin.Context) {
	var data struct {
		ID *string `json:"id"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.ID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	user := c.Value("user").(model.User)
	result, err := service.Notion{Token: user.Key}.GetDatabase(*data.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := &model.Database{
		DB_ID:  result.ID,
		Title:  result.Title[0].PlainText,
		UserID: user.ID,
	}

	if err := model.DB.Create(&db).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"database": db})
}

func list(c *gin.Context) {
	// limit := c.Query("limit")
	// offset := c.Query("offset")
	user := c.Value("user").(model.User)

	databases := []model.Database{}
	model.DB.Where("user_id = ?", user.ID).Find(&databases)

	c.JSON(http.StatusOK, gin.H{"databases": databases})
}

func delete(c *gin.Context) {
	id := c.Param("id")

	user := c.Value("user").(model.User)

	databases := []model.Database{}
	model.DB.Where("user_id = ? AND id = ?", user.ID, id).Find(&databases)

	if len(databases) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "database not found"})
		return
	}

	obj := databases[0]
	if err := model.DB.Delete(&databases[0]).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"database": obj})
}

func update(c *gin.Context) {
	id := c.Param("id")

	var data struct {
		Database *struct {
			Title       *string `json:"title"`
			Description *string `json:"description"`
		} `json:"database"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Database == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "database is required"})
		return
	}

	user := c.Value("user").(model.User)

	databases := []model.Database{}
	model.DB.Where("user_id = ? AND id = ?", user.ID, id).Find(&databases)

	if len(databases) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "database not found"})
		return
	}

	if data.Database.Title != nil {
		databases[0].Title = *data.Database.Title
	}

	if data.Database.Description != nil {
		databases[0].Description = *data.Database.Description
	}

	if err := model.DB.Save(&databases[0]).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"database": databases[0]})
}
