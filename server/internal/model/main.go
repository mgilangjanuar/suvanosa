package model

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

func Run() (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(os.Getenv("DATABASE_URI")), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix: "suvanosa_",
		},
	})
	if err != nil {
		return nil, err
	}

	db.AutoMigrate(&User{})
	db.AutoMigrate(&Database{})
	db.AutoMigrate(&Form{})

	fmt.Println("Database migrated...")
	return db, nil
}

var DB *gorm.DB

func SetDB(db *gorm.DB) {
	DB = db
}
