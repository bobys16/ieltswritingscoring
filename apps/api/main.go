package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sidigigroup/bandly/api/internal"
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

				// Create default admin user
				if err := internal.CreateDefaultAdmin(database); err != nil {
					log.Printf("Failed to create default admin user: %v", err)
				}

				db = database
			}
		}
	}

	// Initialize Redis
	rdb := internal.InitRedis()
	if rdb == nil {
		log.Println("Warning: Redis connection failed, rate limiting and caching disabled")
	} else {
		log.Println("Redis connected successfully")
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
		// Auth endpoints
		auth := api.Group("/auth")
		{
			auth.POST("/signup", internal.Signup(db))
			auth.POST("/login", internal.Login(db))
			auth.GET("/profile", internal.JWTMiddleware(), internal.GetProfile(db))
		} // Essay analysis (with optional auth and rate limiting)
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
			reports.GET("/:publicId/og-image", internal.OGImageHandler(db))
		}

		// Analytics (with optional auth)
		analytics := api.Group("/analytics")
		analytics.Use(internal.OptionalAuth(db))
		{
			analytics.POST("/event", internal.TrackEvent(db, rdb))
			analytics.GET("/stats", internal.GetAnalytics(db, rdb))
		}

		// Feedback (with optional auth)
		api.POST("/feedback", internal.OptionalAuth(db), internal.SubmitFeedback(db))

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

			// Admin routes (require admin authentication)
			admin := api.Group("/sidigi")
			admin.Use(internal.JWTAuth(db))         // Require authentication
			admin.Use(internal.AdminMiddleware(db)) // Require admin role
			{
				// Dashboard
				admin.GET("/dashboard", internal.GetAdminDashboard(db))

				// User management
				admin.GET("/users", internal.GetAdminUsers(db))
				admin.PUT("/users/:id", internal.UpdateUser(db))
				admin.DELETE("/users/:id", internal.DeleteUser(db))

				// Blog management
				admin.GET("/blog", internal.GetAdminBlogPosts(db))
				admin.POST("/blog", internal.CreateBlogPost(db))
				admin.PUT("/blog/:id", internal.UpdateBlogPost(db))
				admin.DELETE("/blog/:id", internal.DeleteBlogPost(db))

				// Prompt management
				admin.GET("/prompts", internal.GetAdminPrompts(db))
				admin.POST("/prompts", internal.CreatePrompt(db))
				admin.PUT("/prompts/:id", internal.UpdatePrompt(db))
				admin.DELETE("/prompts/:id", internal.DeletePrompt(db))
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
