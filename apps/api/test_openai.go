package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/sashabaranov/go-openai"
)

func main() {
	_ = godotenv.Load()

	apiKey := os.Getenv("AI_KEY")
	if apiKey == "" {
		log.Fatal("AI_KEY not set")
	}

	fmt.Printf("API Key (first 10 chars): %s...\n", apiKey[:10])

	client := openai.NewClient(apiKey)

	resp, err := client.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: openai.GPT4oMini,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: "Say hello",
			},
		},
	})

	if err != nil {
		log.Fatal("OpenAI error:", err)
	}

	fmt.Printf("Response: %s\n", resp.Choices[0].Message.Content)
}
