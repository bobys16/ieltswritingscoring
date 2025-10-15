package internal

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Get user's essay history
func GetUserHistory(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.MustGet("userID").(uint)

		var essays []Essay
		result := db.Where("user_id = ?", userID).
			Order("created_at DESC").
			Limit(50).
			Find(&essays)

		if result.Error != nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "Failed to fetch history"})
			return
		}

		// Transform for frontend
		var history []gin.H
		for _, essay := range essays {
			var scores ScoreOut
			FromJSON(essay.BandsJSON, &scores)

			history = append(history, gin.H{
				"id":        essay.ID,
				"publicId":  essay.PublicID,
				"taskType":  essay.TaskType,
				"overall":   essay.Overall,
				"cefr":      essay.CEFR,
				"createdAt": essay.CreatedAt,
				"bands": gin.H{
					"ta":  scores.TA,
					"cc":  scores.CC,
					"lr":  scores.LR,
					"gra": scores.GRA,
				},
				"wordCount": len(essay.Text), // Rough estimate
			})
		}

		c.JSON(200, gin.H{
			"items": history,
			"total": len(history),
		})
	}
}

// Get user dashboard stats
func GetUserDashboard(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.MustGet("userID").(uint)
		user := c.MustGet("user").(User)

		// Count total essays
		var totalEssays int64
		db.Model(&Essay{}).Where("user_id = ?", userID).Count(&totalEssays)

		// Get recent essays for trend analysis
		var recentEssays []Essay
		db.Where("user_id = ?", userID).
			Order("created_at DESC").
			Limit(10).
			Find(&recentEssays)

		// Calculate stats
		var avgOverall float32
		var recentScores []float32
		var monthlyCount int64

		for _, essay := range recentEssays {
			avgOverall += essay.Overall
			recentScores = append(recentScores, essay.Overall)
		}

		if len(recentEssays) > 0 {
			avgOverall = avgOverall / float32(len(recentEssays))
		}

		// Count essays from last 30 days
		thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
		db.Model(&Essay{}).
			Where("user_id = ? AND created_at > ?", userID, thirtyDaysAgo).
			Count(&monthlyCount)

		// Get improvement trend
		var improvement string = "stable"
		if len(recentScores) >= 3 {
			recent := recentScores[0]
			older := recentScores[len(recentScores)-1]
			if recent > older+0.5 {
				improvement = "improving"
			} else if recent < older-0.5 {
				improvement = "declining"
			}
		}

		c.JSON(200, gin.H{
			"user": gin.H{
				"email":    user.Email,
				"plan":     user.Plan,
				"joinedAt": user.CreatedAt,
			},
			"stats": gin.H{
				"totalEssays":  totalEssays,
				"averageScore": avgOverall,
				"monthlyCount": monthlyCount,
				"improvement":  improvement,
				"recentScores": recentScores,
			},
		})
	}
}

// Get specific essay details
func GetEssayDetails(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.MustGet("userID").(uint)
		essayIDStr := c.Param("id")

		essayID, err := strconv.ParseUint(essayIDStr, 10, 32)
		if err != nil {
			c.AbortWithStatusJSON(400, gin.H{"error": "Invalid essay ID"})
			return
		}

		var essay Essay
		result := db.Where("id = ? AND user_id = ?", uint(essayID), userID).First(&essay)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				c.AbortWithStatusJSON(404, gin.H{"error": "Essay not found"})
			} else {
				c.AbortWithStatusJSON(500, gin.H{"error": "Database error"})
			}
			return
		}

		var scores ScoreOut
		FromJSON(essay.BandsJSON, &scores)

		c.JSON(200, gin.H{
			"id":        essay.ID,
			"publicId":  essay.PublicID,
			"taskType":  essay.TaskType,
			"text":      essay.Text,
			"overall":   essay.Overall,
			"cefr":      essay.CEFR,
			"feedback":  essay.Feedback,
			"createdAt": essay.CreatedAt,
			"bands": gin.H{
				"ta":  scores.TA,
				"cc":  scores.CC,
				"lr":  scores.LR,
				"gra": scores.GRA,
			},
		})
	}
}

// Delete user essay
func DeleteEssay(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.MustGet("userID").(uint)
		essayIDStr := c.Param("id")

		essayID, err := strconv.ParseUint(essayIDStr, 10, 32)
		if err != nil {
			c.AbortWithStatusJSON(400, gin.H{"error": "Invalid essay ID"})
			return
		}

		result := db.Where("id = ? AND user_id = ?", uint(essayID), userID).Delete(&Essay{})
		if result.Error != nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "Failed to delete essay"})
			return
		}

		if result.RowsAffected == 0 {
			c.AbortWithStatusJSON(404, gin.H{"error": "Essay not found"})
			return
		}

		c.JSON(200, gin.H{"message": "Essay deleted successfully"})
	}
}

// Update user profile
func UpdateProfile(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.MustGet("userID").(uint)

		var req struct {
			Email string `json:"email"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.AbortWithStatusJSON(400, gin.H{"error": "Invalid request"})
			return
		}

		// Check if email is already taken by another user
		var existingUser User
		result := db.Where("email = ? AND id != ?", req.Email, userID).First(&existingUser)
		if result.Error == nil {
			c.AbortWithStatusJSON(400, gin.H{"error": "Email already taken"})
			return
		}

		// Update user
		updateResult := db.Model(&User{}).Where("id = ?", userID).Update("email", req.Email)
		if updateResult.Error != nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "Failed to update profile"})
			return
		}

		c.JSON(200, gin.H{"message": "Profile updated successfully"})
	}
}
