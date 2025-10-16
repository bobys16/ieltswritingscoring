# BandLy

A professional, responsive web application where users can paste their IELTS essay and receive detailed scoring analysis including Task Achievement (TA), Coherence & Cohesion (CC), Lexical Resource (LR), and Grammatical Range & Accuracy (GRA) scores, along with an overall band score, CEFR mapping, personalized feedback, and downloadable/shareable reports.

**Created by SidigiGroup**  
Contact: info@sidiginesia.com | +62 8983474036

## 🚀 Features

- **AI-Powered Scoring**: Advanced AI analysis of IELTS Writing tasks with accurate band scoring
- **Comprehensive Feedback**: Detailed analysis across all four IELTS criteria
- **Visual Reports**: Interactive charts and downloadable PDF reports
- **User Authentication**: Secure JWT-based authentication system
- **Rate Limiting**: Fair usage with Redis-backed rate limiting
- **Responsive Design**: Mobile-first design with accessibility features
- **Real-time Analysis**: Fast essay analysis with caching for better performance

## 🛠 Tech Stack

### Frontend
- **Vite + React + TypeScript**: Modern development setup
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **React Router**: Client-side routing
- **Recharts**: Interactive data visualization

### Backend
- **Go + Gin**: Fast and lightweight web framework
- **GORM**: Object-relational mapping
- **PostgreSQL**: Robust relational database
- **Redis**: Caching and rate limiting
- **JWT**: Secure authentication

### Infrastructure
- **Docker + Docker Compose**: Containerized deployment
- **Nginx**: Reverse proxy and load balancing
- **OpenAPI**: API documentation

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Go** 1.21+
- **Docker** and Docker Compose
- **PostgreSQL** 15+ (for local development)
- **Redis** 7+ (for local development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/sidigigroup/bandly.git
cd bandly
```

### 2. Development Setup

```bash
# Install dependencies and set up development environment
make setup

# Start development servers (frontend and backend)
make dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080

### 3. Production Deployment

```bash
# Set up environment variables
cp infra/.env.example infra/.env
# Edit infra/.env with your configuration

# Deploy with Docker
make up
```

The production application will be available at:
- **Application**: http://localhost:80
- **API**: http://localhost:8080

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `infra/` directory:

```env
# Database
DB_DSN=postgres://ielts_user:ielts_password@db:5432/ielts_db?sslmode=disable

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_jwt_key

# AI Provider
AI_PROVIDER=openai
AI_KEY=your_openai_api_key

# Rate Limiting
RATE_LIMIT_PER_MIN=30

# Application
PUBLIC_BASE_URL=https://yourdomain.com
PORT=8080

# Redis
REDIS_URL=redis://redis:6379
```

### AI Provider Setup

The application supports OpenAI GPT models. To set up:

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Set the `AI_KEY` environment variable
3. Optionally configure the model in `apps/api/internal/scorer.go`

## 📁 Project Structure

```
ielts-band-estimator/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── pages/       # Page components
│   │   │   ├── hooks/       # Custom hooks
│   │   │   └── utils/       # Utility functions
│   │   └── public/          # Static assets
│   └── api/                 # Go backend
│       ├── internal/        # Internal packages
│       │   ├── models.go    # Database models
│       │   ├── handlers.go  # HTTP handlers
│       │   ├── auth.go      # Authentication
│       │   ├── scorer.go    # AI scoring logic
│       │   └── redis.go     # Redis operations
│       └── main.go          # Application entry point
├── infra/                   # Infrastructure
│   ├── docker-compose.yml  # Docker services
│   ├── nginx.conf           # Nginx configuration
│   └── deploy.sh            # Deployment script
└── docs/                    # Documentation
```
