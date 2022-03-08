package model

import "github.com/google/uuid"

type Database struct {
	ID          uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	DB_ID       string    `gorm:"notNull" json:"db_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	UserID      uuid.UUID `json:"user_id"`
	Forms       []Form    `gorm:"foreignKey:DatabaseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
}
