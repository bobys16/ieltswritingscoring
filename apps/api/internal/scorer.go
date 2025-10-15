package internal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/sashabaranov/go-openai"
)

type ScoreOut struct {
	TA       float32 `json:"ta"`
	CC       float32 `json:"cc"`
	LR       float32 `json:"lr"`
	GRA      float32 `json:"gra"`
	Overall  float32 `json:"overall"`
	Feedback string  `json:"feedback"`
	CEFR     string  `json:"cefr"`
}

// clampBand ensures band scores are in valid 0.5 increments between 0-9
func clampBand(x float32) float32 {
	if x < 0 {
		return 0
	}
	if x > 9 {
		return 9
	}
	// Round to nearest 0.5
	return float32(int(x*2+0.5)) / 2
}

// MapOverallToCEFR maps IELTS band to CEFR level
func MapOverallToCEFR(overall float32) string {
	if overall >= 8.5 {
		return "C2"
	}
	if overall >= 7.5 {
		return "C1"
	}
	if overall >= 6.0 {
		return "B2"
	}
	if overall >= 4.0 {
		return "B1"
	}
	return "A2"
}

var wsRegex = regexp.MustCompile(`\s+`)

// MinWordsOK checks if essay meets word count requirements
func MinWordsOK(text string) bool {
	words := len(strings.Fields(wsRegex.ReplaceAllString(text, " ")))
	return words >= 150 && words <= 320
}

// BuildPrompt creates the system and user prompts for OpenAI with expert-level IELTS assessment
func BuildPrompt(taskType, promptText, essayText string) (system, user string) {
	system = `You are a Senior IELTS Writing Examiner with 25 years of experience, holding Band 8.5-9.0 proficiency yourself. You have assessed over 50,000 essays and are known for your strict but fair evaluation standards.

Your expertise includes:
- Deep understanding of IELTS official band descriptors (2023 version)
- Ability to distinguish between band 6.5 vs 7.0 with precision
- Recognition of common candidate errors and their impact on scoring
- Calibrated assessment against Cambridge IELTS authentic samples

ASSESSMENT METHODOLOGY:
1. Read the essay completely first
2. Analyze each criterion independently using official descriptors
3. Cross-validate scores for consistency
4. Provide specific, actionable feedback citing exact examples

BAND DESCRIPTORS (be extremely precise):

TASK ACHIEVEMENT (Task 2) / TASK RESPONSE (Task 1):
- Band 9: Fully addresses all parts, clear position throughout, fully extended ideas
- Band 8: Sufficiently addresses all parts, clear position, well-developed ideas
- Band 7: Addresses all parts, clear position throughout, main ideas extended
- Band 6: Addresses all parts but some more fully, relevant position, some unclear ideas
- Band 5: Addresses task only partially, position unclear, limited idea development

COHERENCE AND COHESION:
- Band 9: Cohesion natural, no effort required by reader, wide range of devices
- Band 8: Sequences information logically, wide range of cohesive devices
- Band 7: Logically organizes information, clear progression, range of devices
- Band 6: Arranges information coherently, overall progression, some inappropriate linking
- Band 5: Presents information with some organization, inadequate/inaccurate linking

LEXICAL RESOURCE:
- Band 9: Wide range with full flexibility, natural/sophisticated usage, rare errors
- Band 8: Wide range with flexibility, less common items, occasional inappropriacies
- Band 7: Sufficient range with flexibility, less common vocabulary, some errors
- Band 6: Adequate range for task, attempts less common vocabulary, some errors
- Band 5: Limited range, repetition, inappropriate word choice, errors may impede

GRAMMATICAL RANGE AND ACCURACY:
- Band 9: Full range with full flexibility, accurate usage, error-free
- Band 8: Wide range with flexibility, majority error-free, occasional slips
- Band 7: Range of complex structures, frequent error-free sentences, good control
- Band 6: Mix of simple/complex sentences, some errors but communication clear
- Band 5: Limited range, attempts complex but with errors, frequent errors

CRITICAL ASSESSMENT PRINCIPLES:
- Be STRICT: Band 7+ requires genuine proficiency, not just adequate responses
- Penalize heavily: Repetitive vocabulary, basic grammar, unclear arguments
- Reward excellence: Sophisticated language, nuanced arguments, flawless execution
- Common Band 6.5 trap: Essays that seem "good" but lack Band 7 sophistication
- Band 8+ is rare: Reserve for genuinely excellent essays with minimal flaws

ERROR IMPACT ASSESSMENT:
- Minor slips (articles, prepositions): -0.5 to GRA only
- Word choice errors affecting meaning: -1.0 to LR, possible TA impact
- Grammar errors impeding communication: -1.0+ to GRA, possible CC impact
- Off-topic content: Severe TA penalty (-2.0 or more)
- Insufficient word count: Automatic TA penalty (-1.0 minimum)

FEEDBACK REQUIREMENTS:
- Cite SPECIFIC examples from the essay
- Explain WHY scores were given (reference band descriptors)
- Provide actionable improvement strategies
- Identify the ONE most critical area for improvement
- Include what the candidate did well (positive reinforcement)

Return ONLY this JSON structure:
{"ta":number,"cc":number,"lr":number,"gra":number,"overall":number,"feedback":"...","cefr":"A1|A2|B1|B2|C1|C2"}

REMEMBER: You are NOT being helpful - you are being ACCURATE to IELTS standards. Many essays that seem "okay" are actually Band 6.0-6.5. Be rigorous.`

	taskPrompt := promptText
	if taskPrompt == "" {
		if taskType == "task1" {
			taskPrompt = "Describe the information shown in the chart, graph, table or diagram."
		} else {
			taskPrompt = "Present a clear position on the given topic with supporting arguments."
		}
	}

	// Count words for assessment context
	wordCount := len(strings.Fields(wsRegex.ReplaceAllString(essayText, " ")))

	user = fmt.Sprintf(`ASSESSMENT REQUEST:

Task Type: %s
Word Count: %d words
Task Prompt: %s

CANDIDATE ESSAY:
%s

ASSESSMENT INSTRUCTIONS:
1. Analyze each criterion separately against official band descriptors
2. Be especially critical of:
   - Task achievement: Does it FULLY address the prompt?
   - Vocabulary sophistication: Is it genuinely varied or repetitive?
   - Grammar complexity: Are complex structures used accurately?
   - Coherence: Is progression crystal clear throughout?

3. Consider these common mistakes that lower scores:
   - Generic examples instead of specific ones
   - Simple coordinator overuse (and, but, so)
   - Basic vocabulary with failed attempts at sophistication
   - Grammar errors in complex sentences (lower GRA significantly)
   - Unclear position or argument development

4. Your assessment should reflect the standards of a Senior Examiner who has seen thousands of essays.

Provide scores and detailed feedback now.`, taskType, wordCount, taskPrompt, essayText)
	return
}

// CallOpenAI makes the API call to OpenAI with optimized settings for IELTS assessment
func CallOpenAI(ctx context.Context, apiKey, system, user string) (string, error) {
	client := openai.NewClient(apiKey)

	resp, err := client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model:       openai.GPT4TurboPreview, // Use GPT-4 Turbo for superior reasoning
		Temperature: 0.1,                     // Lower temperature for more consistent scoring
		MaxTokens:   800,                     // More tokens for detailed feedback
		TopP:        0.95,                    // Slightly focused responses
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: system,
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: user,
			},
		},
	})

	if err != nil {
		return "", fmt.Errorf("OpenAI API error: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", errors.New("no response from OpenAI")
	}

	return resp.Choices[0].Message.Content, nil
}

// ScoreEssay performs the complete essay analysis with enhanced accuracy
func ScoreEssay(ctx context.Context, apiKey, taskType, promptText, essayText string) (ScoreOut, error) {
	system, user := BuildPrompt(taskType, promptText, essayText)

	// Primary assessment with GPT-4
	raw, err := CallOpenAI(ctx, apiKey, system, user)
	if err != nil {
		// If OpenAI fails, use sophisticated fallback
		return generateFallbackScore(essayText, taskType), nil
	}

	// Parse primary response
	primaryScore, parseErr := parseAIResponse(raw)
	if parseErr != nil {
		// Retry once with stricter prompt
		retrySystem := system + "\n\nCRITICAL: Your previous response was invalid JSON. You MUST return ONLY the JSON object with no additional text or explanations."
		raw, retryErr := CallOpenAI(ctx, apiKey, retrySystem, user)
		if retryErr != nil {
			return generateFallbackScore(essayText, taskType), nil
		}

		primaryScore, parseErr = parseAIResponse(raw)
		if parseErr != nil {
			return generateFallbackScore(essayText, taskType), nil
		}
	}

	// Validate and enhance the response
	enhancedScore := validateAndEnhanceScore(primaryScore, essayText, taskType)
	
	return enhancedScore, nil
}

// parseAIResponse extracts and validates JSON from AI response
func parseAIResponse(raw string) (ScoreOut, error) {
	// Clean the response
	raw = strings.TrimSpace(raw)
	
	// Remove markdown code blocks if present
	if strings.Contains(raw, "```") {
		lines := strings.Split(raw, "\n")
		var cleanLines []string
		inCodeBlock := false
		for _, line := range lines {
			if strings.Contains(line, "```") {
				inCodeBlock = !inCodeBlock
				continue
			}
			if !inCodeBlock {
				cleanLines = append(cleanLines, line)
			}
		}
		raw = strings.Join(cleanLines, "\n")
	}
	
	// Extract JSON object
	start := strings.Index(raw, "{")
	end := strings.LastIndex(raw, "}")
	if start >= 0 && end > start {
		raw = raw[start : end+1]
	}

	var out ScoreOut
	if err := json.Unmarshal([]byte(raw), &out); err != nil {
		return ScoreOut{}, fmt.Errorf("JSON parse error: %w", err)
	}

	return out, nil
}

// validateAndEnhanceScore ensures scores are realistic and adds quality checks
func validateAndEnhanceScore(score ScoreOut, essayText, taskType string) ScoreOut {
	// Apply IELTS band constraints
	score.TA = clampBand(score.TA)
	score.CC = clampBand(score.CC)
	score.LR = clampBand(score.LR)
	score.GRA = clampBand(score.GRA)

	// Calculate overall if not provided or inconsistent
	calculatedOverall := clampBand((score.TA + score.CC + score.LR + score.GRA) / 4)
	if score.Overall == 0 || abs(score.Overall-calculatedOverall) > 0.5 {
		score.Overall = calculatedOverall
	} else {
		score.Overall = clampBand(score.Overall)
	}

	// Quality checks for unrealistic high scores
	words := len(strings.Fields(wsRegex.ReplaceAllString(essayText, " ")))
	
	// Penalize for insufficient word count
	if words < 200 {
		// Significant TA penalty for under-length essays
		score.TA = min(score.TA, 5.5)
		score.Overall = clampBand((score.TA + score.CC + score.LR + score.GRA) / 4)
	}
	
	// Cross-validation: High scores should be rare and justified
	if score.Overall >= 8.0 {
		// Additional validation for high scores
		if !isHighScoreJustified(essayText, score) {
			// Conservative adjustment for unjustified high scores
			score.TA = min(score.TA, 7.5)
			score.CC = min(score.CC, 7.5)
			score.LR = min(score.LR, 7.5)
			score.GRA = min(score.GRA, 7.5)
			score.Overall = clampBand((score.TA + score.CC + score.LR + score.GRA) / 4)
		}
	}

	// Set CEFR based on final overall score
	score.CEFR = MapOverallToCEFR(score.Overall)

	// Enhance feedback if too generic
	if len(score.Feedback) < 50 || strings.Contains(score.Feedback, "good essay") {
		score.Feedback = enhanceFeedback(score, essayText, taskType)
	}

	return score
}

// isHighScoreJustified checks if Band 8+ scores are warranted
func isHighScoreJustified(essayText string, score ScoreOut) bool {
	text := strings.ToLower(essayText)
	
	// Check for sophisticated vocabulary
	advancedVocab := []string{"unprecedented", "comprehensive", "substantial", "meticulous", 
							"profound", "intricate", "nuanced", "paradigm", "prevalent", 
							"culminate", "exacerbate", "mitigate", "implement", "facilitate"}
	vocabCount := 0
	for _, word := range advancedVocab {
		if strings.Contains(text, word) {
			vocabCount++
		}
	}
	
	// Check for complex grammar structures
	complexStructures := []string{"having been", "were to", "not only", "no sooner", 
								"it is imperative that", "were it not for", "should there be"}
	grammarCount := 0
	for _, structure := range complexStructures {
		if strings.Contains(text, structure) {
			grammarCount++
		}
	}
	
	// High scores require evidence of sophistication
	return vocabCount >= 3 && grammarCount >= 1 && len(essayText) >= 250
}

// enhanceFeedback provides detailed, criterion-specific feedback
func enhanceFeedback(score ScoreOut, essayText, taskType string) string {
	var feedback strings.Builder
	
	// Opening assessment
	if score.Overall >= 7.5 {
		feedback.WriteString("This essay demonstrates strong writing proficiency. ")
	} else if score.Overall >= 6.5 {
		feedback.WriteString("This essay shows competent writing with clear potential for improvement. ")
	} else {
		feedback.WriteString("This essay requires significant development to meet higher IELTS standards. ")
	}

	// Specific criterion analysis
	feedback.WriteString("Specific areas: ")
	
	if score.TA < 7.0 {
		if taskType == "task2" {
			feedback.WriteString("Task Achievement - ensure all parts of the question are fully addressed with well-developed arguments; ")
		} else {
			feedback.WriteString("Task Achievement - provide a clearer overview and select key features more effectively; ")
		}
	}
	
	if score.CC < 7.0 {
		feedback.WriteString("Coherence & Cohesion - improve logical sequencing and use more sophisticated linking devices; ")
	}
	
	if score.LR < 7.0 {
		feedback.WriteString("Lexical Resource - expand vocabulary range and use less common words accurately; ")
	}
	
	if score.GRA < 7.0 {
		feedback.WriteString("Grammar - increase complex sentence variety while maintaining accuracy. ")
	}

	// Priority recommendation
	lowestScore := min(min(score.TA, score.CC), min(score.LR, score.GRA))
	if lowestScore == score.TA {
		feedback.WriteString("Priority: Focus on task response and argument development.")
	} else if lowestScore == score.CC {
		feedback.WriteString("Priority: Focus on paragraph organization and linking.")
	} else if lowestScore == score.LR {
		feedback.WriteString("Priority: Focus on vocabulary sophistication and accuracy.")
	} else {
		feedback.WriteString("Priority: Focus on grammatical range and complex structures.")
	}

	return feedback.String()
}

// Helper function for absolute difference
func abs(x float32) float32 {
	if x < 0 {
		return -x
	}
	return x
}

// generateFallbackScore provides sophisticated heuristic scoring when OpenAI is unavailable
func generateFallbackScore(essayText, taskType string) ScoreOut {
	words := len(strings.Fields(wsRegex.ReplaceAllString(essayText, " ")))
	text := strings.ToLower(essayText)
	
	// Initialize conservative scores (most essays are Band 6.0-6.5 range)
	var ta, cc, lr, gra float32 = 6.0, 5.5, 6.0, 5.5

	// TASK ACHIEVEMENT ANALYSIS
	paragraphs := strings.Split(essayText, "\n\n")
	
	// Basic TA scoring
	if words >= 250 && words <= 290 {
		ta += 0.5 // Good word count management
	}
	if len(paragraphs) >= 4 {
		ta += 0.5 // Proper essay structure
	}
	
	// COHERENCE AND COHESION ANALYSIS
	linkingWords := []string{"however", "furthermore", "moreover", "nevertheless", "consequently", 
							"in addition", "on the other hand", "in contrast", "therefore", "thus"}
	linkingCount := 0
	for _, word := range linkingWords {
		if strings.Contains(text, word) {
			linkingCount++
		}
	}
	if linkingCount >= 3 {
		cc += 0.5
	}
	if linkingCount >= 5 {
		cc += 0.5 // Sophisticated linking
	}

	// LEXICAL RESOURCE ANALYSIS
	// Check for vocabulary sophistication
	sophisticatedWords := []string{"significant", "substantial", "considerable", "phenomenon", 
									"crucial", "vital", "essential", "demonstrate", "illustrate", 
									"indicate", "suggest", "reveal", "evident", "apparent"}
	vocabScore := 0
	for _, word := range sophisticatedWords {
		if strings.Contains(text, word) {
			vocabScore++
		}
	}
	if vocabScore >= 3 {
		lr += 0.5
	}
	if vocabScore >= 6 {
		lr += 0.5
	}

	// Check for repetition (penalty)
	commonWords := strings.Fields(text)
	wordFreq := make(map[string]int)
	for _, word := range commonWords {
		if len(word) > 4 { // Only check meaningful words
			wordFreq[word]++
		}
	}
	repetitionPenalty := 0
	for _, freq := range wordFreq {
		if freq > 3 {
			repetitionPenalty++
		}
	}
	if repetitionPenalty > 2 {
		lr -= 0.5 // Penalize excessive repetition
	}

	// GRAMMATICAL RANGE AND ACCURACY
	// Check for complex sentences
	complexMarkers := []string{"which", "that", "although", "while", "whereas", "if", "unless", "despite"}
	complexCount := 0
	for _, marker := range complexMarkers {
		complexCount += strings.Count(text, marker)
	}
	if complexCount >= 3 {
		gra += 0.5
	}
	if complexCount >= 6 {
		gra += 0.5
	}

	// Check for basic errors (simple heuristic)
	commonErrors := []string{"a university", "an university", "much people", "less people", 
							"more better", "most best", "in the other hand"}
	errorCount := 0
	for _, error := range commonErrors {
		if strings.Contains(text, error) {
			errorCount++
		}
	}
	if errorCount > 0 {
		gra -= float32(errorCount) * 0.5
	}

	// Ensure realistic upper limits (fallback should rarely exceed Band 7.0)
	ta = clampBand(min(ta, 7.0))
	cc = clampBand(min(cc, 7.0))
	lr = clampBand(min(lr, 7.0))
	gra = clampBand(min(gra, 7.0))

	overall := clampBand((ta + cc + lr + gra) / 4)

	// Generate detailed, specific feedback
	feedback := generateDetailedFeedback(ta, cc, lr, gra, words, taskType)

	return ScoreOut{
		TA:       ta,
		CC:       cc,
		LR:       lr,
		GRA:      gra,
		Overall:  overall,
		CEFR:     MapOverallToCEFR(overall),
		Feedback: feedback,
	}
}

// Helper function for min comparison
func min(a, b float32) float32 {
	if a < b {
		return a
	}
	return b
}

// generateDetailedFeedback creates specific feedback based on scores
func generateDetailedFeedback(ta, cc, lr, gra float32, words int, taskType string) string {
	var feedback strings.Builder
	
	// Overall assessment
	overall := (ta + cc + lr + gra) / 4
	if overall >= 7.0 {
		feedback.WriteString("Your essay demonstrates good competence in IELTS Writing. ")
	} else if overall >= 6.0 {
		feedback.WriteString("Your essay shows adequate writing ability with room for improvement. ")
	} else {
		feedback.WriteString("Your essay needs significant development to meet IELTS standards. ")
	}

	// Specific criterion feedback
	if ta < 6.5 {
		if taskType == "task2" {
			feedback.WriteString("Ensure you address all parts of the question and develop your arguments more fully. ")
		} else {
			feedback.WriteString("Provide a clearer overview and highlight key features more effectively. ")
		}
	}

	if cc < 6.5 {
		feedback.WriteString("Improve paragraph organization and use more varied linking devices to enhance coherence. ")
	}

	if lr < 6.5 {
		feedback.WriteString("Expand your vocabulary range and avoid repetition by using synonyms and less common words. ")
	}

	if gra < 6.5 {
		feedback.WriteString("Work on using more complex sentence structures while maintaining grammatical accuracy. ")
	}

	// Word count feedback
	if words < 250 {
		feedback.WriteString("Consider writing more to fully develop your ideas (aim for 250+ words). ")
	} else if words > 290 {
		feedback.WriteString("Be more concise to stay within the recommended word limit. ")
	}

	// Constructive ending
	feedback.WriteString("Focus on your weakest criterion for the most significant improvement.")

	return feedback.String()
}
