// API Configuration
const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8080'

// API utility functions
export const apiConfig = {
  baseURL: API_BASE_URL,
  
  // Helper function to construct full API URLs
  getUrl: (endpoint: string): string => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    return `${API_BASE_URL}/${cleanEndpoint}`
  },

  // Helper function for fetch with default options
  fetch: async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const url = apiConfig.getUrl(endpoint)
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      }
    }

    return fetch(url, defaultOptions)
  }
}

export default apiConfig
