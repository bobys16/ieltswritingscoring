package internal

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type AnalyzeRequest struct {
	Text     string `json:"text" binding:"required"`
	TaskType string `json:"taskType"`
	Prompt   string `json:"prompt"`
}

type AnalyzeResponse struct {
	PublicID  string             `json:"publicId"`
	Overall   float32            `json:"overall"`
	Bands     map[string]float32 `json:"bands"`
	CEFR      string             `json:"cefr"`
	Feedback  string             `json:"feedback"`
	CreatedAt time.Time          `json:"createdAt"`
}

// AnalyzeEssay handles essay analysis requests with real AI scoring, caching, and user association
func AnalyzeEssay(db *gorm.DB, rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req AnalyzeRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		// Validate task type
		if req.TaskType != "task1" && req.TaskType != "task2" {
			req.TaskType = "task2" // default
		}

		// Validate word count
		if !MinWordsOK(req.Text) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "essay must be 150-320 words"})
			return
		}

		// Get user ID if authenticated (optional)
		var userID *uint
		if uid, exists := c.Get("userID"); exists {
			id := uid.(uint)
			userID = &id
		}

		// Check cache first
		cached, err := GetCachedEssayAnalysis(rdb, req.Text, req.TaskType)
		var out ScoreOut

		if err == nil && cached != nil {
			// Use cached result
			out = *cached
		} else {
			// Get OpenAI API key
			apiKey := os.Getenv("AI_KEY")
			if apiKey == "" {
				c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not configured"})
				return
			}

			// Create context with timeout
			ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
			defer cancel()

			// Score essay with AI
			scoreResult, err := ScoreEssay(ctx, apiKey, req.TaskType, req.Prompt, req.Text)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": "AI scoring failed"})
				return
			}
			out = scoreResult

			// Cache the result
			_ = CacheEssayAnalysis(rdb, req.Text, req.TaskType, out)
		}

		// Generate public ID
		publicID := uuid.NewString()[:8]

		// Create bands map for response
		bands := map[string]float32{
			"ta":  out.TA,
			"cc":  out.CC,
			"lr":  out.LR,
			"gra": out.GRA,
		}

		// Save to database
		createdAt := time.Now()
		essay := Essay{
			UserID:    userID, // Will be nil for anonymous users
			TaskType:  req.TaskType,
			Text:      req.Text,
			BandsJSON: ToJSON(out),
			Overall:   out.Overall,
			CEFR:      out.CEFR,
			Feedback:  out.Feedback,
			PublicID:  publicID,
			CreatedAt: createdAt,
		}

		if err := db.Create(&essay).Error; err != nil {
			// Log error but don't fail the request
			c.Header("X-Warning", "Essay saved to session only")
		}

		// Return response
		response := AnalyzeResponse{
			PublicID:  publicID,
			Overall:   out.Overall,
			Bands:     bands,
			CEFR:      out.CEFR,
			Feedback:  out.Feedback,
			CreatedAt: createdAt,
		}

		c.JSON(http.StatusOK, response)
	}
}

type FeedbackRequest struct {
	Rating    int    `json:"rating" binding:"required,min=1,max=5"`
	Comment   string `json:"comment"`
	Email     string `json:"userEmail"`
	UserAgent string `json:"userAgent"`
	URL       string `json:"url"`
	Timestamp string `json:"timestamp"`
}

// SubmitFeedback handles user feedback submissions
func SubmitFeedback(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req FeedbackRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		// Get user ID if authenticated (optional)
		var userID *uint
		if userIDInterface, exists := c.Get("userID"); exists {
			if uid, ok := userIDInterface.(uint); ok {
				userID = &uid
			}
		}

		// Create feedback record
		feedback := UserFeedback{
			UserID:    userID,
			Rating:    req.Rating,
			Comment:   req.Comment,
			Email:     req.Email,
			UserAgent: req.UserAgent,
			URL:       req.URL,
			CreatedAt: time.Now(),
		}

		// Try to save to database
		if db != nil {
			if err := db.Create(&feedback).Error; err != nil {
				// Log error but don't fail the request
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save feedback"})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Thank you for your feedback!",
		})
	}
}
