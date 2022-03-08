package model

import "github.com/google/uuid"

type Form struct {
	ID         uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Name       string    `gorm:"notNull" json:"name"`
	Label      string    `json:"label"`
	Help       string    `json:"help"`
	Order      int       `gorm:"default:0" json:"order"`
	Edited     bool      `gorm:"default:false" json:"edited"`
	DatabaseID uuid.UUID `json:"database_id"`
}
