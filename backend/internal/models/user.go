package models

import "github.com/google/uuid"

type User struct {
	ID             uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email          string    `json:"email" gorm:"uniqueIndex;not null"`
	Name           string    `json:"name"`
	ProfilePicture string    `json:"profile_picture"`
	IsActive       bool      `json:"is_active" gorm:"default:true"`
}
