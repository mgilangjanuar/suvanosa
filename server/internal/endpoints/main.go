package endpoints

import (
	"github.com/gin-gonic/gin"
)

func Aggregate(r *gin.Engine) {
	v1 := r.Group("/v1")
	{
		ping := v1.Group("/ping")
		{
			Ping{}.New(ping)
		}
		auth := v1.Group("/auth")
		{
			Auth{}.New(auth)
		}
		user := v1.Group("/users")
		{
			User{}.New(user)
		}
		database := v1.Group("/databases")
		{
			Database{}.New(database)
		}
		form := v1.Group("/forms")
		{
			Form{}.New(form)
		}
	}
}
