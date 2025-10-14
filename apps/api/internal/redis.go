package internal

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

// InitRedis initializes Redis client
func InitRedis() *redis.Client {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		// Fallback to basic config
		opt = &redis.Options{
			Addr:     "localhost:6379",
			Password: "",
			DB:       0,
		}
	}

	rdb := redis.NewClient(opt)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = rdb.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("Redis connection failed: %v\n", err)
		return nil // Return nil if Redis is not available
	}

	fmt.Println("Redis connected successfully")
	return rdb
}

// Cache essay analysis result
func CacheEssayAnalysis(rdb *redis.Client, text, taskType string, result ScoreOut) error {
	if rdb == nil {
		return nil // Skip caching if Redis not available
	}

	key := fmt.Sprintf("essay_cache:%s", HashEssay(text, taskType))
	data, err := json.Marshal(result)
	if err != nil {
		return err
	}

	ctx := context.Background()
	return rdb.Set(ctx, key, data, 24*time.Hour).Err()
}

// Get cached essay analysis
func GetCachedEssayAnalysis(rdb *redis.Client, text, taskType string) (*ScoreOut, error) {
	if rdb == nil {
		return nil, fmt.Errorf("redis not available")
	}

	key := fmt.Sprintf("essay_cache:%s", HashEssay(text, taskType))
	ctx := context.Background()

	data, err := rdb.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var result ScoreOut
	err = json.Unmarshal([]byte(data), &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

// Hash essay content for caching
func HashEssay(text, taskType string) string {
	content := fmt.Sprintf("%s:%s", taskType, text)
	hash := sha256.Sum256([]byte(content))
	return hex.EncodeToString(hash[:])[:16] // Use first 16 chars
}

// Store user session info
func SetUserSession(rdb *redis.Client, userID uint, sessionData map[string]interface{}) error {
	if rdb == nil {
		return nil
	}

	key := fmt.Sprintf("session:user:%d", userID)
	data, err := json.Marshal(sessionData)
	if err != nil {
		return err
	}

	ctx := context.Background()
	return rdb.Set(ctx, key, data, 24*time.Hour).Err()
}

// Get user session
func GetUserSession(rdb *redis.Client, userID uint) (map[string]interface{}, error) {
	if rdb == nil {
		return nil, fmt.Errorf("redis not available")
	}

	key := fmt.Sprintf("session:user:%d", userID)
	ctx := context.Background()

	data, err := rdb.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var sessionData map[string]interface{}
	err = json.Unmarshal([]byte(data), &sessionData)
	return sessionData, err
}
