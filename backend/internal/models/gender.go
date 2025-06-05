package models

import "github.com/google/uuid"

type Genre struct {
	ID   uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name string    `json:"name" gorm:"not null;uniqueIndex"`
}
