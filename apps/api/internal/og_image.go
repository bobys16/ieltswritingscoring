package internal

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang/freetype"
	"golang.org/x/image/font/gofont/goregular"
	"gorm.io/gorm"
)

// OGImageHandler generates Open Graph images for shared reports
func OGImageHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		publicId := c.Param("publicId")

		var essay Essay
		if err := db.First(&essay, "public_id = ?", publicId).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "report not found"})
			return
		}

		// Parse the bands JSON
		var scoreResult ScoreOut
		if err := FromJSON(essay.BandsJSON, &scoreResult); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid report data"})
			return
		}

		// Generate the OG image
		img, err := generateOGImage(scoreResult)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate image"})
			return
		}

		// Set appropriate headers
		c.Header("Content-Type", "image/png")
		c.Header("Cache-Control", "public, max-age=86400") // Cache for 24 hours

		// Encode and serve the image
		var buf bytes.Buffer
		if err := png.Encode(&buf, img); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to encode image"})
			return
		}

		c.Data(http.StatusOK, "image/png", buf.Bytes())
	}
}

// generateOGImage creates a beautiful OG image for the report
func generateOGImage(score ScoreOut) (image.Image, error) {
	// Image dimensions (1200x630 for optimal OG display)
	width, height := 1200, 630
	img := image.NewRGBA(image.Rect(0, 0, width, height))

	// Create gradient background (brand blue to purple)
	for y := 0; y < height; y++ {
		factor := float64(y) / float64(height)
		r := uint8(58 + factor*30)  // 58 -> 88
		g := uint8(122 + factor*70) // 122 -> 192
		b := uint8(254 - factor*50) // 254 -> 204

		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{r, g, b, 255})
		}
	}

	// Load font
	fontBytes := goregular.TTF
	f, err := freetype.ParseFont(fontBytes)
	if err != nil {
		return nil, err
	}

	// Create freetype context
	c := freetype.NewContext()
	c.SetDPI(72)
	c.SetFont(f)
	c.SetSrc(image.NewUniform(color.RGBA{255, 255, 255, 255})) // White text
	c.SetDst(img)

	// Draw main title
	c.SetFontSize(48)
	title := "IELTS Band Score"
	pt := freetype.Pt(60, 80)
	if _, err := c.DrawString(title, pt); err != nil {
		return nil, err
	}

	// Draw the overall band score (large)
	c.SetFontSize(120)
	overallText := fmt.Sprintf("%.1f", score.Overall)
	pt = freetype.Pt(60, 240)
	if _, err := c.DrawString(overallText, pt); err != nil {
		return nil, err
	}

	// Draw "Overall Band" label
	c.SetFontSize(32)
	pt = freetype.Pt(60, 280)
	if _, err := c.DrawString("Overall Band", pt); err != nil {
		return nil, err
	}

	// Draw CEFR level
	c.SetFontSize(36)
	cefrText := fmt.Sprintf("CEFR: %s", score.CEFR)
	pt = freetype.Pt(60, 330)
	if _, err := c.DrawString(cefrText, pt); err != nil {
		return nil, err
	}

	// Draw individual scores
	c.SetFontSize(28)
	scores := []struct {
		label string
		value float32
		y     int
	}{
		{"Task Achievement", score.TA, 420},
		{"Coherence & Cohesion", score.CC, 460},
		{"Lexical Resource", score.LR, 500},
		{"Grammar Range & Accuracy", score.GRA, 540},
	}

	for _, s := range scores {
		scoreText := fmt.Sprintf("%s: %.1f", s.label, s.value)
		pt = freetype.Pt(60, s.y)
		if _, err := c.DrawString(scoreText, pt); err != nil {
			return nil, err
		}
	}

	// Draw website URL
	c.SetFontSize(24)
	c.SetSrc(image.NewUniform(color.RGBA{255, 255, 255, 200})) // Semi-transparent white
	pt = freetype.Pt(width-400, height-30)
	if _, err := c.DrawString("bandly.com", pt); err != nil {
		return nil, err
	}

	// Draw decorative elements (circles for visual appeal)
	drawCircle(img, width-150, 150, 80, color.RGBA{255, 255, 255, 30})
	drawCircle(img, width-250, 400, 60, color.RGBA{255, 255, 255, 20})
	drawCircle(img, width-100, 500, 40, color.RGBA{255, 255, 255, 25})

	return img, nil
}

// drawCircle draws a filled circle on the image
func drawCircle(img *image.RGBA, centerX, centerY, radius int, c color.RGBA) {
	for y := centerY - radius; y <= centerY+radius; y++ {
		for x := centerX - radius; x <= centerX+radius; x++ {
			dx := x - centerX
			dy := y - centerY
			if dx*dx+dy*dy <= radius*radius {
				if x >= 0 && y >= 0 && x < img.Bounds().Max.X && y < img.Bounds().Max.Y {
					img.Set(x, y, c)
				}
			}
		}
	}
}
