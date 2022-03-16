package main

import (
	"os"
	"suvanosa/internal/model"
	"suvanosa/internal/server"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	// connecting to database
	db, err := model.Run()
	if err != nil {
		panic(err)
	}
	model.SetDB(db)

	// running server app
	port := os.Getenv("PORT")
	if len(port) == 0 {
		port = "4000"
	}
	server.Run(":" + port)
}
