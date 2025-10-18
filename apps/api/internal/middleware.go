package internal

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// JWT middleware to protect routes
func JWTAuth(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header required"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.AbortWithStatusJSON(401, gin.H{"error": "Bearer token required"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token claims"})
			return
		}

		userID, ok := claims["sub"].(float64)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid user ID in token"})
			return
		}

		// Verify user exists
		var user User
		if err := db.First(&user, uint(userID)).Error; err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "User not found"})
			return
		}

		c.Set("userID", uint(userID))
		c.Set("user", user)
		c.Next()
	}
}

// Enhanced rate limiting middleware with IP-based tracking to prevent account creation exploits
func RateLimit(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		clientIP := c.ClientIP()

		// Always track IP-based usage to prevent exploit
		ipKey := "rate_limit:ip:" + clientIP
		ipUsage, err := rdb.Get(ctx, ipKey).Int()
		if err != nil && err != redis.Nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "Rate limit check failed"})
			return
		}

		// Check if user is authenticated
		var isAuthenticated bool
		if _, exists := c.Get("userID"); exists {
			isAuthenticated = true
		}

		// Define limits
		const (
			ANONYMOUS_LIMIT     = 3  // Anonymous users: 3 requests per day
			AUTHENTICATED_LIMIT = 10 // Authenticated users: 10 requests per day (total from same IP)
			DAILY_EXPIRY        = 24 * time.Hour
		)

		var userType string
		if isAuthenticated {
			userType = "authenticated"
		} else {
			userType = "anonymous"
		}

		// Check if IP has exceeded the maximum daily limit (10) regardless of authentication status
		if ipUsage >= AUTHENTICATED_LIMIT {
			c.AbortWithStatusJSON(429, gin.H{
				"error":     "Daily rate limit exceeded for this IP address",
				"limit":     AUTHENTICATED_LIMIT,
				"used":      ipUsage,
				"remaining": 0,
				"resetTime": time.Now().Add(DAILY_EXPIRY).Unix(),
				"message":   "Maximum daily requests reached from this location. Please try again tomorrow.",
				"userType":  userType,
			})
			return
		}

		// For anonymous users, check if they've exceeded their 3-request limit
		if !isAuthenticated && ipUsage >= ANONYMOUS_LIMIT {
			remaining := AUTHENTICATED_LIMIT - ipUsage
			c.AbortWithStatusJSON(429, gin.H{
				"error":        "Anonymous rate limit exceeded",
				"limit":        ANONYMOUS_LIMIT,
				"used":         ipUsage,
				"remaining":    remaining,
				"resetTime":    time.Now().Add(DAILY_EXPIRY).Unix(),
				"message":      fmt.Sprintf("You've used your %d free analyses. Create an account to get %d more today!", ANONYMOUS_LIMIT, remaining),
				"userType":     userType,
				"suggestLogin": true,
			})
			return
		}

		// Increment IP counter
		pipe := rdb.Pipeline()
		pipe.Incr(ctx, ipKey)
		pipe.Expire(ctx, ipKey, DAILY_EXPIRY)
		_, err = pipe.Exec(ctx)
		if err != nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "Rate limit update failed"})
			return
		}

		// Calculate remaining requests
		var currentLimit int
		if isAuthenticated {
			currentLimit = AUTHENTICATED_LIMIT
		} else {
			currentLimit = ANONYMOUS_LIMIT
		}

		remaining := currentLimit - (ipUsage + 1)
		if remaining < 0 {
			remaining = 0
		}

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", currentLimit))
		c.Header("X-RateLimit-Used", fmt.Sprintf("%d", ipUsage+1))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(DAILY_EXPIRY).Unix()))
		c.Header("X-RateLimit-UserType", userType)

		c.Next()
	}
} // Optional auth middleware (doesn't block if no token)
func OptionalAuth(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.Next()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.Next()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.Next()
			return
		}

		userID, ok := claims["sub"].(float64)
		if !ok {
			c.Next()
			return
		}

		var user User
		if err := db.First(&user, uint(userID)).Error; err != nil {
			c.Next()
			return
		}

		c.Set("userID", uint(userID))
		c.Set("user", user)
		c.Next()
	}
}

// CORS middleware
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		// CORS headers
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset")

		// Security headers to prevent phishing warnings
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
