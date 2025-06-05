package models

import "github.com/google/uuid"

type Artist struct {
	ID             uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name           string    `json:"name" gorm:"not null;uniqueIndex"`
	NormalizedName string    `json:"-" gorm:"not null;uniqueIndex;"`
}
