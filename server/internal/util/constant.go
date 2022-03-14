package util

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

var APPLICATION_NAME = "Suvanosa"
var WEB_BASE_URL = os.Getenv("WEB_BASE_URL")

var JWT_SECRET = os.Getenv("JWT_SECRET")
var JWT_SIGN_METHOD = jwt.SigningMethodHS256
var JWT_EXPIRATION_TIME = time.Duration(15) * time.Hour
var REFRESH_TOKEN_EXPIRATION_TIME = time.Duration(30*24) * time.Hour
