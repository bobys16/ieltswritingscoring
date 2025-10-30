package internal

import (
	"bytes"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GenerateSitemap generates a dynamic XML sitemap including blog posts
func GenerateSitemap(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var buf bytes.Buffer

		// Write XML header
		buf.WriteString(`<?xml version="1.0" encoding="UTF-8"?>`)
		buf.WriteString("\n")
		buf.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`)
		buf.WriteString("\n")

		// Static pages with high priority
		staticPages := []struct {
			loc        string
			lastmod    string
			changefreq string
			priority   string
		}{
			{"/", time.Now().Format("2006-01-02"), "daily", "1.0"},
			{"/analyze", time.Now().Format("2006-01-02"), "weekly", "0.9"},
			{"/blog", time.Now().Format("2006-01-02"), "daily", "0.8"},
			{"/login", time.Now().Format("2006-01-02"), "monthly", "0.7"},
		}

		for _, page := range staticPages {
			buf.WriteString(fmt.Sprintf(`  <url>
    <loc>%s%s</loc>
    <lastmod>%s</lastmod>
    <changefreq>%s</changefreq>
    <priority>%s</priority>
  </url>
`, c.Request.Host, page.loc, page.lastmod, page.changefreq, page.priority))
		}

		// Add published blog posts
		if db != nil {
			var posts []BlogPost
			if err := db.Where("is_published = ?", true).Order("published_at DESC").Find(&posts).Error; err == nil {
				for _, post := range posts {
					lastmod := post.UpdatedAt.Format("2006-01-02")
					if post.PublishedAt != nil {
						lastmod = post.PublishedAt.Format("2006-01-02")
					}

					buf.WriteString(fmt.Sprintf(`  <url>
    <loc>https://%s/blog/%s</loc>
    <lastmod>%s</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`, "bandlyapp.com", post.Slug, lastmod))
				}
			}
		}

		buf.WriteString(`</urlset>`)
		buf.WriteString("\n")

		// Set response headers for XML
		c.Header("Content-Type", "application/xml; charset=utf-8")
		c.Header("Cache-Control", "public, max-age=86400") // Cache for 24 hours
		c.Data(http.StatusOK, "application/xml", buf.Bytes())
	}
}

// GenerateSitemapIndex generates a sitemap index (for large sites)
func GenerateSitemapIndex(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var buf bytes.Buffer

		buf.WriteString(`<?xml version="1.0" encoding="UTF-8"?>`)
		buf.WriteString("\n")
		buf.WriteString(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`)
		buf.WriteString("\n")
		buf.WriteString(fmt.Sprintf(`  <sitemap>
    <loc>https://bandlyapp.com/sitemap.xml</loc>
    <lastmod>%s</lastmod>
  </sitemap>
`, time.Now().Format("2006-01-02")))
		buf.WriteString(`</sitemapindex>`)
		buf.WriteString("\n")

		c.Header("Content-Type", "application/xml; charset=utf-8")
		c.Header("Cache-Control", "public, max-age=86400")
		c.Data(http.StatusOK, "application/xml", buf.Bytes())
	}
}
