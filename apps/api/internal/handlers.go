package internal

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

// AnalyzeEssay handles essay analysis requests with real AI scoring
func AnalyzeEssay(db *gorm.DB) gin.HandlerFunc {
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

		// Get OpenAI API key
		apiKey := os.Getenv("AI_KEY")
		if apiKey == "" {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not configured"})
			return
		}

		// Create context with timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
		defer cancel()

		// Score essay with AI (with fallback if OpenAI unavailable)
		scoreResult, err := ScoreEssay(ctx, apiKey, req.TaskType, req.Prompt, req.Text)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "AI scoring failed"})
			return
		}

		// Generate public ID
		publicID := uuid.NewString()[:8]

		// Create bands map for response
		bands := map[string]float32{
			"ta":  scoreResult.TA,
			"cc":  scoreResult.CC,
			"lr":  scoreResult.LR,
			"gra": scoreResult.GRA,
		}

		// Save to database if available
		createdAt := time.Now()
		if db != nil {
			essay := Essay{
				TaskType:  req.TaskType,
				Text:      req.Text,
				BandsJSON: ToJSON(scoreResult),
				Overall:   scoreResult.Overall,
				CEFR:      scoreResult.CEFR,
				Feedback:  scoreResult.Feedback,
				PublicID:  publicID,
				CreatedAt: createdAt,
			}

			// Try to save, but don't fail if DB is unavailable
			_ = db.Create(&essay)
		}

		response := AnalyzeResponse{
			PublicID:  publicID,
			Overall:   scoreResult.Overall,
			Bands:     bands,
			CEFR:      scoreResult.CEFR,
			Feedback:  scoreResult.Feedback,
			CreatedAt: createdAt,
		}

		c.JSON(http.StatusOK, response)
	}
}
