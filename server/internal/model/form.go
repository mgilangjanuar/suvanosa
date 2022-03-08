package model

import "github.com/google/uuid"

type Form struct {
	ID         uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Name       string    `gorm:"notNull" json:"name"`
	Label      string    `json:"label"`
	Help       string    `json:"help"`
	DatabaseID uuid.UUID `json:"database_id"`
	Database   Database
}
