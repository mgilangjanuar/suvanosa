package model

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Form struct {
	ID          uuid.UUID      `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	FormID      string         `gorm:"notNull" json:"form_id"`
	Name        string         `gorm:"notNull" json:"name"`
	Label       string         `gorm:"notNull" json:"label"`
	Type        string         `json:"type"`
	DateType    string         `json:"date_type"`
	TextType    string         `json:"text_type"`
	Help        string         `json:"help"`
	Description string         `json:"description"`
	Order       int            `gorm:"default:0" json:"order"`
	Required    bool           `gorm:"default:false" json:"required"`
	Edited      bool           `gorm:"default:false" json:"edited"`
	Options     datatypes.JSON `gorm:"type:jsonb;default:NULL" json:"options"`
	DatabaseID  uuid.UUID      `json:"database_id"`
}
