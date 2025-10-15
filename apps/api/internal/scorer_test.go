package internal

import (
	"testing"
)

func TestConvertMarkdownToHTML(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Convert bold markdown to HTML",
			input:    "This is **bold text** and this is normal.",
			expected: "This is <b>bold text</b> and this is normal.",
		},
		{
			name:     "Convert italic markdown to HTML",
			input:    "This is *italic text* and this is normal.",
			expected: "This is <i>italic text</i> and this is normal.",
		},
		{
			name:     "Convert both bold and italic",
			input:    "This has **bold** and *italic* text.",
			expected: "This has <b>bold</b> and <i>italic</i> text.",
		},
		{
			name:     "Multiple bold instances",
			input:    "**First bold** and **second bold** text.",
			expected: "<b>First bold</b> and <b>second bold</b> text.",
		},
		{
			name:     "No markdown formatting",
			input:    "This is plain text with no formatting.",
			expected: "This is plain text with no formatting.",
		},
		{
			name:     "IELTS feedback example",
			input:    "Your essay demonstrates **good task response** with clear main ideas. Work on **coherence** and *vocabulary* range.",
			expected: "Your essay demonstrates <b>good task response</b> with clear main ideas. Work on <b>coherence</b> and <i>vocabulary</i> range.",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertMarkdownToHTML(tt.input)
			if result != tt.expected {
				t.Errorf("convertMarkdownToHTML() = %v, want %v", result, tt.expected)
			}
		})
	}
}
