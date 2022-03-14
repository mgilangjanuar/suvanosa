package endpoints

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"

	"suvanosa/internal/middleware"
	"suvanosa/internal/model"
	"suvanosa/internal/util"
	"suvanosa/pkg/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Auth struct{}

func (a Auth) New(r *gin.RouterGroup) {
	r.POST("/register", a.register)
	r.POST("/resendVerification", a.resendVerification)
	r.POST("/verify", a.verify)
	r.POST("/login", a.login)
	r.POST("/refreshToken", a.refreshToken)
	r.POST("/forgotPassword", a.forgotPassword)
	r.POST("/resetPassword", a.resetPassword)
}

func (a Auth) register(c *gin.Context) {
	var data struct {
		Email    *string `json:"email"`
		Password *string `json:"password"`
		Key      *string `json:"key"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Email == nil || data.Password == nil || data.Key == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email, password and key are required"})
		return
	}

	var users []model.User
	model.DB.Where("email = ?", data.Email).Find(&users)

	if len(users) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user already exists"})
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

	password, err := bcrypt.GenerateFromPassword([]byte(*data.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := &model.User{
		Email:       *data.Email,
		Password:    string(password),
		Integration: bot.Name,
		Key:         *data.Key,
	}

	if err := model.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{})

	fmt.Println(user.VerificationCode)
	// TODO: send email with user.VerificationCode
}

func (a Auth) resendVerification(c *gin.Context) {
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

	var users []model.User
	model.DB.Where("email = ?", data.Email).Find(&users)

	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	if users[0].VerificationCode == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user already verified"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{})

	fmt.Println(users[0].VerificationCode)
	// TODO: send email with user.VerificationCode
}

func (a Auth) verify(c *gin.Context) {
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

	var users []model.User
	model.DB.Where("verification_code = ?", *data.Code).Find(&users)

	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not exists"})
		return
	}

	users[0].VerificationCode = nil
	if err := model.DB.Save(&users[0]).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{})
}

func (a Auth) login(c *gin.Context) {
	var data struct {
		Email    *string `json:"email"`
		Password *string `json:"password"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Email == nil || data.Password == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password are required"})
		return
	}

	var users []model.User
	model.DB.Where("email = ?", data.Email).Find(&users)

	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not exists"})
		return
	}

	if users[0].VerificationCode != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not verified"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(users[0].Password), []byte(*data.Password)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid password"})
		return
	}

	userData, tokens, err := a._generateUserData(users[0])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for k, v := range tokens {
		var duration int = int(util.JWT_EXPIRATION_TIME.Seconds())
		if k == "refresh_token" {
			duration = int(util.REFRESH_TOKEN_EXPIRATION_TIME.Seconds())
		}
		c.SetCookie(k, v.(string), duration, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
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

	userData, tokens, err := a._generateUserData(users[0])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for k, v := range tokens {
		var duration int = int(util.JWT_EXPIRATION_TIME.Seconds())
		if k == "refresh_token" {
			duration = int(util.REFRESH_TOKEN_EXPIRATION_TIME.Seconds())
		}
		c.SetCookie(k, v.(string), duration, "/", util.WEB_BASE_URL, strings.Contains(util.WEB_BASE_URL, "https"), true)
	}

	c.JSON(http.StatusOK, gin.H(userData))
}

func (a Auth) forgotPassword(c *gin.Context) {
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

	var users []model.User
	model.DB.Where("email = ?", data.Email).Find(&users)

	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not exists"})
		return
	}

	newUUID := uuid.New()
	users[0].ResetPasswordToken = &newUUID
	if err := model.DB.Save(&users[0]).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(users[0].ResetPasswordToken)
	// TODO: send email with user.VerificationCode

	c.JSON(http.StatusAccepted, gin.H{})
}

func (a Auth) resetPassword(c *gin.Context) {
	var data struct {
		Code     *string `json:"code"`
		Password *string `json:"password"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if data.Password == nil || data.Code == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password and code is required"})
		return
	}

	var users []model.User
	model.DB.Where("reset_password_token = ?", *data.Code).Find(&users)

	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not exists"})
		return
	}

	password, err := bcrypt.GenerateFromPassword([]byte(*data.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	users[0].Password = string(password)
	users[0].ResetPasswordToken = nil
	if err := model.DB.Save(&users[0]).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{})
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
