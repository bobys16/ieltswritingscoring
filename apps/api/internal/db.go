package internal

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func OpenDB(dsn string) (*gorm.DB, error) {
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	return gorm.Open(postgres.Open(dsn), config)
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&User{}, &Essay{}, &AnalyticsEvent{}, &UserFeedback{}, &BlogPost{}, &AdminPrompt{})
}
