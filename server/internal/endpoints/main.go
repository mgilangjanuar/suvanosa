package endpoints

import (
	"github.com/gin-gonic/gin"
)

func Aggregate(r *gin.Engine) {
	v1 := r.Group("/v1")
	{
		ping := v1.Group("/ping")
		{
			Ping(ping)
		}
		auth := v1.Group("/auth")
		{
			Auth(auth)
		}
		user := v1.Group("/users")
		{
			User(user)
		}
		database := v1.Group("/databases")
		{
			Database(database)
		}
	}
}
