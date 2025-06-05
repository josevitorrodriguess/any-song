package models

import "time"

type User struct {
	FirebaseUID       string    `json:"firebase_uid" gorm:"primaryKey;"`
	Email             string    `json:"email" gorm:"uniqueIndex;not null"`
	Name              string    `json:"name"`
	ProfilePicture    string    `json:"profile_picture"`
	IsActive          bool      `json:"is_active" gorm:"default:true"`
	CreatedAt         time.Time `json:"created_at" gorm:"autoCreateTime;not null"`
	UpdatedAt         time.Time `json:"updated_at" gorm:"autoUpdateTime;not null"`
	SongsProcessed    int       `json:"songs_processed" gorm:"default:0"`
	AvarageScore      float64   `json:"avarage_score" gorm:"default:0.0"`
	TotalSessions     int       `json:"total_sessions" gorm:"default:0"`
	AchievementsCount int       `json:"achievements_count" gorm:"default:0"`
}
