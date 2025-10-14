package internal

import (
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

// Rate limiting middleware using Redis
func RateLimit(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from JWT or use IP for anonymous users
		var key string
		if userID, exists := c.Get("userID"); exists {
			user := c.MustGet("user").(User)
			// Authenticated users get more requests
			if user.Plan == "pro" {
				key = "rate_limit:user:pro:" + userID.(string)
			} else {
				key = "rate_limit:user:free:" + userID.(string)
			}
		} else {
			// Anonymous users (limited requests)
			key = "rate_limit:ip:" + c.ClientIP()
		}

		// Check current count
		ctx := c.Request.Context()
		current, err := rdb.Get(ctx, key).Int()
		if err != nil && err != redis.Nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "Rate limit check failed"})
			return
		}

		// Set limits based on user type
		var limit int
		if strings.Contains(key, "pro") {
			limit = 50 // Pro users: 50 requests per hour
		} else if strings.Contains(key, "free") {
			limit = 10 // Free users: 10 requests per hour
		} else {
			limit = 3 // Anonymous: 3 requests per hour
		}

		if current >= limit {
			c.AbortWithStatusJSON(429, gin.H{
				"error":       "Rate limit exceeded",
				"limit":       limit,
				"resetTime":   time.Now().Add(time.Hour).Unix(),
				"suggestion":  "Sign up for more requests or upgrade to Pro",
			})
			return
		}

		// Increment counter
		pipe := rdb.Pipeline()
		pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, time.Hour)
		_, err = pipe.Exec(ctx)
		if err != nil {
			c.AbortWithStatusJSON(500, gin.H{"error": "Rate limit update failed"})
			return
		}

		// Add rate limit headers
		c.Header("X-RateLimit-Limit", string(rune(limit)))
		c.Header("X-RateLimit-Remaining", string(rune(limit-current-1)))
		c.Header("X-RateLimit-Reset", string(rune(time.Now().Add(time.Hour).Unix())))

		c.Next()
	}
}

// Optional auth middleware (doesn't block if no token)
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
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
