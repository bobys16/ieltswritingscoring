package internal

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func OpenDB(dsn string) (*gorm.DB, error) {
	return gorm.Open(mysql.Open(dsn), &gorm.Config{})
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&User{}, &Essay{})
}
