package util

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

var APPLICATION_NAME = "Suvanosa"
var BASE_URL = os.Getenv("BASE_URL")

var JWT_SECRET = os.Getenv("JWT_SECRET")
var JWT_SIGN_METHOD = jwt.SigningMethodHS256
var JWT_EXPIRATION_TIME = time.Duration(15) * time.Hour
var REFRESH_TOKEN_EXPIRATION_TIME = time.Duration(30*24) * time.Hour

var CORS = []string{
	"http://localhost:3000",
	"https://suvanosa.appledore.dev",
}
