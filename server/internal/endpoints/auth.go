package endpoints

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"suvanosa/internal/middleware"
	"suvanosa/internal/model"
	"suvanosa/internal/util"
	"suvanosa/pkg/service"

	"github.com/gin-gonic/gin"
)

type Auth struct{}

func (a Auth) New(r *gin.RouterGroup) {
	r.GET("/url", a.url)
	r.POST("/token", a.token)
	r.POST("/refreshToken", a.refreshToken)
	r.POST("/logout", a.logout)
}

func (a Auth) url(c *gin.Context) {
	clientID := os.Getenv("NOTION_CLIENT_ID")
	redirect := url.QueryEscape(os.Getenv("NOTION_REDIRECT_URL"))
	url := fmt.Sprintf("https://api.notion.com/v1/oauth/authorize?owner=user&client_id=%s&redirect_uri=%s&response_type=code", clientID, redirect)
	c.JSON(http.StatusOK, gin.H{"url": url})
}

func (a Auth) token(c *gin.Context) {
	var data struct {
		Code *string `json:"code"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Code == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
		return
	}

	result, err := service.Notion{BasicAuth: &struct {
		Username string
		Password string
	}{
		Username: os.Getenv("NOTION_CLIENT_ID"),
		Password: os.Getenv("NOTION_CLIENT_SECRET"),
	}}.RequestToken(*data.Code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var users []model.User
	model.DB.Where("email = ?", result.Owner.User.Person.Email).Find(&users)

	var user model.User
	if len(users) > 0 {
		key, err := util.Encrypt(result.AccessToken)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		users[0].Key = *key
		users[0].Integration = result.WorkspaceName
		if err := model.DB.Save(&users[0]).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		user = users[0]
	} else {
		passGenerated := result.AccessToken + ":" + result.Owner.User.Person.Email
		password, err := bcrypt.GenerateFromPassword([]byte(passGenerated), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		key, err := util.Encrypt(result.AccessToken)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user = model.User{
			Email:       result.Owner.User.Person.Email,
			Password:    string(password),
			Integration: result.WorkspaceName,
			Key:         *key,
		}

		if err := model.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	userData, err := a._getUserDataAndSetCookies(user, c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H(userData))
}

func (a Auth) refreshToken(c *gin.Context) {
	var data struct {
		Token *string `json:"refresh_token"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		token, err := c.Request.Cookie("refresh_token")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if token.Value == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "refresh token is required"})
			return
		}
		data.Token = &token.Value
	}

	if data.Token == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "refresh token is required"})
		return
	}

	var users []model.User
	model.DB.Where("refresh_token = ?", data.Token).Find(&users)

	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not exists"})
		return
	}

	token := uuid.New()
	users[0].RefreshToken = &token
	if err := model.DB.Save(&users[0]).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	userData, err := a._getUserDataAndSetCookies(users[0], c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H(userData))
}

func (a Auth) logout(c *gin.Context) {
	c.SetCookie("access_token", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.SetCookie("expires_at", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.SetCookie("refresh_token", "", 0, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	c.JSON(http.StatusOK, gin.H{})
}

func (a Auth) _generateUserData(user model.User) (map[string]interface{}, map[string]interface{}, error) {
	expires := time.Now().Add(util.JWT_EXPIRATION_TIME).Unix()

	token := jwt.NewWithClaims(util.JWT_SIGN_METHOD, &middleware.Claims{
		StandardClaims: jwt.StandardClaims{
			Issuer:    util.APPLICATION_NAME,
			ExpiresAt: expires,
		},
		ID:    user.ID,
		Email: user.Email,
	})

	signedToken, err := token.SignedString([]byte(util.JWT_SECRET))
	if err != nil {
		return nil, nil, err
	}

	tokens := map[string]interface{}{
		"access_token":  signedToken,
		"expires_at":    strconv.Itoa(int(expires)),
		"refresh_token": user.RefreshToken.String(),
	}

	userData := map[string]interface{}{
		"user": map[string]interface{}{
			"id":          user.ID,
			"email":       user.Email,
			"integration": user.Integration,
		},
	}

	for k, v := range tokens {
		userData[k] = v
	}
	return userData, tokens, nil
}

func (a Auth) _getUserDataAndSetCookies(user model.User, c *gin.Context) (map[string]interface{}, error) {
	userData, tokens, err := a._generateUserData(user)
	if err != nil {
		return nil, err
	}

	for k, v := range tokens {
		var duration int = int(util.JWT_EXPIRATION_TIME.Seconds())
		if k == "refresh_token" {
			duration = int(util.REFRESH_TOKEN_EXPIRATION_TIME.Seconds())
		}
		c.SetCookie(k, v.(string), duration, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	}
	return userData, nil
}
