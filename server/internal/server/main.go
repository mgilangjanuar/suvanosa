package server

import (
	"github.com/gin-gonic/gin"

	"suvanosa/internal/endpoints"
	"suvanosa/internal/middleware"
)

func Run(port string) {
	r := gin.Default()

	r.Use(middleware.CORS())

	endpoints.Aggregate(r)
	r.Run(port)
}
