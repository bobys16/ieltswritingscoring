package internal

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey"`
	Email     string `gorm:"uniqueIndex"`
	PassHash  string
	Plan      string // "free" | "pro"
	Role      string `gorm:"default:'user'"` // "user" | "admin"
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

type BlogPost struct {
	ID          uint   `gorm:"primaryKey"`
	Title       string `gorm:"not null"`
	Slug        string `gorm:"uniqueIndex;not null"`
	Excerpt     string `gorm:"type:TEXT"`
	Content     string `gorm:"type:TEXT"`
	Category    string `gorm:"default:'general'"`
	Tags        string // JSON array of tags
	ReadTime    string `gorm:"default:'5 min'"`
	PublishedAt *time.Time
	IsPublished bool `gorm:"default:false"`
	AuthorID    uint `gorm:"index"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type AdminPrompt struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"not null"`
	Description string
	Prompt      string `gorm:"type:TEXT"`
	Type        string `gorm:"default:'scoring'"` // "scoring" | "feedback" | "system"
	IsActive    bool   `gorm:"default:true"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
