package model

import "github.com/google/uuid"

type Form struct {
	ID          uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	FormID      string    `gorm:"notNull" json:"form_id"`
	Name        string    `gorm:"notNull" json:"name"`
	Type        string    `json:"type"`
	Help        string    `json:"help"`
	Description string    `json:"description"`
	Order       int       `gorm:"default:0" json:"order"`
	Edited      bool      `gorm:"default:false" json:"edited"`
	Options     []struct {
		Color string `json:"color"`
		ID    string `json:"id"`
		Name  string `json:"name"`
	} `gorm:"type:jsonb" json:"options"`
	DatabaseID uuid.UUID `json:"database_id"`
}
