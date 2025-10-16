package internal

import (
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// CreateDefaultAdmin creates the default admin user if it doesn't exist
func CreateDefaultAdmin(db *gorm.DB) error {
	// Check if admin user already exists
	var existingUser User
	err := db.Where("email = ?", "sidigi").First(&existingUser).Error
	if err == nil {
		// Admin user already exists
		log.Println("Admin user 'sidigi' already exists")
		return nil
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("Bobys123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Create admin user
	adminUser := User{
		Email:    "sidigi",
		PassHash: string(hashedPassword),
		Plan:     "pro",
		Role:     "admin",
	}

	if err := db.Create(&adminUser).Error; err != nil {
		return err
	}

	log.Println("Default admin user 'sidigi' created successfully")
	return nil
}
