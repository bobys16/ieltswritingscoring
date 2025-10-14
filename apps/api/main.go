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

	// Initialize Redis
	rdb := internal.InitRedis()
	if rdb == nil {
		log.Println("Warning: Redis connection failed, rate limiting and caching disabled")
	}

	// Initialize Gin router
	r := gin.Default()

	// Global middleware
	r.Use(internal.CORS())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		status := gin.H{"ok": true, "database": db != nil, "redis": rdb != nil}
		c.JSON(200, status)
	})

	// API routes
	api := r.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/signup", internal.Signup(db))
			auth.POST("/login", internal.Login(db))
		}

		// Essay analysis (with optional auth and rate limiting)
		essays := api.Group("/essays")
		essays.Use(internal.OptionalAuth(db)) // Optional authentication
		if rdb != nil {
			essays.Use(internal.RateLimit(rdb)) // Rate limiting if Redis available
		}
		{
			essays.POST("/analyze", internal.AnalyzeEssay(db, rdb))
		}

		// Public reports
		reports := api.Group("/reports")
		{
			reports.GET("/:publicId/pdf", internal.ReportPDF(db))
			reports.GET("/:publicId", internal.GetReport(db))
		}

		// Protected user routes (require authentication)
		if db != nil {
			user := api.Group("/user")
			user.Use(internal.JWTAuth(db)) // Require authentication
			{
				user.GET("/dashboard", internal.GetUserDashboard(db))
				user.GET("/history", internal.GetUserHistory(db))
				user.GET("/essays/:id", internal.GetEssayDetails(db))
				user.DELETE("/essays/:id", internal.DeleteEssay(db))
				user.PUT("/profile", internal.UpdateProfile(db))
			}
		}
	}

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("API server starting on port %s", port)
	log.Printf("Features: DB=%v, Redis=%v, Auth=%v", db != nil, rdb != nil, db != nil)
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
