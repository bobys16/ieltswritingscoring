package main

import (
	"log"
	"os"

	"github.com/boby/ielts-band-estimator/api/internal"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	_ = godotenv.Load()

	// Connect to database
	var db *gorm.DB
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Println("Warning: DB_DSN not set, using in-memory mode")
	} else {
		database, err := internal.OpenDB(dsn)
		if err != nil {
			log.Printf("Database connection failed: %v (continuing without DB)", err)
		} else {
			if err := internal.AutoMigrate(database); err != nil {
				log.Printf("Database migration failed: %v", err)
			} else {
				log.Println("Database connected and migrated successfully")
				db = database
			}
		}
	}

	// Initialize Gin router
	r := gin.Default()

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	// API routes
	api := r.Group("/api")
	{
		// Auth routes
		api.POST("/auth/signup", internal.Signup(db))
		api.POST("/auth/login", internal.Login(db))

		// Essay analysis
		api.POST("/essays/analyze", internal.AnalyzeEssay(db))

		// Reports
		api.GET("/reports/:publicId/pdf", internal.ReportPDF(db))
		api.GET("/reports/:publicId", internal.GetReport(db))
	}

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
