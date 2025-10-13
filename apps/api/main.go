package main

import (
	"log"
	"os"

	"github.com/boby/ielts-band-estimator/api/internal"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	_ = godotenv.Load()

	// Connect to database
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Println("Warning: DB_DSN not set, using in-memory mode")
	} else {
		db, err := internal.OpenDB(dsn)
		if err != nil {
			log.Printf("Database connection failed: %v (continuing without DB)", err)
		} else {
			if err := internal.AutoMigrate(db); err != nil {
				log.Printf("Database migration failed: %v", err)
			} else {
				log.Println("Database connected and migrated successfully")
			}
		}
	}

	// Initialize Gin router
	r := gin.Default()

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("API server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
