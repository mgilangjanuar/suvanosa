package server

import (
	"github.com/gin-gonic/gin"

	"surveynotion/internal/surveynotion/endpoints"
)

func Run(port string) {
	r := gin.Default()
	endpoints.Aggregate(r)
	r.Run(port)
}
