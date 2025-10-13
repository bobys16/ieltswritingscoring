package internal

import "encoding/json"

// ToJSON converts a value to JSON string
func ToJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

// FromJSON parses JSON string into a value
func FromJSON(s string, v interface{}) error {
	return json.Unmarshal([]byte(s), v)
}
