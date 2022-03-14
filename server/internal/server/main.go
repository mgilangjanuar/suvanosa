package server

import (
	"github.com/gin-gonic/gin"

	"suvanosa/internal/endpoints"
)

func Run(port string) {
	r := gin.Default()
	endpoints.Aggregate(r)
	r.Run(port)
}
