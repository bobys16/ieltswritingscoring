package internal

import (
	"database/sql"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Admin Dashboard Stats
type AdminDashboardStats struct {
	TotalUsers       int64   `json:"totalUsers"`
	TotalEssays      int64   `json:"totalEssays"`
	TotalFeedback    int64   `json:"totalFeedback"`
	TotalBlogPosts   int64   `json:"totalBlogPosts"`
	DailyActiveUsers int64   `json:"dailyActiveUsers"`
	WeeklySignups    int64   `json:"weeklySignups"`
	AvgScore         float64 `json:"avgScore"`
	ConversionRate   float64 `json:"conversionRate"`
}

// User Management
type AdminUserResponse struct {
	ID         uint       `json:"id"`
	Email      string     `json:"email"`
	Plan       string     `json:"plan"`
	Role       string     `json:"role"`
	CreatedAt  time.Time  `json:"createdAt"`
	EssayCount int64      `json:"essayCount"`
	LastLogin  *time.Time `json:"lastLogin,omitempty"`
}

type UserUpdateRequest struct {
	Plan string `json:"plan"`
	Role string `json:"role"`
}

// Blog Management
type BlogCreateRequest struct {
	Title       string     `json:"title" binding:"required"`
	Slug        string     `json:"slug"`
	Excerpt     string     `json:"excerpt"`
	Content     string     `json:"content" binding:"required"`
	Category    string     `json:"category"`
	Tags        []string   `json:"tags"`
	ReadTime    string     `json:"readTime"`
	IsPublished bool       `json:"isPublished"`
	PublishedAt *time.Time `json:"publishedAt"`
}

type BlogUpdateRequest struct {
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Excerpt     string     `json:"excerpt"`
	Content     string     `json:"content"`
	Category    string     `json:"category"`
	Tags        []string   `json:"tags"`
	ReadTime    string     `json:"readTime"`
	IsPublished bool       `json:"isPublished"`
	PublishedAt *time.Time `json:"publishedAt"`
}

// Prompt Management
type PromptRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Prompt      string `json:"prompt" binding:"required"`
	Type        string `json:"type"`
	IsActive    bool   `json:"isActive"`
}

// GetAdminDashboard returns admin dashboard statistics
func GetAdminDashboard(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var stats AdminDashboardStats

		// Total users
		db.Model(&User{}).Count(&stats.TotalUsers)

		// Total essays
		db.Model(&Essay{}).Count(&stats.TotalEssays)

		// Total feedback
		db.Model(&UserFeedback{}).Count(&stats.TotalFeedback)

		// Total blog posts
		db.Model(&BlogPost{}).Count(&stats.TotalBlogPosts)

		// Daily active users (users who submitted essays in last 24h)
		yesterday := time.Now().AddDate(0, 0, -1)
		db.Model(&Essay{}).Where("created_at > ?", yesterday).
			Distinct("user_id").Count(&stats.DailyActiveUsers)

		// Weekly signups
		weekAgo := time.Now().AddDate(0, 0, -7)
		db.Model(&User{}).Where("created_at > ?", weekAgo).Count(&stats.WeeklySignups)

		// Average score
		var avgScore sql.NullFloat64
		db.Model(&Essay{}).Select("AVG(overall)").Scan(&avgScore)
		if avgScore.Valid {
			stats.AvgScore = math.Round(avgScore.Float64*100) / 100
		}

		// Conversion rate (users with essays / total users)
		var usersWithEssays int64
		db.Model(&User{}).
			Joins("LEFT JOIN essays ON users.id = essays.user_id").
			Where("essays.id IS NOT NULL").
			Distinct("users.id").
			Count(&usersWithEssays)

		if stats.TotalUsers > 0 {
			stats.ConversionRate = math.Round(float64(usersWithEssays)/float64(stats.TotalUsers)*10000) / 100
		}

		c.JSON(http.StatusOK, stats)
	}
}

// GetAdminUsers returns paginated list of users
func GetAdminUsers(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
		search := c.Query("search")
		role := c.Query("role")

		offset := (page - 1) * limit

		query := db.Model(&User{})

		if search != "" {
			query = query.Where("email ILIKE ?", "%"+search+"%")
		}

		if role != "" {
			query = query.Where("role = ?", role)
		}

		var total int64
		query.Count(&total)

		var users []User
		query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&users)

		// Get essay counts for each user
		var userResponses []AdminUserResponse
		for _, user := range users {
			var essayCount int64
			db.Model(&Essay{}).Where("user_id = ?", user.ID).Count(&essayCount)

			userResponses = append(userResponses, AdminUserResponse{
				ID:         user.ID,
				Email:      user.Email,
				Plan:       user.Plan,
				Role:       user.Role,
				CreatedAt:  user.CreatedAt,
				EssayCount: essayCount,
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"users": userResponses,
			"pagination": gin.H{
				"total": total,
				"page":  page,
				"limit": limit,
				"pages": int(math.Ceil(float64(total) / float64(limit))),
			},
		})
	}
}

// UpdateUser updates user plan or role
func UpdateUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("id")

		var req UserUpdateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		var user User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		updates := map[string]interface{}{}
		if req.Plan != "" {
			updates["plan"] = req.Plan
		}
		if req.Role != "" {
			updates["role"] = req.Role
		}

		if err := db.Model(&user).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "user updated successfully"})
	}
}

// DeleteUser deletes a user and their essays
func DeleteUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("id")

		var user User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		// Don't allow deleting admin users
		if user.Role == "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "cannot delete admin users"})
			return
		}

		// Delete user essays first
		db.Where("user_id = ?", userID).Delete(&Essay{})

		// Delete user
		if err := db.Delete(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "user deleted successfully"})
	}
}

// GetAdminBlogPosts returns all blog posts for admin
func GetAdminBlogPosts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var posts []BlogPost
		db.Order("created_at DESC").Find(&posts)

		c.JSON(http.StatusOK, gin.H{"posts": posts})
	}
}

// CreateBlogPost creates a new blog post
func CreateBlogPost(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req BlogCreateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		adminUser := c.MustGet("adminUser").(User)

		// Generate slug if not provided
		if req.Slug == "" {
			req.Slug = generateSlug(req.Title)
		}

		// Convert tags to JSON
		tagsJSON := ""
		if len(req.Tags) > 0 {
			tagsJSON = strings.Join(req.Tags, ",")
		}

		post := BlogPost{
			Title:       req.Title,
			Slug:        req.Slug,
			Excerpt:     req.Excerpt,
			Content:     req.Content,
			Category:    req.Category,
			Tags:        tagsJSON,
			ReadTime:    req.ReadTime,
			IsPublished: req.IsPublished,
			PublishedAt: req.PublishedAt,
			AuthorID:    adminUser.ID,
		}

		if req.IsPublished && req.PublishedAt == nil {
			now := time.Now()
			post.PublishedAt = &now
		}

		if err := db.Create(&post).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create blog post"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"post": post})
	}
}

// UpdateBlogPost updates an existing blog post
func UpdateBlogPost(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		postID := c.Param("id")

		var req BlogUpdateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		var post BlogPost
		if err := db.First(&post, postID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "blog post not found"})
			return
		}

		updates := map[string]interface{}{
			"title":        req.Title,
			"slug":         req.Slug,
			"excerpt":      req.Excerpt,
			"content":      req.Content,
			"category":     req.Category,
			"tags":         strings.Join(req.Tags, ","),
			"read_time":    req.ReadTime,
			"is_published": req.IsPublished,
			"published_at": req.PublishedAt,
		}

		if req.IsPublished && post.PublishedAt == nil && req.PublishedAt == nil {
			now := time.Now()
			updates["published_at"] = &now
		}

		if err := db.Model(&post).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update blog post"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "blog post updated successfully"})
	}
}

// DeleteBlogPost deletes a blog post
func DeleteBlogPost(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		postID := c.Param("id")

		var post BlogPost
		if err := db.First(&post, postID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "blog post not found"})
			return
		}

		if err := db.Delete(&post).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete blog post"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "blog post deleted successfully"})
	}
}

// GetAdminPrompts returns all admin prompts
func GetAdminPrompts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var prompts []AdminPrompt
		db.Order("created_at DESC").Find(&prompts)

		c.JSON(http.StatusOK, gin.H{"prompts": prompts})
	}
}

// CreatePrompt creates a new admin prompt
func CreatePrompt(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req PromptRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		prompt := AdminPrompt{
			Name:        req.Name,
			Description: req.Description,
			Prompt:      req.Prompt,
			Type:        req.Type,
			IsActive:    req.IsActive,
		}

		if err := db.Create(&prompt).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create prompt"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"prompt": prompt})
	}
}

// UpdatePrompt updates an existing prompt
func UpdatePrompt(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		promptID := c.Param("id")

		var req PromptRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		var prompt AdminPrompt
		if err := db.First(&prompt, promptID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "prompt not found"})
			return
		}

		updates := map[string]interface{}{
			"name":        req.Name,
			"description": req.Description,
			"prompt":      req.Prompt,
			"type":        req.Type,
			"is_active":   req.IsActive,
		}

		if err := db.Model(&prompt).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update prompt"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "prompt updated successfully"})
	}
}

// DeletePrompt deletes a prompt
func DeletePrompt(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		promptID := c.Param("id")

		var prompt AdminPrompt
		if err := db.First(&prompt, promptID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "prompt not found"})
			return
		}

		if err := db.Delete(&prompt).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete prompt"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "prompt deleted successfully"})
	}
}

// Helper function to generate slug from title
func generateSlug(title string) string {
	// Simple slug generation - convert to lowercase and replace spaces with hyphens
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove special characters except hyphens
	var result strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result.WriteRune(r)
		}
	}
	return result.String()
}
