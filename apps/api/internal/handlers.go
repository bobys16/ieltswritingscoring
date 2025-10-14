package internal

import (
	"net/http"

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
	Overall   float64            `json:"overall"`
	Bands     map[string]float64 `json:"bands"`
	CEFR      string             `json:"cefr"`
	Feedback  string             `json:"feedback"`
	CreatedAt string             `json:"createdAt"`
}

// AnalyzeEssay handles essay analysis requests (stub implementation)
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

		// Basic word count validation
		words := len([]rune(req.Text)) / 5 // rough estimate
		if words < 150 || words > 320 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "essay must be 150-320 words"})
			return
		}

		// Generate stub response (will be replaced with real AI scoring)
		publicID := uuid.NewString()[:8]
		
		// Stub bands - will be replaced with real AI analysis
		stubBands := map[string]float64{
			"ta":  7.0,
			"cc":  6.5,
			"lr":  7.0,
			"gra": 7.5,
		}
		
		overall := 7.0
		cefr := "B2"
		feedback := "This is a stub response. Your essay demonstrates good task response with clear main ideas. Work on improving coherence with better linking devices and paragraph structure. Vocabulary is appropriate but could be more varied. Grammar shows good range with minor errors."

		// Save to database if available
		if db != nil {
			essay := Essay{
				TaskType: req.TaskType,
				Text:     req.Text,
				BandsJSON: ToJSON(stubBands),
				Overall:  float32(overall),
				CEFR:     cefr,
				Feedback: feedback,
				PublicID: publicID,
			}
			
			// Try to save, but don't fail if DB is unavailable
			_ = db.Create(&essay)
		}

		response := AnalyzeResponse{
			PublicID:  publicID,
			Overall:   overall,
			Bands:     stubBands,
			CEFR:      cefr,
			Feedback:  feedback,
			CreatedAt: "2025-10-14T00:00:00Z",
		}

		c.JSON(http.StatusOK, response)
	}
}
