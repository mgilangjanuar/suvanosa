package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"surveynotion/internal/surveynotion/model"
	"surveynotion/internal/surveynotion/util"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
)

type Claims struct {
	jwt.StandardClaims
	ID    uuid.UUID `json:"id"`
	Email string    `json:"email"`
}

func JWT(c *gin.Context) {
	var tokenString *string

	authorization := c.Request.Header.Get("Authorization")
	if len(authorization) != 0 {
		if !strings.Contains(authorization, "Bearer") {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		realToken := strings.Replace(authorization, "Bearer ", "", -1)
		tokenString = &realToken
	} else {
		authorization, err := c.Request.Cookie("access_token")
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		tokenString = &authorization.Value
	}

	if tokenString == nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	token, err := jwt.Parse(*tokenString, func(token *jwt.Token) (interface{}, error) {
		if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", method)
		} else if method != util.JWT_SIGN_METHOD {
			return nil, fmt.Errorf("unexpected signing method: %v", method)
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok || !token.Valid {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	var users []model.User
	model.DB.Where("id = ?", claims["id"]).Find(&users)

	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not exists"})
		return
	}

	c.Set("user", users[0])
}
