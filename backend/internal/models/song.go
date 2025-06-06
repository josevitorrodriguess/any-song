package models

import (
	"time"

	"github.com/google/uuid"
)

type Song struct {
	ID              uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Title           string    `json:"title" gorm:"not null"`
	NormalizedTitle string    `json:"-" gorm:"not null;uniqueIndex"`
	ArtistID        uuid.UUID `json:"-"`
	Artist          Artist    `json:"artist,omitempty" gorm:"foreignKey:ArtistID"`
	GenreID         uuid.UUID `json:"-"`
	Genre           Genre     `json:"genre,omitempty" gorm:"foreignKey:GenreID"`
	DurationSeconds int       `json:"duration_seconds" gorm:"not null"`
	AudioURL        string    `json:"audio_url" gorm:"not null"`
	Lyrics          string    `json:"lyrics" gorm:"type:text"`
	CreatedAt       time.Time `json:"created_at" gorm:"autoCreateTime"`
	PlayCount       int       `json:"play_count" gorm:"default:0"`
}
