package endpoints

import (
	"encoding/json"
	"fmt"
	"net/http"
	"surveynotion/internal/middleware"
	"surveynotion/internal/model"
	"surveynotion/pkg/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Form struct{}

func (f Form) New(r *gin.RouterGroup) {
	r.GET("", middleware.JWT, f.list)
	r.GET("/public/:databaseID", f.public)
	r.POST("/public/:databaseID", f.submit)
	r.POST("", middleware.JWT, f.add)
	r.PATCH("/:id", middleware.JWT, f.update)
	r.DELETE("/:id", middleware.JWT, f.delete)
}

func (f Form) list(c *gin.Context) {
	databaseID := c.Query("database_id")

	user := c.Value("user").(model.User)

	databases := []model.Database{}

	if databaseID != "" {
		model.DB.Select("id").Where("user_id = ? AND id = ?", user.ID, databaseID).Find(&databases)
	} else {
		model.DB.Select("id").Where("user_id = ?", user.ID).Find(&databases)
	}

	ids := []uuid.UUID{}
	for i := range databases {
		ids = append(ids, databases[i].ID)
	}

	forms := []model.Form{}
	model.DB.Where("database_id IN ?", ids).Find(&forms)

	c.JSON(http.StatusOK, gin.H{"forms": forms})
}

func (f Form) public(c *gin.Context) {
	databaseID := c.Param("databaseID")

	forms := []model.Form{}
	model.DB.Where("database_id = ?", uuid.Must(uuid.Parse(databaseID))).Find(&forms)

	if len(forms) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "database not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"forms": forms})
}

func (f Form) submit(c *gin.Context) {
	databaseID := c.Param("databaseID")
	var data struct {
		Forms *[]map[string]string `json:"forms"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Forms == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "forms is required"})
		return
	}

	forms := []model.Form{}
	model.DB.Where("database_id = ?", uuid.Must(uuid.Parse(databaseID))).Find(&forms)

	if len(forms) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "database not found"})
		return
	}

	// TODO: build payload and send to notion

	c.JSON(http.StatusOK, gin.H{})
}

func (f Form) add(c *gin.Context) {
	var data struct {
		DatabaseID *string `json:"database_id"`
		Name       *string `json:"name"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Name == nil || data.DatabaseID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and database_id are required"})
		return
	}

	user := c.Value("user").(model.User)

	databases := []model.Database{}
	model.DB.Select([]string{"id", "db_id"}).Where("user_id = ? AND id = ?", user.ID, *data.DatabaseID).Find(&databases)

	if len(databases) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "database not found"})
		return
	}

	forms := []model.Form{}
	model.DB.Where("database_id = ? AND name = ?", databases[0].ID, *data.Name).Find(&forms)

	if len(forms) > 0 {
		c.JSON(http.StatusOK, gin.H{"form": forms[0]})
		return
	}

	result, err := service.Notion{Token: user.Key}.GetDatabase(databases[0].DB_ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for k, v := range result.Properties {
		fmt.Println(k, *data.Name)
		if k == *data.Name {
			form := BuildForm(k, v, databases[0].ID)
			model.DB.Create(form)

			c.JSON(http.StatusOK, gin.H{"form": form})
			return
		}
	}
}

func (f Form) update(c *gin.Context) {
	id := c.Param("id")

	var data struct {
		Form *struct {
			Label       *string         `json:"label"`
			Type        *string         `json:"type"`
			Help        *string         `json:"help"`
			Description *string         `json:"description"`
			Order       *int            `json:"order"`
			Options     *datatypes.JSON `json:"options"`
		} `json:"form"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Form == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "form is required"})
		return
	}

	user := c.Value("user").(model.User)

	databases := []model.Database{}
	model.DB.Select("id").Where("user_id = ?", user.ID).Find(&databases)

	ids := []uuid.UUID{}
	for i := range databases {
		ids = append(ids, databases[i].ID)
	}

	forms := []model.Form{}
	model.DB.Where("database_id IN ? AND id = ?", ids, id).Find(&forms)

	if len(forms) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "form not found"})
		return
	}

	if data.Form.Label != nil {
		forms[0].Label = *data.Form.Label
	}
	if data.Form.Type != nil {
		forms[0].Type = *data.Form.Type
	}
	if data.Form.Help != nil {
		forms[0].Help = *data.Form.Help
	}
	if data.Form.Description != nil {
		forms[0].Description = *data.Form.Description
	}
	if data.Form.Order != nil {
		forms[0].Order = *data.Form.Order
	}
	if data.Form.Options != nil {
		forms[0].Options = *data.Form.Options
	}
	forms[0].Edited = true

	if err := model.DB.Save(&forms[0]).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"form": forms[0]})
}

func (f Form) delete(c *gin.Context) {
	id := c.Param("id")

	user := c.Value("user").(model.User)

	databases := []model.Database{}
	model.DB.Select("id").Where("user_id = ?", user.ID).Find(&databases)

	ids := []uuid.UUID{}
	for i := range databases {
		ids = append(ids, databases[i].ID)
	}

	forms := []model.Form{}
	model.DB.Where("database_id IN ? AND id = ?", ids, id).Find(&forms)

	if len(forms) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "form not found"})
		return
	}

	obj := forms[0]
	if err := model.DB.Delete(&forms[0]).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"form": obj})
}

func BuildForm(k string, v interface{}, databaseID uuid.UUID) *model.Form {
	value := v.(map[string]interface{})
	var optionsJson datatypes.JSON
	if value["type"].(string) == "select" {
		json, _ := json.Marshal(value["select"].(map[string]interface{})["options"])
		optionsJson = datatypes.JSON([]byte(json))
	}

	return &model.Form{
		Name:       k,
		FormID:     value["id"].(string),
		Type:       value["type"].(string),
		Label:      value["name"].(string),
		Options:    optionsJson,
		DatabaseID: databaseID,
	}
}
