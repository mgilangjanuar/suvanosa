package endpoints

import (
	"fmt"
	"net/http"
	"strings"
	"surveynotion/internal/middleware"
	"surveynotion/internal/model"
	"surveynotion/internal/util"
	"surveynotion/pkg/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func User(r *gin.RouterGroup) {
	me := r.Group("/me", middleware.JWT)
	{
		me.GET("", getMe)
		me.PATCH("/changePassword", changePassword)
		me.PATCH("/changeEmail", changeEmail)
		me.PATCH("/changeKey", changeKey)
	}
}

func getMe(c *gin.Context) {
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

func changePassword(c *gin.Context) {
	var data struct {
		OldPassword *string `json:"old_password"`
		NewPassword *string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.OldPassword == nil || data.NewPassword == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "old_password and new_password are required"})
		return
	}

	user := c.Value("user").(model.User)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(*data.OldPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "old password is incorrect"})
		return
	}

	password, err := bcrypt.GenerateFromPassword([]byte(*data.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Password = string(password)
	if err := model.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("access_token", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.SetCookie("expires_at", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.SetCookie("refresh_token", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.JSON(http.StatusOK, gin.H{})
}

func changeEmail(c *gin.Context) {
	var data struct {
		Email *string `json:"email"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Email == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email is required"})
		return
	}

	user := c.Value("user").(model.User)
	if user.Email == *data.Email {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email is the same"})
		return
	}

	code := uuid.New()
	user.VerificationCode = &code
	user.Email = *data.Email
	if err := model.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(code)

	c.SetCookie("access_token", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.SetCookie("expires_at", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.SetCookie("refresh_token", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.JSON(http.StatusOK, gin.H{})
}

func changeKey(c *gin.Context) {
	var data struct {
		Key *string `json:"key"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Key == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	bot, err := service.Notion{Token: *data.Key}.GetMe()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(bot.Name) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is invalid"})
		return
	}

	user := c.Value("user").(model.User)

	user.Integration = bot.Name
	user.Key = *data.Key
	if err := model.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{})
}
