package internal

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey"`
	Email     string `gorm:"uniqueIndex"`
	PassHash  string
	Plan      string // "free" | "pro"
	CreatedAt time.Time
}

type Essay struct {
	ID        uint   `gorm:"primaryKey"`
	UserID    *uint  `gorm:"index"`
	TaskType  string // "task1"|"task2"
	Text      string `gorm:"type:TEXT"`
	BandsJSON string // raw JSON: {"ta":7,"cc":6.5,"lr":7,"gra":7.5,"overall":7}
	Overall   float32
	CEFR      string
	Feedback  string `gorm:"type:TEXT"`
	PublicID  string `gorm:"uniqueIndex"`
	CreatedAt time.Time
}

type UserFeedback struct {
	ID        uint   `gorm:"primaryKey"`
	UserID    *uint  `gorm:"index"`
	Rating    int    `gorm:"not null"` // 1-5 stars
	Comment   string `gorm:"type:TEXT"`
	Email     string // Optional email for follow-up
	UserAgent string // Browser info
	URL       string // Page where feedback was given
	CreatedAt time.Time
}
