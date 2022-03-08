package model

import "github.com/google/uuid"

type User struct {
	ID                 uuid.UUID  `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Email              string     `gorm:"notNull" json:"email"`
	Password           string     `gorm:"notNull" json:"password"`
	Integration        string     `json:"integration"`
	Key                string     `json:"key"`
	VerificationCode   *uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"verification_code"`
	RefreshToken       *uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"refresh_token"`
	ResetPasswordToken *uuid.UUID `gorm:"type:uuid;default:null" json:"reset_password_token"`
	Databases          []Database `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
}
