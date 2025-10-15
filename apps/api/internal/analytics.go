package internal

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// AnalyticsEvent represents a user action event
type AnalyticsEvent struct {
	ID        uint   `gorm:"primaryKey"`
	EventType string `gorm:"index"` // page_view, essay_analyze, download_pdf, share, signup, login
	UserID    *uint  `gorm:"index"` // nil for anonymous users
	SessionID string `gorm:"index"` // for tracking anonymous sessions
	IPAddress string `gorm:"index"`
	UserAgent string
	Referrer  string
	Page      string
	Data      string    `gorm:"type:TEXT"` // JSON for additional event data
	CreatedAt time.Time `gorm:"index"`
}

// TrackEvent logs an analytics event
func TrackEvent(db *gorm.DB, rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			EventType string                 `json:"eventType"`
			Page      string                 `json:"page"`
			Data      map[string]interface{} `json:"data"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": "invalid request"})
			return
		}

		// Get session info
		sessionID := c.GetHeader("X-Session-ID")
		if sessionID == "" {
			sessionID = generateSessionID()
		}

		// Get user ID if authenticated
		var userID *uint
		if uid, exists := c.Get("userID"); exists {
			if id, ok := uid.(uint); ok {
				userID = &id
			}
		}

		// Create analytics event
		event := AnalyticsEvent{
			EventType: request.EventType,
			UserID:    userID,
			SessionID: sessionID,
			IPAddress: c.ClientIP(),
			UserAgent: c.GetHeader("User-Agent"),
			Referrer:  c.GetHeader("Referer"),
			Page:      request.Page,
			Data:      ToJSON(request.Data),
			CreatedAt: time.Now(),
		}

		// Save to database
		if err := db.Create(&event).Error; err != nil {
			// Don't fail the request for analytics issues
			c.JSON(200, gin.H{"status": "error", "sessionId": sessionID})
			return
		}

		// Update real-time metrics in Redis
		if rdb != nil {
			ctx := c.Request.Context()
			today := time.Now().Format("2006-01-02")

			// Daily counters
			rdb.Incr(ctx, "analytics:daily:"+today+":"+request.EventType)
			rdb.Expire(ctx, "analytics:daily:"+today+":"+request.EventType, 30*24*time.Hour)

			// Hourly counters for real-time tracking
			hour := time.Now().Format("2006-01-02-15")
			rdb.Incr(ctx, "analytics:hourly:"+hour+":"+request.EventType)
			rdb.Expire(ctx, "analytics:hourly:"+hour+":"+request.EventType, 48*time.Hour)
		}

		c.JSON(200, gin.H{"status": "ok", "sessionId": sessionID})
	}
}

// GetAnalytics returns analytics data for dashboard
func GetAnalytics(db *gorm.DB, rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only allow authenticated admin users (for now, any authenticated user)
		if _, exists := c.Get("userID"); !exists {
			c.JSON(401, gin.H{"error": "unauthorized"})
			return
		}

		period := c.DefaultQuery("period", "7d") // 7d, 30d, 90d

		var stats struct {
			TotalUsers       int64   `json:"totalUsers"`
			TotalEssays      int64   `json:"totalEssays"`
			TotalPageViews   int64   `json:"totalPageViews"`
			ConversionRate   float64 `json:"conversionRate"`
			DailyActiveUsers int64   `json:"dailyActiveUsers"`
		}

		// Calculate date range
		var startDate time.Time
		switch period {
		case "30d":
			startDate = time.Now().AddDate(0, 0, -30)
		case "90d":
			startDate = time.Now().AddDate(0, 0, -90)
		default: // 7d
			startDate = time.Now().AddDate(0, 0, -7)
		}

		// Get basic stats
		db.Model(&User{}).Count(&stats.TotalUsers)
		db.Model(&Essay{}).Count(&stats.TotalEssays)
		db.Model(&AnalyticsEvent{}).Where("event_type = ? AND created_at > ?", "page_view", startDate).Count(&stats.TotalPageViews)

		// Calculate conversion rate (essays / page views)
		var essayAnalytics int64
		db.Model(&AnalyticsEvent{}).Where("event_type = ? AND created_at > ?", "essay_analyze", startDate).Count(&essayAnalytics)

		if stats.TotalPageViews > 0 {
			stats.ConversionRate = float64(essayAnalytics) / float64(stats.TotalPageViews) * 100
		}

		// Daily active users (unique sessions in last 24h)
		yesterday := time.Now().AddDate(0, 0, -1)
		db.Model(&AnalyticsEvent{}).
			Where("created_at > ?", yesterday).
			Distinct("session_id").
			Count(&stats.DailyActiveUsers)

		c.JSON(200, stats)
	}
}

func generateSessionID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
